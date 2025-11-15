from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, Field
from typing import List, Optional
from pathlib import Path
from dotenv import load_dotenv
import os

# load .env from repo root if present
env_path = Path(__file__).resolve().parents[3] / ".env"
if env_path.exists():
    load_dotenv(env_path)

class Settings(BaseSettings):
    # App metadata
    PROJECT_NAME: str = Field("Bookstore Management System", env="PROJECT_NAME")
    VERSION: str = Field("1.0.0", env="VERSION")
    API_V1_STR: str = Field("/api/v1", env="API_V1_STR")
    
    # Core DB & auth
    DATABASE_URL: str = Field("sqlite:///./bookstore.db", env="DATABASE_URL")
    SECRET_KEY: str = Field("changeme", env="SECRET_KEY")
    JWT_SECRET: str = Field("changeme", env="JWT_SECRET")  # Kept for backward compatibility
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(60 * 24, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # Frontend/hosts
    ALLOWED_HOSTS: List[str] = Field(["*"], env="ALLOWED_HOSTS")
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = Field([
        "http://localhost:3000",
        "http://127.0.0.1:3000", 
        "http://frontend:3000"
    ], env="BACKEND_CORS_ORIGINS")

    # Optional: debug toggles
    DEBUG: bool = Field(False, env="DEBUG")
    
    # Pagination settings
    DEFAULT_PAGE_SIZE: int = Field(20, env="DEFAULT_PAGE_SIZE")
    MAX_PAGE_SIZE: int = Field(100, env="MAX_PAGE_SIZE")

    class Config:
        env_file = str(env_path) if env_path.exists() else None
        case_sensitive = True

# Instantiate settings
settings = Settings()

