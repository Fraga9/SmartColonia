from fastapi import APIRouter, Depends, HTTPException
from typing import List
import logging
from uuid import UUID
from database import get_db
from models.residencia import Residencia, ResidenciaCreate, ResidenciaUsuario, ResidenciaUsuarioCreate
from crud.residencias import (
    create_residencia, get_residencias, get_residencia_by_id,
    create_residencia_usuario, get_residencias_by_usuario,
    verificar_residencia_usuario
)

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=Residencia)
async def create_residencia_route(residencia_data: ResidenciaCreate, db=Depends(get_db)):
    """Crea una nueva residencia."""
    try:
        created_residencia = create_residencia(residencia_data, db)
        return created_residencia
    except Exception as e:
        logger.error(f"Error al crear residencia: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/", response_model=List[Residencia])
async def get_residencias_route(db=Depends(get_db)):
    """Obtiene todas las residencias."""
    residencias = get_residencias(db)
    return residencias

@router.get("/{residencia_id}", response_model=Residencia)
async def get_residencia_route(residencia_id: UUID, db=Depends(get_db)):
    """Obtiene una residencia por su ID."""
    residencia = get_residencia_by_id(residencia_id, db)
    if not residencia:
        raise HTTPException(status_code=404, detail="Residencia no encontrada")
    return residencia

# Ruta para asociar usuario-residencia
@router.post("/usuarios", response_model=ResidenciaUsuario)
async def create_residencia_usuario_route(residencia_usuario_data: ResidenciaUsuarioCreate, db=Depends(get_db)):
    """Asocia un usuario a una residencia."""
    try:
        created = create_residencia_usuario(residencia_usuario_data, db)
        return created
    except Exception as e:
        logger.error(f"Error al asociar usuario a residencia: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    

@router.get("/usuarios/{usuario_id}", response_model=List[Residencia])
async def get_residencias_by_usuario_route(usuario_id: UUID, db=Depends(get_db)):
    """Obtiene todas las residencias asociadas a un usuario."""
    try:
        residencias = get_residencias_by_usuario(usuario_id, db)
        return [Residencia(**residencia) for residencia in residencias]
    except Exception as e:
        logger.error(f"Error al obtener residencias del usuario: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")



@router.patch("/usuarios/verificar/{residencia_id}/{usuario_id}")
async def verificar_residencia_usuario_route(residencia_id: UUID, usuario_id: UUID, db=Depends(get_db)):
    """Marca como verificada la relación entre un usuario y una residencia."""
    success = verificar_residencia_usuario(residencia_id, usuario_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Relación residencia-usuario no encontrada")
    return {"message": "Relación verificada correctamente"}

