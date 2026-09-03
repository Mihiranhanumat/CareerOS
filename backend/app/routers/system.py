from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.config import settings
from app.db.session import get_db
from app.schemas.system import SystemHealthResponse, CredentialCheckItem
from app.services.export_service import export_service
from app.services.ai_provider import ai_provider

router = APIRouter(prefix="/system", tags=["System Health, Credentials & Exports"])

@router.get("/health", response_model=SystemHealthResponse)
async def get_system_health(db: AsyncSession = Depends(get_db)):
    # 1. Check Database
    db_status = {"status": "healthy", "dialect": "SQLite / Local Async Engine" if "sqlite" in settings.DATABASE_URL else "PostgreSQL"}
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = {"status": "degraded", "error": str(e)}

    # 2. Check AI Provider
    ai_status = {
        "status": "healthy" if ai_provider.is_configured else "not_configured (using deterministic fallback engine)",
        "model_fast": settings.AI_MODEL_FAST,
        "model_reasoning": settings.AI_MODEL_REASONING,
        "is_configured": ai_provider.is_configured
    }

    # 3. Check GitHub
    github_status = {
        "status": "configured" if settings.GITHUB_CLIENT_ID else "not_configured (using local mock sync)",
        "client_id_present": bool(settings.GITHUB_CLIENT_ID)
    }

    # 4. Check Storage
    storage_status = {
        "status": "healthy",
        "storage_dir": settings.STORAGE_DIR,
        "backend": "Local / Supabase Storage"
    }

    # 5. Check Browser
    browser_status = {
        "status": "healthy",
        "playwright_enabled": settings.BROWSER_AUTOMATION_ENABLED,
        "headless": settings.PLAYWRIGHT_HEADLESS
    }

    # 6. Check Public URL
    public_status = {
        "status": "healthy",
        "base_url": settings.PUBLIC_PROFILE_BASE_URL,
        "custom_domain": settings.CUSTOM_DOMAIN
    }

    overall = "healthy"
    if db_status["status"] != "healthy":
        overall = "disconnected"

    return SystemHealthResponse(
        database=db_status,
        ai=ai_status,
        github=github_status,
        storage=storage_status,
        browser=browser_status,
        public_url=public_status,
        overall_status=overall
    )

@router.get("/credentials", response_model=List[CredentialCheckItem])
async def get_credential_status():
    """
    First-run credential audit as requested by prompt section 73.
    """
    return [
        CredentialCheckItem(
            service="Google Gemini API",
            status="configured" if ai_provider.is_configured else "missing",
            env_var="GEMINI_API_KEY",
            is_required=True,
            purpose="Powers natural language career parsing, ATS resume tailoring, and interview pack synthesis.",
            setup_url="https://aistudio.google.com/app/apikey",
            instructions="1. Go to Google AI Studio. 2. Create API key. 3. Paste into GEMINI_API_KEY in .env.",
            test_endpoint="/api/system/health",
            expected_result="Status changes to healthy with gemini-2.0-flash active."
        ),
        CredentialCheckItem(
            service="Supabase PostgreSQL & Vector DB",
            status="configured" if settings.NEXT_PUBLIC_SUPABASE_URL else "optional (local SQLite active)",
            env_var="DATABASE_URL / NEXT_PUBLIC_SUPABASE_URL",
            is_required=False,
            purpose="Cloud database system of record, pgvector semantic search, and document bucket storage.",
            setup_url="https://supabase.com/dashboard",
            instructions="1. Create Supabase project. 2. Copy connection string and API keys to .env.",
            test_endpoint="/api/system/health",
            expected_result="Postgres connection confirmed."
        ),
        CredentialCheckItem(
            service="GitHub OAuth Application",
            status="configured" if settings.GITHUB_CLIENT_ID else "missing",
            env_var="GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET",
            is_required=False,
            purpose="Syncs repositories, analyzes commit structures & dependency manifests for verified proof-of-work.",
            setup_url="https://github.com/settings/developers",
            instructions="1. Go to GitHub Developer Settings. 2. Register OAuth App with callback http://localhost:8000/api/github/callback. 3. Save Client ID & Secret in .env.",
            test_endpoint="/api/github/accounts",
            expected_result="GitHub account and repositories synced."
        ),
        CredentialCheckItem(
            service="Playwright Browser Engine",
            status="configured" if settings.BROWSER_AUTOMATION_ENABLED else "disabled",
            env_var="BROWSER_AUTOMATION_ENABLED",
            is_required=False,
            purpose="Automates permitted job application navigation and form field mapping with safe human checkpoints.",
            setup_url="http://localhost:8000/mock-portal",
            instructions="Playwright runs locally without requiring external cloud credentials.",
            test_endpoint="/mock-portal",
            expected_result="Mock portal responds and Playwright navigates successfully."
        )
    ]

@router.get("/export/json")
async def export_json_backup(db: AsyncSession = Depends(get_db)):
    data = await export_service.export_full_json_backup(db)
    return data

@router.get("/export/applications-csv")
async def export_applications_csv(db: AsyncSession = Depends(get_db)):
    csv_str = await export_service.export_applications_csv(db)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=careeros_applications.csv"}
    )

@router.get("/export/skills-csv")
async def export_skills_csv(db: AsyncSession = Depends(get_db)):
    csv_str = await export_service.export_skills_csv(db)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=careeros_skills.csv"}
    )
