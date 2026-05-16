"""FastAPI entrypoint for DocAssist.

All routes are mounted under `/api` to match the frontend.
"""

from __future__ import annotations

import json
import logging
import uuid
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

from fastapi import (
    APIRouter,
    Depends,
    FastAPI,
    File,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import auth, rag
from .database import get_db, init_db
from .models import Document, QueryLog, User
from .schemas import AuthOut, LoginIn, QueryIn, RegisterIn, UserOut

logging.basicConfig(
    level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

app = FastAPI(title="DocAssist API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    rag.init_rag()
    info = rag.get_active_provider()
    if info["provider"]:
        logger.info("LLM provider: %s (model=%s)", info["provider"], info["model"])
    else:
        logger.warning(
            "No LLM API key found. Set GROQ_API_KEY, OPENAI_API_KEY, or "
            "GOOGLE_API_KEY in backend/.env."
        )
    logger.info("DocAssist API ready.")


api = APIRouter(prefix="/api")


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@api.get("/health")
def health() -> dict:
    info = rag.get_active_provider()
    return {
        "status": "ok",
        "llm_provider": info["provider"],
        "llm_model": info["model"],
    }


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
@api.post("/auth/register", response_model=AuthOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)) -> AuthOut:
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    user = User(
        name=payload.name.strip(),
        email=payload.email.lower(),
        password_hash=auth.hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = auth.create_access_token(user.id)
    return AuthOut(access_token=token, user=UserOut(**user.to_dict()))


@api.post("/auth/login", response_model=AuthOut)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> AuthOut:
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not auth.verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    token = auth.create_access_token(user.id)
    return AuthOut(access_token=token, user=UserOut(**user.to_dict()))


@api.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(auth.get_current_user)) -> UserOut:
    return UserOut(**user.to_dict())


# ---------------------------------------------------------------------------
# Documents
# ---------------------------------------------------------------------------
@api.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(auth.get_current_user_optional),
):
    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400, detail="Only PDF files are supported right now."
        )

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 25 MB).")

    file_hash = rag.compute_file_hash(data)
    existing = db.query(Document).filter(Document.file_hash == file_hash).first()
    if existing:
        return existing.to_dict()

    try:
        full_text, page_count = rag.extract_text_from_pdf(data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not read PDF: {e}")

    if not full_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No extractable text found (is this a scanned PDF?).",
        )

    chunks = rag.chunk_text(full_text)
    if not chunks:
        raise HTTPException(status_code=422, detail="Chunking produced no output.")

    save_path = rag.UPLOADS_DIR / f"{uuid.uuid4().hex}.pdf"
    save_path.write_bytes(data)

    doc = Document(
        filename=filename,
        file_type="pdf",
        file_hash=file_hash,
        file_size=len(data),
        page_count=page_count,
        chunk_count=len(chunks),
        status="completed",
        owner_id=current_user.id if current_user else None,
    )
    db.add(doc)
    db.flush()

    rag.index_document(db, doc, chunks)
    db.refresh(doc)
    logger.info("Indexed %s (%d chunks)", filename, len(chunks))
    return doc.to_dict()


@api.get("/documents/")
def list_documents(db: Session = Depends(get_db)) -> list[dict]:
    docs = (
        db.query(Document)
        .filter(Document.is_active.is_(True))
        .order_by(Document.uploaded_at.desc())
        .all()
    )
    return [d.to_dict() for d in docs]


@api.get("/documents/{doc_id}")
def get_document(doc_id: int, db: Session = Depends(get_db)) -> dict:
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc.to_dict()


@api.delete("/documents/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)) -> dict:
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    doc.is_active = False
    db.commit()
    rag.reindex_all(db)
    return {"message": "Document deleted.", "id": doc_id}


# ---------------------------------------------------------------------------
# Chat / RAG
# ---------------------------------------------------------------------------
@api.post("/chat/query")
def chat_query(
    payload: QueryIn,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(auth.get_current_user_optional),
) -> dict:
    question = payload.query.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    result = rag.retrieve_and_answer(db, question, doc_ids=payload.doc_ids)

    log = QueryLog(
        user_id=current_user.id if current_user else None,
        question=question,
        answer=result["answer"],
        sources_json=json.dumps(result["sources"]),
        latency_ms=result["latency_ms"],
    )
    db.add(log)
    db.commit()
    return result


@api.get("/chat/history")
def chat_history(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(auth.get_current_user_optional),
) -> list[dict]:
    q = db.query(QueryLog).order_by(QueryLog.created_at.desc()).limit(100)
    if current_user:
        q = q.filter(QueryLog.user_id == current_user.id)
    return [log.to_dict() for log in q.all()]


# ---------------------------------------------------------------------------
# Stats (for Dashboard)
# ---------------------------------------------------------------------------
@api.get("/stats")
def stats(db: Session = Depends(get_db)) -> dict:
    total_documents = (
        db.query(Document).filter(Document.is_active.is_(True)).count()
    )
    total_queries = db.query(QueryLog).count()
    active_users = db.query(User).count()

    recent_uploads = (
        db.query(Document)
        .filter(Document.is_active.is_(True))
        .order_by(Document.uploaded_at.desc())
        .limit(3)
        .all()
    )
    recent_queries = (
        db.query(QueryLog).order_by(QueryLog.created_at.desc()).limit(3).all()
    )

    recent_activity: list[dict] = []
    for d in recent_uploads:
        recent_activity.append(
            {
                "type": "upload",
                "user": "You",
                "target": d.filename,
                "time": d.uploaded_at.strftime("%b %d, %H:%M") if d.uploaded_at else "",
                "status": d.status.title(),
            }
        )
    for q_log in recent_queries:
        recent_activity.append(
            {
                "type": "query",
                "user": "You",
                "target": (q_log.question[:60] + "…")
                if len(q_log.question) > 60
                else q_log.question,
                "time": q_log.created_at.strftime("%b %d, %H:%M")
                if q_log.created_at
                else "",
                "status": "Answered",
            }
        )

    return {
        "total_documents": total_documents,
        "total_queries": total_queries,
        "active_users": active_users,
        "compliance_score": 98,
        "recent_activity": recent_activity,
    }


app.include_router(api)
