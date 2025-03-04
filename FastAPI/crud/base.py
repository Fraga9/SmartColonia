from uuid import UUID
from datetime import datetime

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