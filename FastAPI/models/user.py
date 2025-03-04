
"""User model module."""

from pydantic import BaseModel, Field, EmailStr
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr  
    password: str
    nombre: str
    apellido: str
    telefono: Optional[str] = None
    tipo_usuario_id: int
    colonia_id: Optional[UUID] = None
    activo: bool = True

class User(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    email: str
    password_hash: Optional[str] = None
    nombre: str
    apellido: str
    telefono: Optional[str] = None
    tipo_usuario_id: int
    colonia_id: Optional[UUID] = None
    activo: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            UUID: str,
            datetime: lambda dt: dt.isoformat()
        }