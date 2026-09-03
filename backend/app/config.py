import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "CareerOS Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "careeros-super-secure-jwt-secret-key-change-in-prod-2026"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"]

    # Database: Supports SQLite for local single-file zero-config setup and PostgreSQL / Supabase
    DATABASE_URL: str = "sqlite+aiosqlite:///./careeros.db"
    NEXT_PUBLIC_SUPABASE_URL: Optional[str] = None
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # AI Configuration
    GEMINI_API_KEY: Optional[str] = None
    AI_MODEL_FAST: str = "gemini-2.0-flash"
    AI_MODEL_REASONING: str = "gemini-1.5-pro"
    AI_MODEL_EMBEDDING: str = "text-embedding-004"

    # GitHub OAuth
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    GITHUB_REDIRECT_URI: str = "http://localhost:8000/api/github/callback"

    # Google / Email / Calendar
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"

    # Public Profile
    PUBLIC_PROFILE_BASE_URL: str = "http://localhost:3000"
    CUSTOM_DOMAIN: Optional[str] = None

    # Browser Automation & Storage
    STORAGE_DIR: str = "./storage"
    PLAYWRIGHT_HEADLESS: bool = True
    BROWSER_AUTOMATION_ENABLED: bool = True
    BROWSER_TIMEOUT_MS: int = 30000

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure storage directories exist
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.STORAGE_DIR, "resumes"), exist_ok=True)
os.makedirs(os.path.join(settings.STORAGE_DIR, "artifacts"), exist_ok=True)
os.makedirs(os.path.join(settings.STORAGE_DIR, "screenshots"), exist_ok=True)
