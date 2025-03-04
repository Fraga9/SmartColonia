from fastapi import HTTPException, Depends
from supabase import create_client, Client
from gotrue.errors import AuthApiError
from database import supabase
from uuid import UUID, uuid4
from datetime import datetime
import bcrypt
from crud.base import serialize_model
from models.visita import Visita



def create_visita(visita: Visita, db: Client):
    response = db.table('visitas').insert(visita.dict()).execute()
    return response.data

def get_visitas(db: Client):
    response = db.table('visitas').select('*').execute()
    return response.data