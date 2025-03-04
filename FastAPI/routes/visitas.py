from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID
from database import get_db
from models.visita import Visita
from crud.visitas import create_visita, get_visitas

router = APIRouter()

@router.post("/", response_model=Visita)
async def create_visita_route(visita: Visita, db=Depends(get_db)):
    created_visita = create_visita(visita, db)
    return created_visita

@router.get("/", response_model=List[Visita])
async def get_visitas_route(db=Depends(get_db)):
    visitas = get_visitas(db)
    return visitas