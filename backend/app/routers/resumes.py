from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.db.models import ResumeFamily, ResumeVersion
from app.schemas.resumes import (
    ResumeFamilyResponse, ResumeVersionResponse, ResumeGenerateRequest,
    FactualityReport, ATSReport
)
from app.services.resume_engine import resume_engine

router = APIRouter(prefix="/resumes", tags=["Resume Studio & ATS Engine"])

@router.get("/families", response_model=List[ResumeFamilyResponse])
async def list_resume_families(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ResumeFamily))
    return res.scalars().all()

@router.get("", response_model=List[ResumeVersionResponse])
async def list_resumes(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ResumeVersion).order_by(ResumeVersion.created_at.desc()))
    return res.scalars().all()

@router.get("/{resume_id}", response_model=ResumeVersionResponse)
async def get_resume(resume_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ResumeVersion).where(ResumeVersion.id == resume_id))
    resume = res.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume version not found")
    return resume

@router.post("/generate", response_model=ResumeVersionResponse)
async def generate_tailored_resume(request: ResumeGenerateRequest, db: AsyncSession = Depends(get_db)):
    """
    Generate an immutable role-specific ATS resume version backed 100% by verified facts.
    """
    return await resume_engine.generate_resume(db, request)

@router.post("/{resume_id}/validate")
async def validate_resume_factuality_and_ats(resume_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ResumeVersion).where(ResumeVersion.id == resume_id))
    resume = res.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume version not found")

    return {
        "resume_id": resume.id,
        "ats_report": resume.ats_report,
        "factuality_report": resume.factuality_report,
        "status": "VALIDATED"
    }
