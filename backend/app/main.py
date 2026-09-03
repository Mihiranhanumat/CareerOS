import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.session import init_db
from app.db.seed import seed_database
from app.routers import (
    auth, profile, skills, projects, experience, github, jobs,
    resumes, applications, mock_site, interview, analytics,
    public, system
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed rich demo career facts
    await init_db()
    await seed_database()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CareerOS — Personal AI Career & Placement Operating System API",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(skills.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(experience.router, prefix="/api")
app.include_router(github.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(interview.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(system.router, prefix="/api")

# Register Mock Application Portal (Direct HTML router)
app.include_router(mock_site.router)

# Mount local storage for resume PDFs and artifacts
if os.path.exists(settings.STORAGE_DIR):
    app.mount("/storage", StaticFiles(directory=settings.STORAGE_DIR), name="storage")

@app.get("/")
async def root():
    return {
        "name": "CareerOS Personal AI Backend",
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "mock_portal": "/mock-portal",
        "api_v1": "/api"
    }
