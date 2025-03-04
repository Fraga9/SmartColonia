from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import uvicorn

# Importar todos los routers
from routes import (
    router_usuarios,
    router_colonias,
    router_residencias,
    router_visitas
)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FastReact API",
    description="API para aplicación de administración de colonias",
    version="1.0.0"
)

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

# Ruta raíz
@app.get("/")
async def root():
    return {"message": "Welcome to the API"}

# Incluir todos los routers
app.include_router(router_usuarios, prefix="/usuarios", tags=["Usuarios"])
app.include_router(router_colonias, prefix="/colonias", tags=["Colonias"])
app.include_router(router_residencias, prefix="/residencias", tags=["Residencias"])
app.include_router(router_visitas, prefix="/visitas", tags=["Visitas"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )