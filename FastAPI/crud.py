from fastapi import HTTPException, Depends
from supabase import create_client, Client
from gotrue.errors import AuthApiError
from database import supabase
from models import User, Colonia, Residencia, Visita, UserCreate, ResidenciaCreate, ResidenciaUsuario, ResidenciaUsuarioCreate
from uuid import UUID, uuid4
from datetime import datetime
import bcrypt

def serialize_model(model):
    """Convierte un modelo Pydantic a un diccionario serializable para JSON"""
    data = {}
    for key, value in model.dict().items():
        if isinstance(value, UUID):
            data[key] = str(value)
        elif isinstance(value, datetime):
            data[key] = value.isoformat()
        else:
            data[key] = value
    return data

# Versión simplificada de create_user_in_auth_and_db
async def create_user_in_auth_and_db(email: str, password: str, user_data: UserCreate, db: Client):
    try:
        # Ahora solo necesitamos crear el usuario en Supabase Auth
        # El trigger se encargará de crear el registro en nuestra tabla personalizada
        auth_response = db.auth.sign_up({
            "email": email,
            "password": password
        })
        
        # Obtener el ID de usuario asignado por Supabase Auth
        user_id = auth_response.user.id
        
        # Ahora, actualizamos el registro en nuestra tabla personalizada
        # con los datos adicionales que no se insertaron automáticamente
        update_data = {
            'nombre': user_data.nombre,
            'apellido': user_data.apellido,
            'telefono': user_data.telefono,
            'tipo_usuario_id': user_data.tipo_usuario_id,
            'colonia_id': str(user_data.colonia_id) if user_data.colonia_id else None
        }
        
        # Actualizamos el registro que el trigger ya creó
        response = db.table('usuarios').update(update_data).eq('id', user_id).execute()
        
        if not response.data:
            print("Advertencia: No se pudo actualizar con los datos adicionales")
            # Aún así, el usuario básico se ha creado, así que podemos continuar
        
        # Recuperamos el usuario completo para devolverlo
        user_result = db.table('usuarios').select('*').eq('id', user_id).execute()
        if user_result.data:
            return User(**user_result.data[0])
        else:
            # Si no podemos recuperar el usuario, construimos un objeto básico
            return User(
                id=UUID(user_id),
                email=email,
                nombre=user_data.nombre,
                apellido=user_data.apellido,
                telefono=user_data.telefono,
                tipo_usuario_id=user_data.tipo_usuario_id,
                colonia_id=user_data.colonia_id,
                activo=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        
    except AuthApiError as e:
        print(f"ERROR DE AUTENTICACIÓN: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Authentication error: {str(e)}")
    except Exception as e:
        print(f"ERROR GENERAL: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")


def get_users(db: Client):
    response = db.table('usuarios').select('*').execute()
    return response.data

def get_user_by_id(user_id: UUID, db: Client):
    # Convert UUID to string for query
    response = db.table('usuarios').select('*').eq('id', str(user_id)).execute()
    return response.data

def create_colonia(colonia, db):
    """Crea una nueva colonia."""
    # Serializa el modelo correctamente
    serialized_data = serialize_model(colonia)
    response = db.table('colonias').insert(serialized_data).execute()
    
    if len(response.data) > 0:
        return colonia
    raise HTTPException(status_code=500, detail="Error al crear la colonia")

def get_colonias(db: Client):
    response = db.table('colonias').select('*').execute()
    return response.data


# ------------------------------------------------------ Residencias ------------------------------------------------
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


# ------------------------------------------------------ Visitas ------------------------------------------------
def create_visita(visita: Visita, db: Client):
    response = db.table('visitas').insert(visita.dict()).execute()
    return response.data

def get_visitas(db: Client):
    response = db.table('visitas').select('*').execute()
    return response.data
