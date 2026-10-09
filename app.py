"""
VoltSense - Application Entry Point Bridge
===========================================
Exposes the canonical FastAPI application instance `app` from `backend.main`
and enables direct execution via `python app.py` or `uvicorn app:app`.
"""
import uvicorn
from backend.main import app

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
