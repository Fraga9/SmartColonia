# models.py

from pydantic import BaseModel, Field, EmailStr
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional


# ------------------------ Usuarios ------------------------
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


# ------------------------ Colonias ------------------------
class Colonia(BaseModel):
    id: UUID = Field(default_factory=uuid4)  # Genera UUID automáticamente
    nombre: str
    direccion: str
    admin_principal_id: Optional[UUID] = None  # Hace explícitamente opcional
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            UUID: str,
            datetime: lambda dt: dt.isoformat()
        }

class ColoniaCreate(BaseModel):
    nombre: str
    direccion: str
    admin_principal_id: Optional[UUID] = None

# ------------------------ Residencias ------------------------

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


# ------------------------ Visitas ------------------------


class Visita(BaseModel):
    id: UUID
    nombre_visitante: str
    apellido_visitante: str
    tipo: str  # 'Visita', 'Servicio', 'Recurrente'
    fecha_programada: datetime
    residencia_id: UUID
    usuario_id: UUID
    codigo_qr: Optional[str]
    created_at: datetime
    updated_at: datetime
