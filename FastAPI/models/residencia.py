"""Modelos de Pydantic para las residencias y los usuarios de las residencias."""


from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional


class ResidenciaCreate(BaseModel):
    numero: str
    calle: str
    referencia: Optional[str] = None
    colonia_id: UUID

class Residencia(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    numero: str
    calle: str
    referencia: Optional[str] = None
    ubicacion: Optional[dict] = None
    colonia_id: UUID
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            UUID: str,
            datetime: lambda dt: dt.isoformat()
        }

class ResidenciaUsuarioCreate(BaseModel):
    usuario_id: UUID
    residencia_id: UUID
    rol: str = "residente"  # Valores posibles: "propietario", "residente", "inquilino", etc.
    es_principal: bool = False
    verificado: bool = False

class ResidenciaUsuario(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    usuario_id: UUID
    residencia_id: UUID
    rol: str
    es_principal: bool = False
    verificado: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            UUID: str,
            datetime: lambda dt: dt.isoformat()
        }