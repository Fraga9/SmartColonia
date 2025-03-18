""" Modelo de la tabla visita """

from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime, timedelta
from typing import Optional


class VisitaCreate(BaseModel):
    nombre_visitante: str
    apellido_visitante: str
    identificacion: str
    tipo: str  # 'Visita', 'Servicio', 'Recurrente'
    fecha_programada: datetime
    residencia_id: UUID
    usuario_id: UUID
    activa: bool = False


class Visita(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    nombre_visitante: str
    apellido_visitante: str
    identificacion: str
    tipo: str  # 'Visita', 'Servicio', 'Recurrente'
    fecha_programada: datetime
    residencia_id: UUID
    usuario_id: UUID
    codigo_qr: Optional[str] = None
    qr_activo: bool = True
    fecha_expiracion: Optional[datetime] = Field(
        default_factory=lambda: datetime.utcnow() + timedelta(hours=24)
    )
    activa: bool = False
    fecha_escaneo: Optional[datetime] = None
    escaneo_exitoso: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            UUID: str,
            datetime: lambda dt: dt.isoformat()
        }