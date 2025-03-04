# Re-export all models to maintain backwards compatibility

# User models
from models.user import User, UserCreate

# Colonia models
from models.colonia import Colonia, ColoniaCreate

# Residencia models
from models.residencia import Residencia, ResidenciaCreate, ResidenciaUsuario, ResidenciaUsuarioCreate

# Visita models
from models.visita import Visita