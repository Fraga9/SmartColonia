from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from models.anuncio import Anuncio, AnuncioCreate
from crud.anuncios import (
    create_anuncio,
    get_anuncios,
    get_anuncio_by_id,
    get_anuncios_by_colonia,
    update_anuncio,
    delete_anuncio
)
from database import get_db
import logging

router = APIRouter(prefix="/anuncios", tags=["anuncios"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=Anuncio)
async def create_anuncio_route(anuncio_data: AnuncioCreate, db=Depends(get_db)):
    """Crea un nuevo anuncio."""
    try:
        created_anuncio = create_anuncio(anuncio_data, db)
        return created_anuncio
    except Exception as e:
        logger.error(f"Error al crear anuncio: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/", response_model=List[Anuncio])
async def get_anuncios_route(db=Depends(get_db)):
    """Obtiene todos los anuncios."""
    anuncios = get_anuncios(db)
    return anuncios

@router.get("/{anuncio_id}", response_model=Anuncio)
async def get_anuncio_route(anuncio_id: UUID, db=Depends(get_db)):
    """Obtiene un anuncio por su ID."""
    anuncio = get_anuncio_by_id(anuncio_id, db)
    if not anuncio:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    return anuncio

@router.get("/colonia/{colonia_id}", response_model=List[Anuncio])
async def get_anuncios_by_colonia_route(colonia_id: UUID, db=Depends(get_db)):
    """Obtiene todos los anuncios de una colonia específica."""
    anuncios = get_anuncios_by_colonia(colonia_id, db)
    return anuncios

@router.put("/{anuncio_id}", response_model=Anuncio)
async def update_anuncio_route(anuncio_id: UUID, anuncio_data: dict, db=Depends(get_db)):
    """Actualiza un anuncio existente."""
    updated = update_anuncio(anuncio_id, anuncio_data, db)
    if not updated:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    return updated

@router.delete("/{anuncio_id}")
async def delete_anuncio_route(anuncio_id: UUID, db=Depends(get_db)):
    """Elimina un anuncio por su ID."""
    success = delete_anuncio(anuncio_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    return {"message": "Anuncio eliminado correctamente"}