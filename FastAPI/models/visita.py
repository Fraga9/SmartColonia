""" Modelo de la tabla visita """

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


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
