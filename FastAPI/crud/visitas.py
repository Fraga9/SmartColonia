from fastapi import HTTPException
from supabase import Client
from uuid import UUID
from datetime import datetime
from crud.base import serialize_model
from models.visita import Visita, VisitaCreate


def create_visita(visita_data: VisitaCreate, db: Client):
    """Crea una nueva visita."""
    # Crear el objeto Visita completo
    visita = Visita(
        nombre_visitante=visita_data.nombre_visitante,
        apellido_visitante=visita_data.apellido_visitante,
        identificacion=visita_data.identificacion,
        tipo=visita_data.tipo,
        fecha_programada=visita_data.fecha_programada,
        residencia_id=visita_data.residencia_id,
        usuario_id=visita_data.usuario_id,
        activa=visita_data.activa
    )
    
    # Serializar para Supabase
    serialized_data = serialize_model(visita)
    
    # Insertar en la base de datos
    response = db.table('visitas').insert(serialized_data).execute()
    
    if len(response.data) > 0:
        return visita
    raise HTTPException(status_code=500, detail="Error al crear la visita")


def get_visitas(db: Client):
    """Obtiene todas las visitas."""
    response = db.table('visitas').select('*').execute()
    return response.data


def get_visita_by_id(visita_id: UUID, db: Client):
    """Obtiene una visita por su ID."""
    response = db.table('visitas').select('*').eq('id', str(visita_id)).execute()
    if response.data and len(response.data) > 0:
        return Visita(**response.data[0])
    return None


def get_visitas_by_residencia(residencia_id: UUID, db: Client):
    """Obtiene todas las visitas de una residencia."""
    response = db.table('visitas').select('*').eq('residencia_id', str(residencia_id)).execute()
    return response.data


def get_visitas_by_usuario(usuario_id: UUID, db: Client):
    """Obtiene todas las visitas creadas por un usuario."""
    response = db.table('visitas').select('*').eq('usuario_id', str(usuario_id)).execute()
    return response.data


def get_visitas_activas_by_residencia(residencia_id: UUID, db: Client):
    """Obtiene todas las visitas activas de una residencia."""
    response = db.table('visitas').select('*').eq('residencia_id', str(residencia_id)).eq('activa', True).execute()
    return response.data


def update_visita(visita_id: UUID, visita_data: dict, db: Client):
    """Actualiza una visita existente."""
    # Añadir timestamp de actualización
    visita_data['updated_at'] = datetime.utcnow().isoformat()
    
    response = db.table('visitas').update(visita_data).eq('id', str(visita_id)).execute()
    
    if response.data and len(response.data) > 0:
        return Visita(**response.data[0])
    raise HTTPException(status_code=404, detail="Visita no encontrada")


def delete_visita(visita_id: UUID, db: Client):
    """Elimina una visita."""
    response = db.table('visitas').delete().eq('id', str(visita_id)).execute()
    
    if response.data and len(response.data) > 0:
        return True
    raise HTTPException(status_code=404, detail="Visita no encontrada")


def scan_visita_qr(visita_id: UUID, db: Client):
    """Registra el escaneo de un QR de visita."""
    # Primero verificamos si el QR es válido
    check_response = db.rpc('is_qr_valid', {'visit_id': str(visita_id)}).execute()
    
    if not check_response.data or not check_response.data[0]:
        raise HTTPException(status_code=400, detail="QR inválido o expirado")
    
    # Si el QR es válido, registramos el escaneo
    scan_response = db.rpc('scan_qr', {'visit_id': str(visita_id)}).execute()
    
    if scan_response.data and scan_response.data[0]:
        # Obtenemos la visita actualizada
        visita = get_visita_by_id(visita_id, db)
        if visita:
            return visita
    
    raise HTTPException(status_code=500, detail="Error al escanear el QR")


def get_visitas_by_fecha(fecha_inicio: datetime, fecha_fin: datetime, db: Client):
    """Obtiene visitas en un rango de fechas."""
    response = db.table('visitas').select('*').gte('fecha_programada', fecha_inicio.isoformat()).lte('fecha_programada', fecha_fin.isoformat()).execute()
    return response.data