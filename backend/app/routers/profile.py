from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models import Profile, ProfileVisibility, CareerProposal
from app.schemas.career import (
    ProfileResponse, ProfileUpdate, ProfileVisibilityItem,
    NaturalLanguageUpdateInput, ProposalDiffResponse
)
from app.services.career_manager import career_manager_service

router = APIRouter(prefix="/profile", tags=["Profile & Career Brain"])

@router.get("", response_model=ProfileResponse)
async def get_profile(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Profile))
    profile = res.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.patch("", response_model=ProfileResponse)
async def update_profile(data: ProfileUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Profile))
    profile = res.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_dict = data.dict(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(profile, k, v)

    await db.commit()
    await db.refresh(profile)
    return profile

@router.get("/visibility", response_model=List[ProfileVisibilityItem])
async def get_visibility_settings(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ProfileVisibility))
    return res.scalars().all()

@router.post("/proposals", response_model=ProposalDiffResponse)
async def create_natural_language_update(data: NaturalLanguageUpdateInput, db: AsyncSession = Depends(get_db)):
    """
    Digest informal natural-language update into structured proposed diff.
    """
    return await career_manager_service.parse_update_and_propose(db, data.text)

@router.post("/proposals/{proposal_id}/approve")
async def approve_proposal(proposal_id: str, db: AsyncSession = Depends(get_db)):
    return await career_manager_service.approve_proposal(db, proposal_id)

@router.post("/proposals/{proposal_id}/reject")
async def reject_proposal(proposal_id: str, db: AsyncSession = Depends(get_db)):
    return await career_manager_service.reject_proposal(db, proposal_id)
