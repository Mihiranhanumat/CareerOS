from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.db.models import Skill, SkillEvidence, AuditLog
from app.schemas.career import SkillResponse, SkillCreate

router = APIRouter(prefix="/skills", tags=["Skills & Evidence"])

@router.get("", response_model=List[SkillResponse])
async def list_skills(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Skill).options(selectinload(Skill.evidence_items)))
    return res.scalars().all()

@router.post("", response_model=SkillResponse)
async def create_skill(data: SkillCreate, db: AsyncSession = Depends(get_db)):
    norm = data.name.lower().replace(" ", "_")
    skill = Skill(
        name=data.name,
        category=data.category,
        normalized_name=norm,
        proficiency=data.proficiency,
        verified=data.verified,
        confidence=data.confidence
    )
    db.add(skill)
    await db.flush()

    if data.evidence:
        for ev in data.evidence:
            evidence_obj = SkillEvidence(
                skill_id=skill.id,
                source_type=ev.source_type,
                evidence_text=ev.evidence_text,
                evidence_url=ev.evidence_url,
                verification_state="verified" if data.verified else "proposed",
                confidence=ev.confidence
            )
            db.add(evidence_obj)

    # Audit
    audit = AuditLog(
        actor_type="user",
        action="CREATE_SKILL",
        entity_type="skill",
        entity_id=skill.id,
        metadata_json={"name": skill.name, "category": skill.category}
    )
    db.add(audit)

    await db.commit()
    await db.refresh(skill)
    res = await db.execute(select(Skill).where(Skill.id == skill.id).options(selectinload(Skill.evidence_items)))
    return res.scalars().first()

@router.delete("/{skill_id}")
async def delete_skill(skill_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = res.scalars().first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    await db.delete(skill)
    await db.commit()
    return {"status": "deleted", "skill_id": skill_id}
