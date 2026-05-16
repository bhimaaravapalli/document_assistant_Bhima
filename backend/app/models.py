"""SQLAlchemy ORM models. SQLite friendly: integer PKs only."""

import json
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    queries = relationship("QueryLog", back_populates="user")

    def to_dict(self) -> dict:
        return {"id": self.id, "name": self.name, "email": self.email}


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(512), nullable=False)
    file_type = Column(String(16), nullable=False, default="pdf")
    file_hash = Column(String(64), nullable=False, unique=True, index=True)
    file_size = Column(Integer, nullable=False, default=0)
    page_count = Column(Integer, nullable=True)
    chunk_count = Column(Integer, default=0)
    status = Column(String(32), default="completed")  # completed | processing | failed
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "filename": self.filename,
            "file_type": self.file_type,
            "file_hash": self.file_hash,
            "status": self.status,
            "page_count": self.page_count,
            "chunk_count": self.chunk_count,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "metadata_json": json.dumps({"size": self.file_size}),
        }


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    doc_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_idx = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    page_num = Column(Integer, nullable=True)
    faiss_idx = Column(Integer, nullable=True)

    document = relationship("Document", back_populates="chunks")

    __table_args__ = (Index("ix_chunks_doc_chunk", "doc_id", "chunk_idx"),)


class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    sources_json = Column(Text, nullable=True)  # JSON-encoded list of {filename, page}
    latency_ms = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="queries")

    def to_dict(self) -> dict:
        try:
            sources = json.loads(self.sources_json) if self.sources_json else []
        except Exception:
            sources = []
        return {
            "id": self.id,
            "query": self.question,
            "answer": self.answer,
            "sources": sources,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
            "confidence": 95,
        }
