from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models import Experience, Education, Certification, Achievement, Preference
from app.schemas.career import (
    ExperienceResponse, EducationResponse, CertificationResponse,
    AchievementResponse, PreferenceResponse, PreferenceBase
)

router = APIRouter(tags=["Career Facts & Preferences"])

@router.get("/experience", response_model=List[ExperienceResponse])
async def list_experience(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Experience).order_by(Experience.created_at.desc()))
    return res.scalars().all()

@router.get("/education", response_model=List[EducationResponse])
async def list_education(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Education).order_by(Education.created_at.desc()))
    return res.scalars().all()

@router.get("/certifications", response_model=List[CertificationResponse])
async def list_certifications(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Certification).order_by(Certification.created_at.desc()))
    return res.scalars().all()

@router.get("/achievements", response_model=List[AchievementResponse])
async def list_achievements(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Achievement).order_by(Achievement.created_at.desc()))
    return res.scalars().all()

@router.get("/preferences", response_model=PreferenceResponse)
async def get_preferences(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Preference))
    pref = res.scalars().first()
    if not pref:
        pref = Preference(
            target_roles=["Backend Engineer", "AI Systems Engineer"],
            target_locations=["San Francisco, CA", "Remote"],
            remote_preference="remote_or_hybrid",
            minimum_match_score=75
        )
        db.add(pref)
        await db.commit()
        await db.refresh(pref)
    return pref

@router.patch("/preferences", response_model=PreferenceResponse)
async def update_preferences(data: PreferenceBase, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Preference))
    pref = res.scalars().first()
    if not pref:
        pref = Preference(**data.dict())
        db.add(pref)
    else:
        for k, v in data.dict().items():
            setattr(pref, k, v)

    await db.commit()
    await db.refresh(pref)
    return pref
