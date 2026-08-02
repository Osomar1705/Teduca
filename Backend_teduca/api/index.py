import logging
import os
import sys
import traceback

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "src"))

logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger("teduca.startup")

try:
    from teduca.main import app
    log.info("App loaded OK. Routes: %s", [getattr(r, 'path', '?') for r in app.routes])
except Exception:
    log.error("FATAL import error:\n%s", traceback.format_exc())
    # Levanta una app mínima para poder ver el error via /debug
    from fastapi import FastAPI
    app = FastAPI()

    @app.get("/{path:path}")
    async def catch_all(path: str) -> dict:
        return {"error": traceback.format_exc()}
