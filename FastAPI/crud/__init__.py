# Importar desde colonias.py
from crud.colonias import create_colonia, get_colonias, get_colonia_by_id, update_colonia, delete_colonia

# Importar desde base.py
from crud.base import serialize_model

# Importar desde residencias.py 
from crud.residencias import create_residencia, get_residencias, get_residencia_by_id, get_residencias_by_colonia

# Importar desde usuarios.py
from crud.usuarios import create_user_in_auth_and_db, get_user_by_id, get_users

# Importar desde visitas.py
from crud.visitas import create_visita, get_visitas