"""Modelo de Anuncio"""

from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional


class AnuncioCreate(BaseModel):
    titulo: str
    contenido: str
    usuario_id: UUID
    colonia_id: UUID
    importante: bool = False
    fecha_publicacion: Optional[datetime] = Field(default_factory=datetime.utcnow)
    fecha_expiracion: Optional[datetime] = None
    
class Anuncio(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    titulo: str
    contenido: str
    usuario_id: UUID
    colonia_id: UUID
    importante: bool = False
    fecha_publicacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_expiracion: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            UUID: str,
            datetime: lambda dt: dt.isoformat()
        }