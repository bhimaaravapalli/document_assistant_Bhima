"""Pydantic request/response schemas."""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr


class AuthOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class QueryIn(BaseModel):
    query: str = Field(..., min_length=1)
    doc_ids: Optional[list[int]] = None
