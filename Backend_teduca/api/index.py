import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "src"))

from teduca.main import app  # noqa: E402, F401 — Vercel busca `app` en este módulo

