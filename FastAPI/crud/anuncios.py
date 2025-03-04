from fastapi import HTTPException
from supabase import Client
from uuid import UUID, uuid4
from datetime import datetime
from models.anuncio import Anuncio, AnuncioCreate
from crud.base import serialize_model
from typing import List, Optional

def create_anuncio(anuncio_data: AnuncioCreate, db: Client) -> Anuncio:
    """Crea un nuevo anuncio en la colonia."""
    # Crear el objeto Anuncio completo
    anuncio = Anuncio(
        titulo=anuncio_data.titulo,
        contenido=anuncio_data.contenido,
        usuario_id=anuncio_data.usuario_id,
        colonia_id=anuncio_data.colonia_id,
        importante=anuncio_data.importante,
        fecha_publicacion=anuncio_data.fecha_publicacion or datetime.utcnow(),
        fecha_expiracion=anuncio_data.fecha_expiracion
    )
    
    # Serializar para Supabase
    serialized_data = serialize_model(anuncio)
    
    # Insertar en la base de datos
    response = db.table('anuncios').insert(serialized_data).execute()
    
    if len(response.data) > 0:
        return anuncio
    raise HTTPException(status_code=500, detail="Error al crear el anuncio")

def get_anuncios(db: Client) -> List[Anuncio]:
    """Obtiene todos los anuncios."""
    response = db.table('anuncios').select('*').execute()
    return [Anuncio(**item) for item in response.data]

def get_anuncio_by_id(anuncio_id: UUID, db: Client) -> Optional[Anuncio]:
    """Obtiene un anuncio por su ID."""
    response = db.table('anuncios').select('*').eq('id', str(anuncio_id)).execute()
    if response.data and len(response.data) > 0:
        return Anuncio(**response.data[0])
    return None

def get_anuncios_by_colonia(colonia_id: UUID, db: Client) -> List[Anuncio]:
    """Obtiene todos los anuncios de una colonia específica."""
    ahora = datetime.utcnow()
    
    # Obtenemos anuncios que son válidos (no expirados o sin fecha de expiración)
    response = db.table('anuncios').select('*').eq('colonia_id', str(colonia_id)).execute()
    
    # Filtramos manualmente los anuncios expirados
    anuncios_validos = []
    for anuncio_data in response.data:
        # Convertir a objeto Anuncio
        anuncio = Anuncio(**anuncio_data)
        
        # Verificar si el anuncio no ha expirado
        if anuncio.fecha_expiracion is None or anuncio.fecha_expiracion > ahora:
            anuncios_validos.append(anuncio)
    
    # Ordenar por importancia y fecha de publicación (más recientes primero)
    anuncios_validos.sort(key=lambda x: (not x.importante, x.fecha_publicacion), reverse=True)
    
    return anuncios_validos

def update_anuncio(anuncio_id: UUID, anuncio_data: dict, db: Client) -> Optional[Anuncio]:
    """Actualiza un anuncio existente."""
    # Verificar que el anuncio existe
    existing = get_anuncio_by_id(anuncio_id, db)
    if not existing:
        return None
    
    # Agregar fecha de actualización
    anuncio_data['updated_at'] = datetime.utcnow().isoformat()
    
    # Actualizar en la base de datos
    response = db.table('anuncios').update(anuncio_data).eq('id', str(anuncio_id)).execute()
    
    if response.data and len(response.data) > 0:
        return Anuncio(**response.data[0])
    return None

def delete_anuncio(anuncio_id: UUID, db: Client) -> bool:
    """Elimina un anuncio por su ID."""
    response = db.table('anuncios').delete().eq('id', str(anuncio_id)).execute()
    
    if response.data and len(response.data) > 0:
        return True
    return False