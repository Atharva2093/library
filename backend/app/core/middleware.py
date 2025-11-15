"""
FastAPI middleware configuration
"""
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


def setup_middleware(app: FastAPI) -> None:
    """
    Configure all middleware for the FastAPI app
    """
    
    # Security middleware for production
    if not settings.DEBUG:
        app.add_middleware(
            TrustedHostMiddleware, 
            allowed_hosts=["localhost", "127.0.0.1", "*.bookstore.com"]
        )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["*"],
    )

    # Request timing middleware
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        # Log slow requests
        if process_time > 1.0:  # Log requests slower than 1 second
            logger.warning(
                f"Slow request: {request.method} {request.url} took {process_time:.2f}s"
            )
        
        return response

    # Request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        # Log request
        logger.info(f"{request.method} {request.url} - {request.client.host if request.client else 'unknown'}")
        
        response = await call_next(request)
        
        # Log response status
        if response.status_code >= 400:
            logger.warning(f"Response: {response.status_code}")
        
        return response