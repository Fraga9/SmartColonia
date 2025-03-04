from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID
from database import get_db
from models.user import User, UserCreate
from crud.usuarios import create_user_in_auth_and_db, get_user_by_id, get_users

router = APIRouter()

@router.post("/", response_model=User)
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
    
@router.get("/", response_model=List[User])
async def get_users_route(db=Depends(get_db)):
    users = get_users(db)
    return users

@router.get("/{user_id}", response_model=User)
async def get_user_by_id_route(user_id: UUID, db=Depends(get_db)):
    user = get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user