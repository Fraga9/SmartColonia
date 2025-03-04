from fastapi import HTTPException, Depends
from supabase import create_client, Client
from gotrue.errors import AuthApiError
from database import supabase
from uuid import UUID, uuid4
from datetime import datetime
import bcrypt
from crud.base import serialize_model
from models.user import User, UserCreate


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