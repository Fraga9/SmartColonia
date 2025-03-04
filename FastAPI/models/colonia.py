" Modelo de datos para colonias "


from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

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
