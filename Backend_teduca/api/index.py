import os
import sys

# Agrega la carpeta 'src' al path para que Python encuentre el módulo 'teduca'
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "src"))

from teduca.main import app
