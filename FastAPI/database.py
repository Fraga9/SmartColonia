# database.py

from supabase import create_client, Client
from fastapi import Depends
import os

#import from env 
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL =  os.getenv("SUPABASE_URL") # Replace with your Supabase URL
print("Supabase es", SUPABASE_URL)
SUPABASE_KEY = os.getenv("SUPABASE_KEY") # Replace with your Supabase Key

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


print(f"SUPABASE_URL: {SUPABASE_URL[:15]}...") # Muestra solo el inicio para seguridad
print(f"SUPABASE_KEY (primeros 10 chars): {SUPABASE_KEY[:10]}...")

# Verifica que el cliente se inicializa correctamente
try:
    test_query = supabase.table("usuarios").select("id").limit(1).execute()
    print("Conexión a Supabase exitosa, puede realizar consultas")
except Exception as e:
    print(f"Error al conectar con Supabase: {str(e)}")

    
def get_db():
    return supabase
