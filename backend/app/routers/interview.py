from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.system import InterviewPrepPack
from app.services.interview_engine import interview_engine

router = APIRouter(prefix="/interview", tags=["Interview Intelligence"])

@router.get("/{job_id}/prep", response_model=InterviewPrepPack)
async def get_interview_prep_pack(job_id: str, db: AsyncSession = Depends(get_db)):
    return await interview_engine.generate_prep_pack(db, job_id)
