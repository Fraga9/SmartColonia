from fastapi import APIRouter, Depends, HTTPException
from typing import List
import logging
from uuid import UUID
from database import get_db
from models.colonia import Colonia, ColoniaCreate
from models.residencia import Residencia
from crud.colonias import create_colonia, get_colonias, get_colonia_by_id
from crud.residencias import get_residencias_by_colonia
from crud.base import serialize_model

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=Colonia)
async def create_colonia_route(colonia_data: ColoniaCreate, db=Depends(get_db)):
    """Crea una nueva colonia."""
    try:
        # Crear un objeto Colonia completo a partir de ColoniaCreate
        colonia = Colonia(
            nombre=colonia_data.nombre,
            direccion=colonia_data.direccion,
            admin_principal_id=colonia_data.admin_principal_id
            # Los demás campos se generan automáticamente
        )
        created_colonia = create_colonia(colonia, db)
        return created_colonia
    except Exception as e:
        # Logging detallado para depuración
        logger.error(f"Error al crear colonia: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/", response_model=List[Colonia])
async def get_colonias_route(db=Depends(get_db)):
    colonias = get_colonias(db)
    return colonias

@router.get("/{colonia_id}/residencias", response_model=List[Residencia])
async def get_residencias_by_colonia_route(colonia_id: UUID, db=Depends(get_db)):
    """Obtiene todas las residencias de una colonia."""
    residencias = get_residencias_by_colonia(colonia_id, db)
    return residencias

@router.get("/{colonia_id}/generar-codigo/{cantidad}")
async def generar_codigos_residencias_route(colonia_id: UUID, cantidad: int, db=Depends(get_db)):
    """Genera un número específico de códigos para residencias en una colonia."""
    # Verificar que la colonia existe
    colonia_response = db.table('colonias').select('*').eq('id', str(colonia_id)).execute()
    if not colonia_response.data:
        raise HTTPException(status_code=404, detail="Colonia no encontrada")
    
    residencias_generadas = []
    
    # Generar las residencias con sus códigos
    for i in range(cantidad):
        nueva_residencia = Residencia(
            numero=f"Auto-{i+1}",  # Número provisional
            calle="Por asignar",   # Calle provisional
            referencia="Residencia generada automáticamente",
            colonia_id=colonia_id
        )
        
        # Serializar y guardar
        serialized_data = serialize_model(nueva_residencia)
        response = db.table('residencias').insert(serialized_data).execute()
        
        if response.data:
            # Guardar la información con el ID generado
            residencia_guardada = response.data[0]
            residencias_generadas.append({
                "id": residencia_guardada["id"],
                "codigo": residencia_guardada["id"]  # El UUID como código
            })
    
    return {"residencias_generadas": residencias_generadas}