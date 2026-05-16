"""Minimal RAG pipeline.

Stack:
  - sentence-transformers all-MiniLM-L6-v2  (90 MB, 384-dim, fast)
  - FAISS IndexFlatIP                       (cosine, file-persisted)
  - Groq llama-3.1-8b-instant               (free LLM)

No reranker, no BM25, no sparse fusion. Plain dense retrieval that
runs comfortably on a laptop without a GPU.
"""

from __future__ import annotations

import hashlib
import io
import json
import logging
import os
import re
import time
from pathlib import Path
from typing import Optional

import faiss
import numpy as np
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

from .models import Chunk, Document

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths & constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = BASE_DIR / "uploads"
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

INDEX_FILE = DATA_DIR / "faiss.index"
MAP_FILE = DATA_DIR / "faiss.map.json"

CHUNK_SIZE = 800
CHUNK_OVERLAP = 150
TOP_K = 5
EMBED_DIM = 384
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

DEFAULT_MODELS = {
    "groq": "llama-3.1-8b-instant",
    "openai": "gpt-4o-mini",
    "google": "gemini-1.5-flash",
}

# ---------------------------------------------------------------------------
# Lazy singletons
# ---------------------------------------------------------------------------
_embedder: Optional[SentenceTransformer] = None
_faiss_index: Optional[faiss.IndexFlatIP] = None
_faiss_id_to_chunk_id: list[int] = []


def _get_embedder() -> SentenceTransformer:
    global _embedder
    if _embedder is None:
        logger.info("[rag] Loading embedding model (%s)…", EMBED_MODEL)
        _embedder = SentenceTransformer(EMBED_MODEL)
    return _embedder


def _load_faiss() -> None:
    global _faiss_index, _faiss_id_to_chunk_id
    if INDEX_FILE.exists() and MAP_FILE.exists():
        _faiss_index = faiss.read_index(str(INDEX_FILE))
        with open(MAP_FILE) as f:
            _faiss_id_to_chunk_id = json.load(f)
        logger.info("[rag] Loaded FAISS index (%d vectors).", _faiss_index.ntotal)
    else:
        _faiss_index = faiss.IndexFlatIP(EMBED_DIM)
        _faiss_id_to_chunk_id = []
        logger.info("[rag] Created fresh FAISS index.")


def _save_faiss() -> None:
    faiss.write_index(_faiss_index, str(INDEX_FILE))
    with open(MAP_FILE, "w") as f:
        json.dump(_faiss_id_to_chunk_id, f)


def init_rag() -> None:
    """Called once on app startup."""
    _load_faiss()


# ---------------------------------------------------------------------------
# Text helpers
# ---------------------------------------------------------------------------
def compute_file_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def extract_text_from_pdf(data: bytes) -> tuple[str, int]:
    reader = PdfReader(io.BytesIO(data))
    pages: list[str] = []
    for i, page in enumerate(reader.pages):
        text = (page.extract_text() or "").strip()
        if text:
            pages.append(f"[PAGE {i + 1}]\n{text}")
    return "\n\n".join(pages), len(reader.pages)


def chunk_text(text: str) -> list[dict]:
    """Sliding-window chunking with page tracking."""
    parts = re.split(r"\[PAGE (\d+)\]\n", text)
    segments: list[tuple[Optional[int], str]] = []
    if parts and parts[0].strip():
        segments.append((None, parts[0]))
    i = 1
    while i < len(parts) - 1:
        try:
            page_num = int(parts[i])
        except ValueError:
            page_num = None
        segments.append((page_num, parts[i + 1]))
        i += 2

    chunks: list[dict] = []
    for page_num, content in segments:
        content = content.strip()
        if not content:
            continue
        start = 0
        while start < len(content):
            piece = content[start : start + CHUNK_SIZE].strip()
            if piece:
                chunks.append({"text": piece, "page_num": page_num})
            start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


def embed_texts(texts: list[str]) -> np.ndarray:
    vecs = _get_embedder().encode(texts, show_progress_bar=False, batch_size=32)
    vecs = np.asarray(vecs, dtype=np.float32)
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)
    return vecs / norms


# ---------------------------------------------------------------------------
# Indexing
# ---------------------------------------------------------------------------
def index_document(db: Session, doc: Document, chunks: list[dict]) -> int:
    """Embed + write chunks to FAISS and SQLite."""
    global _faiss_index, _faiss_id_to_chunk_id

    if not chunks:
        return 0

    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts)

    db_chunks: list[Chunk] = []
    for i, c in enumerate(chunks):
        ch = Chunk(
            doc_id=doc.id,
            chunk_idx=i,
            text=c["text"],
            page_num=c.get("page_num"),
        )
        db.add(ch)
        db_chunks.append(ch)
    db.flush()

    base = _faiss_index.ntotal
    for offset, ch in enumerate(db_chunks):
        ch.faiss_idx = base + offset
        _faiss_id_to_chunk_id.append(ch.id)

    _faiss_index.add(embeddings)
    db.commit()
    _save_faiss()
    return len(chunks)


def reindex_all(db: Session) -> None:
    """Rebuild FAISS from scratch using the current set of active chunks."""
    global _faiss_index, _faiss_id_to_chunk_id

    rows = (
        db.query(Chunk)
        .join(Document)
        .filter(Document.is_active.is_(True))
        .order_by(Chunk.id)
        .all()
    )

    _faiss_index = faiss.IndexFlatIP(EMBED_DIM)
    _faiss_id_to_chunk_id = []

    if rows:
        embeddings = embed_texts([r.text for r in rows])
        _faiss_index.add(embeddings)
        for offset, ch in enumerate(rows):
            ch.faiss_idx = offset
            _faiss_id_to_chunk_id.append(ch.id)
        db.commit()

    _save_faiss()


# ---------------------------------------------------------------------------
# Retrieval + generation
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are DocAssist, a friendly AI document assistant.\n\n"
    "Behavior rules:\n"
    "1. If document context is provided in the user message, answer the user's "
    "question primarily from that context. Be specific and cite naturally. "
    "If the answer truly isn't in the context, say so politely and suggest "
    "what they could try (rephrase, upload more docs, etc.).\n"
    "2. If NO document context is provided, you can still have a normal "
    "conversation: greetings, introductions, explaining what you can do. "
    "If the user is asking about specific document content but none is "
    "available, gently tell them to upload a PDF first.\n"
    "3. Keep answers concise, professional, and easy to read."
)


def _resolve_provider() -> tuple[str, str, str] | tuple[None, None, None]:
    """Return (provider, api_key, model) based on environment.

    Resolution order:
      1. Explicit LLM_PROVIDER env var (groq | openai | google).
      2. Auto-detect from whichever API key is set, in order: openai, google, groq.
    """
    keys = {
        "groq": os.environ.get("GROQ_API_KEY", "").strip(),
        "openai": os.environ.get("OPENAI_API_KEY", "").strip(),
        "google": os.environ.get("GOOGLE_API_KEY", "").strip(),
    }

    forced = os.environ.get("LLM_PROVIDER", "").strip().lower()
    if forced in keys and keys[forced]:
        provider = forced
    else:
        for candidate in ("openai", "google", "groq"):
            if keys[candidate]:
                provider = candidate
                break
        else:
            return None, None, None

    model = os.environ.get("LLM_MODEL", "").strip() or DEFAULT_MODELS[provider]
    return provider, keys[provider], model


def _call_groq(api_key: str, model: str, user_msg: str) -> str:
    from groq import Groq

    client = Groq(api_key=api_key)
    resp = client.chat.completions.create(
        model=model,
        temperature=0.1,
        max_tokens=1024,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ],
    )
    return (resp.choices[0].message.content or "").strip()


def _call_openai(api_key: str, model: str, user_msg: str) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    resp = client.chat.completions.create(
        model=model,
        temperature=0.1,
        max_tokens=1024,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ],
    )
    return (resp.choices[0].message.content or "").strip()


def _call_google(api_key: str, model: str, user_msg: str) -> str:
    import google.generativeai as genai

    genai.configure(api_key=api_key)
    gm = genai.GenerativeModel(
        model_name=model,
        system_instruction=SYSTEM_PROMPT,
        generation_config={"temperature": 0.1, "max_output_tokens": 1024},
    )
    resp = gm.generate_content(user_msg)
    return (getattr(resp, "text", "") or "").strip()


_PROVIDER_DISPATCH = {
    "groq": _call_groq,
    "openai": _call_openai,
    "google": _call_google,
}


def _generate(question: str, contexts: list[Chunk]) -> str:
    provider, api_key, model = _resolve_provider()
    if not provider:
        return (
            "No LLM API key configured. Set one of GROQ_API_KEY, "
            "OPENAI_API_KEY, or GOOGLE_API_KEY in backend/.env."
        )

    if contexts:
        context_block = "\n\n---\n\n".join(
            f"[Chunk {i + 1}] {c.text}" for i, c in enumerate(contexts)
        )
        user_msg = (
            f"Context from uploaded documents:\n{context_block}\n\n"
            f"Question: {question}\n\nAnswer:"
        )
    else:
        user_msg = question

    try:
        return _PROVIDER_DISPATCH[provider](api_key, model, user_msg)
    except Exception as e:
        logger.exception("[rag] LLM call failed (provider=%s model=%s)", provider, model)
        return f"LLM error ({provider}): {e}"


def get_active_provider() -> dict:
    """Used by the API + startup logger to report which provider is active."""
    provider, _, model = _resolve_provider()
    return {"provider": provider, "model": model}


def retrieve_and_answer(
    db: Session,
    question: str,
    doc_ids: Optional[list[int]] = None,
) -> dict:
    t0 = time.time()

    ordered: list[Chunk] = []

    if _faiss_index is not None and _faiss_index.ntotal > 0:
        q_vec = embed_texts([question])
        fetch = min(TOP_K * 4, _faiss_index.ntotal)
        _scores, indices = _faiss_index.search(q_vec, fetch)

        candidate_chunk_ids: list[int] = []
        for idx in indices[0]:
            if 0 <= idx < len(_faiss_id_to_chunk_id):
                candidate_chunk_ids.append(_faiss_id_to_chunk_id[idx])

        if candidate_chunk_ids:
            q = (
                db.query(Chunk)
                .join(Document)
                .filter(Chunk.id.in_(candidate_chunk_ids))
                .filter(Document.is_active.is_(True))
            )
            if doc_ids:
                q = q.filter(Chunk.doc_id.in_(doc_ids))
            chunk_map = {ch.id: ch for ch in q.all()}

            for cid in candidate_chunk_ids:
                ch = chunk_map.get(cid)
                if ch:
                    ordered.append(ch)
                if len(ordered) >= TOP_K:
                    break

    answer = _generate(question, ordered)

    seen: set[tuple[str, Optional[int]]] = set()
    sources: list[dict] = []
    for ch in ordered:
        key = (ch.document.filename, ch.page_num)
        if key in seen:
            continue
        seen.add(key)
        sources.append({"filename": ch.document.filename, "page": ch.page_num})

    return {
        "answer": answer,
        "sources": sources,
        "latency_ms": round((time.time() - t0) * 1000, 1),
    }


def get_index_size() -> int:
    return _faiss_index.ntotal if _faiss_index is not None else 0
