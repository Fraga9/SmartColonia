from fastapi import HTTPException
from supabase import Client
from uuid import UUID

from models.colonia import Colonia
from crud.base import serialize_model

def create_colonia(colonia, db: Client):
    """Crea una nueva colonia."""
    # Serializa el modelo correctamente
    serialized_data = serialize_model(colonia)
    response = db.table('colonias').insert(serialized_data).execute()
    
    if len(response.data) > 0:
        return colonia
    raise HTTPException(status_code=500, detail="Error al crear la colonia")

def get_colonias(db: Client):
    """Obtiene todas las colonias."""
    response = db.table('colonias').select('*').execute()
    return response.data

def get_colonia_by_id(colonia_id: UUID, db: Client):
    """Obtiene una colonia por su ID."""
    response = db.table('colonias').select('*').eq('id', str(colonia_id)).execute()
    if response.data and len(response.data) > 0:
        return Colonia(**response.data[0])
    return None

def update_colonia(colonia_id: UUID, colonia_data, db: Client):
    """Actualiza los datos de una colonia existente."""
    # Primero verificamos que la colonia exista
    existing = get_colonia_by_id(colonia_id, db)
    if not existing:
        raise HTTPException(status_code=404, detail="Colonia no encontrada")
    
    # Preparamos los datos a actualizar
    update_data = {}
    for key, value in colonia_data.dict(exclude_unset=True).items():
        if isinstance(value, UUID):
            update_data[key] = str(value)
        else:
            update_data[key] = value
    
    # Actualizamos la colonia
    response = db.table('colonias').update(update_data).eq('id', str(colonia_id)).execute()
    
    if response.data and len(response.data) > 0:
        return get_colonia_by_id(colonia_id, db)
    raise HTTPException(status_code=500, detail="Error al actualizar la colonia")

def delete_colonia(colonia_id: UUID, db: Client):
    """Elimina una colonia por su ID."""
    # Primero verificamos que la colonia exista
    existing = get_colonia_by_id(colonia_id, db)
    if not existing:
        raise HTTPException(status_code=404, detail="Colonia no encontrada")
    
    # Eliminamos la colonia
    response = db.table('colonias').delete().eq('id', str(colonia_id)).execute()
    
    if response.data is not None:
        return True
    raise HTTPException(status_code=500, detail="Error al eliminar la colonia")