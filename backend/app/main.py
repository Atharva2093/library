from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.api.v1.api import api_router

app = FastAPI(
    title="Bookstore Management API",
    version="1.0.0"
)

# CORS (allow frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health route (simple root check)
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API online"}

# Versioned API
app.include_router(api_router, prefix="/api/v1")
