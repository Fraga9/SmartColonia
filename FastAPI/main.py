from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import logging
import uvicorn
from models import User, Colonia, Residencia, Visita, UserCreate, ColoniaCreate, ResidenciaCreate, Residencia, ResidenciaUsuarioCreate, ResidenciaUsuario
from crud import create_user_in_auth_and_db, get_users, create_colonia, get_colonias, create_residencia, get_residencias, create_visita, get_visitas, get_user_by_id
from crud import (
    create_residencia, get_residencias, get_residencia_by_id, 
    get_residencias_by_colonia, create_residencia_usuario,
    get_residencias_by_usuario, verificar_residencia_usuario, serialize_model
)
from database import get_db
from uuid import UUID, uuid4
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Middleware para logs
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"📨 Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"📫 Response Status: {response.status_code}")
    return response

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, reemplaza con las URLs permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas de Usuarios

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}


@app.post("/usuarios/", response_model=User)
async def create_user_route(user_data: UserCreate, db=Depends(get_db)):
    print(f"Recibida solicitud para crear usuario: {user_data.email}")
    print(f"Datos completos: {user_data.dict()}")
    
    try:
        created_user = await create_user_in_auth_and_db(
            email=user_data.email,
            password=user_data.password,
            user_data=User(**user_data.dict()),
            db=db
        )
        print(f"Usuario creado exitosamente: {created_user.email}")
        return created_user
    except Exception as e:
        print(f"Error en la ruta de creación: {str(e)}")
        raise


@app.get("/usuarios/", response_model=List[User])
async def get_users_route(db=Depends(get_db)):
    users = get_users(db)
    return users

@app.get("/usuarios/{user_id}", response_model=User)
async def get_user_by_id_route(user_id: UUID, db=Depends(get_db)):
    user = get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Rutas de Colonias
@app.post("/colonias/", response_model=Colonia)
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

@app.get("/colonias/", response_model=List[Colonia])
async def get_colonias_route(db=Depends(get_db)):
    colonias = get_colonias(db)
    return colonias




# Rutas de Residencias
@app.post("/residencias/", response_model=Residencia)
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

@app.get("/residencias/", response_model=List[Residencia])
async def get_residencias_route(db=Depends(get_db)):
    """Obtiene todas las residencias."""
    residencias = get_residencias(db)
    return residencias

@app.get("/residencias/{residencia_id}", response_model=Residencia)
async def get_residencia_route(residencia_id: UUID, db=Depends(get_db)):
    """Obtiene una residencia por su ID."""
    residencia = get_residencia_by_id(residencia_id, db)
    if not residencia:
        raise HTTPException(status_code=404, detail="Residencia no encontrada")
    return residencia

@app.get("/colonias/{colonia_id}/residencias", response_model=List[Residencia])
async def get_residencias_by_colonia_route(colonia_id: UUID, db=Depends(get_db)):
    """Obtiene todas las residencias de una colonia."""
    residencias = get_residencias_by_colonia(colonia_id, db)
    return residencias

@app.post("/residencias-usuarios/", response_model=ResidenciaUsuario)
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

@app.get("/usuarios/{usuario_id}/residencias", response_model=List[Residencia])
async def get_residencias_by_usuario_route(usuario_id: UUID, db=Depends(get_db)):
    """Obtiene todas las residencias asociadas a un usuario."""
    residencias = get_residencias_by_usuario(usuario_id, db)
    return residencias

@app.patch("/residencias-usuarios/verificar/{residencia_id}/{usuario_id}")
async def verificar_residencia_usuario_route(residencia_id: UUID, usuario_id: UUID, db=Depends(get_db)):
    """Marca como verificada la relación entre un usuario y una residencia."""
    success = verificar_residencia_usuario(residencia_id, usuario_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Relación residencia-usuario no encontrada")
    return {"message": "Relación verificada correctamente"}

@app.get("/colonias/{colonia_id}/generar-codigo/{cantidad}")
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


# Rutas de Visitas
@app.post("/visitas/", response_model=Visita)
async def create_visita_route(visita: Visita, db=Depends(get_db)):
    created_visita = create_visita(visita, db)
    return created_visita

@app.get("/visitas/", response_model=List[Visita])
async def get_visitas_route(db=Depends(get_db)):
    visitas = get_visitas(db)
    return visitas


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )