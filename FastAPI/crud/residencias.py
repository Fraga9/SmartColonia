from fastapi import HTTPException, Depends
from supabase import create_client, Client
from gotrue.errors import AuthApiError
from database import supabase
from uuid import UUID, uuid4
from datetime import datetime
import bcrypt
from models.residencia import Residencia, ResidenciaCreate, ResidenciaUsuario, ResidenciaUsuarioCreate
from crud.base import serialize_model

def create_residencia(residencia_data: ResidenciaCreate, db: Client):
    """Crea una nueva residencia."""
    # Crear el objeto Residencia completo
    residencia = Residencia(
        numero=residencia_data.numero,
        calle=residencia_data.calle,
        referencia=residencia_data.referencia,
        colonia_id=residencia_data.colonia_id
    )
    
    # Serializar para Supabase
    serialized_data = serialize_model(residencia)
    
    # Insertar en la base de datos
    response = db.table('residencias').insert(serialized_data).execute()
    
    if len(response.data) > 0:
        return residencia
    raise HTTPException(status_code=500, detail="Error al crear la residencia")

def get_residencias(db: Client):
    """Obtiene todas las residencias."""
    response = db.table('residencias').select('*').execute()
    return response.data

def get_residencia_by_id(residencia_id: UUID, db: Client):
    """Obtiene una residencia por su ID."""
    response = db.table('residencias').select('*').eq('id', str(residencia_id)).execute()
    if response.data and len(response.data) > 0:
        return Residencia(**response.data[0])
    return None

def get_residencias_by_colonia(colonia_id: UUID, db: Client):
    """Obtiene todas las residencias de una colonia."""
    response = db.table('residencias').select('*').eq('colonia_id', str(colonia_id)).execute()
    return response.data

def create_residencia_usuario(residencia_usuario_data: ResidenciaUsuarioCreate, db: Client):
    """Asocia un usuario a una residencia."""
    # Crear el objeto ResidenciaUsuario completo
    residencia_usuario = ResidenciaUsuario(
        usuario_id=residencia_usuario_data.usuario_id,
        residencia_id=residencia_usuario_data.residencia_id,
        rol=residencia_usuario_data.rol,
        es_principal=residencia_usuario_data.es_principal,
        verificado=residencia_usuario_data.verificado
    )
    
    # Serializar para Supabase
    serialized_data = serialize_model(residencia_usuario)
    
    # Insertar en la base de datos
    response = db.table('residencias_usuarios').insert(serialized_data).execute()
    
    if len(response.data) > 0:
        return residencia_usuario
    raise HTTPException(status_code=500, detail="Error al asociar usuario a residencia")

def get_residencias_by_usuario(usuario_id: UUID, db: Client):
    """Obtiene todas las residencias asociadas a un usuario."""
    # Primero obtenemos todas las relaciones residencia-usuario del usuario
    relations = db.table('residencias_usuarios').select('*').eq('usuario_id', str(usuario_id)).execute()
    
    if not relations.data:
        return []
    
    # Obtenemos los IDs de las residencias asociadas
    residencia_ids = [rel['residencia_id'] for rel in relations.data]
    
    # Consultamos las residencias por sus IDs
    residencias = []
    for residencia_id in residencia_ids:
        res = db.table('residencias').select('*').eq('id', residencia_id).execute()
        if res.data and len(res.data) > 0:
            residencias.append(res.data[0])
    
    return residencias

def verificar_residencia_usuario(residencia_id: UUID, usuario_id: UUID, db: Client):
    """Marca como verificada la relación entre un usuario y una residencia."""
    response = db.table('residencias_usuarios').update({
        'verificado': True, 
        'updated_at': datetime.utcnow().isoformat()
    }).eq('usuario_id', str(usuario_id)).eq('residencia_id', str(residencia_id)).execute()
    
    if response.data and len(response.data) > 0:
        return True
    return False
