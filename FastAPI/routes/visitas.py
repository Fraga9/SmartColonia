from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
import logging
from database import get_db
from models.visita import Visita, VisitaCreate
from crud.visitas import (
    create_visita, get_visitas, get_visita_by_id,
    get_visitas_by_residencia, get_visitas_by_usuario,
    get_visitas_activas_by_residencia, update_visita,
    delete_visita, scan_visita_qr, get_visitas_by_fecha
)

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=Visita)
async def create_visita_route(visita_data: VisitaCreate, db=Depends(get_db)):
    """Crea una nueva visita."""
    try:
        created_visita = create_visita(visita_data, db)
        return created_visita
    except Exception as e:
        logger.error(f"Error al crear visita: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/", response_model=List[Visita])
async def get_visitas_route(
    residencia_id: Optional[UUID] = None,
    usuario_id: Optional[UUID] = None,
    activas: bool = None,
    fecha_inicio: Optional[datetime] = None,
    fecha_fin: Optional[datetime] = None,
    db=Depends(get_db)
):
    """
    Obtiene visitas con filtros opcionales:
    - Si se proporciona residencia_id, filtra por residencia
    - Si se proporciona usuario_id, filtra por usuario
    - Si activas=True, solo devuelve visitas activas
    - Si se proporcionan fecha_inicio y fecha_fin, filtra por rango de fechas
    """
    try:
        # Filtrar por residencia
        if residencia_id is not None and activas is True:
            visitas_data = get_visitas_activas_by_residencia(residencia_id, db)
        elif residencia_id is not None:
            visitas_data = get_visitas_by_residencia(residencia_id, db)
        # Filtrar por usuario
        elif usuario_id is not None:
            visitas_data = get_visitas_by_usuario(usuario_id, db)
        # Filtrar por fecha
        elif fecha_inicio is not None and fecha_fin is not None:
            visitas_data = get_visitas_by_fecha(fecha_inicio, fecha_fin, db)
        # Sin filtros
        else:
            visitas_data = get_visitas(db)
        
        return [Visita(**visita) for visita in visitas_data]
    except Exception as e:
        logger.error(f"Error al obtener visitas: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/{visita_id}", response_model=Visita)
async def get_visita_route(visita_id: UUID, db=Depends(get_db)):
    """Obtiene una visita por su ID."""
    visita = get_visita_by_id(visita_id, db)
    if not visita:
        raise HTTPException(status_code=404, detail="Visita no encontrada")
    return visita

@router.put("/{visita_id}", response_model=Visita)
async def update_visita_route(visita_id: UUID, visita_data: dict, db=Depends(get_db)):
    """Actualiza una visita existente."""
    try:
        updated_visita = update_visita(visita_id, visita_data, db)
        return updated_visita
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al actualizar visita: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.delete("/{visita_id}", response_model=dict)
async def delete_visita_route(visita_id: UUID, db=Depends(get_db)):
    """Elimina una visita."""
    try:
        delete_visita(visita_id, db)
        return {"message": "Visita eliminada correctamente"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al eliminar visita: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.post("/{visita_id}/scan", response_model=Visita)
async def scan_visita_qr_route(visita_id: UUID, db=Depends(get_db)):
    """Registra el escaneo de un QR de visita."""
    try:
        updated_visita = scan_visita_qr(visita_id, db)
        return updated_visita
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error al escanear QR de visita: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/residencia/{residencia_id}", response_model=List[Visita])
async def get_visitas_by_residencia_route(residencia_id: UUID, activas: bool = False, db=Depends(get_db)):
    """Obtiene las visitas de una residencia específica."""
    try:
        if activas:
            visitas_data = get_visitas_activas_by_residencia(residencia_id, db)
        else:
            visitas_data = get_visitas_by_residencia(residencia_id, db)
        
        return [Visita(**visita) for visita in visitas_data]
    except Exception as e:
        logger.error(f"Error al obtener visitas por residencia: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/usuario/{usuario_id}", response_model=List[Visita])
async def get_visitas_by_usuario_route(usuario_id: UUID, db=Depends(get_db)):
    """Obtiene las visitas creadas por un usuario específico."""
    try:
        visitas_data = get_visitas_by_usuario(usuario_id, db)
        return [Visita(**visita) for visita in visitas_data]
    except Exception as e:
        logger.error(f"Error al obtener visitas por usuario: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/fecha/rango", response_model=List[Visita])
async def get_visitas_by_fecha_route(
    fecha_inicio: datetime = Query(..., description="Fecha de inicio (formato ISO)"),
    fecha_fin: datetime = Query(..., description="Fecha fin (formato ISO)"),
    db=Depends(get_db)
):
    """Obtiene visitas programadas en un rango de fechas."""
    try:
        visitas_data = get_visitas_by_fecha(fecha_inicio, fecha_fin, db)
        return [Visita(**visita) for visita in visitas_data]
    except Exception as e:
        logger.error(f"Error al obtener visitas por fecha: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")