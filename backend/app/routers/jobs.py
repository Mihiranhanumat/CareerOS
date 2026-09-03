import hashlib
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.db.models import Job, JobRequirement, JobMatch, AuditLog
from app.schemas.jobs import JobResponse, JobImportInput, JobMatchBreakdown
from app.services.matching_engine import matching_engine
from app.services.ai_provider import ai_provider

router = APIRouter(prefix="/jobs", tags=["Job Ingestion & Matching"])

@router.get("", response_model=List[JobResponse])
async def list_jobs(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Job).options(
            selectinload(Job.requirements),
            selectinload(Job.matches)
        ).order_by(Job.created_at.desc())
    )
    jobs = res.scalars().all()
    
    response_list = []
    for j in jobs:
        # Calculate or fetch latest match
        latest_match = None
        if j.matches:
            m = j.matches[-1]
            latest_match = JobMatchBreakdown(
                score=m.score,
                eligibility_score=m.eligibility_score,
                skill_score=m.skill_score,
                project_score=m.project_score,
                experience_score=m.experience_score,
                preference_score=m.preference_score,
                matched_evidence=m.matched_evidence or [],
                missing_requirements=m.missing_requirements or [],
                explanation=m.explanation,
                recommended_action=m.recommended_action
            )
        else:
            try:
                latest_match = await matching_engine.calculate_match(db, j.id)
            except Exception:
                pass

        resp_item = JobResponse(
            id=j.id,
            source=j.source,
            external_id=j.external_id,
            company=j.company,
            title=j.title,
            location=j.location,
            work_mode=j.work_mode,
            url=j.url,
            description=j.description,
            posted_at=j.posted_at,
            deadline=j.deadline,
            status=j.status,
            created_at=j.created_at,
            requirements=j.requirements,
            latest_match=latest_match
        )
        response_list.append(resp_item)

    return response_list

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Job).where(Job.id == job_id).options(
            selectinload(Job.requirements),
            selectinload(Job.matches)
        )
    )
    job = res.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    match_breakdown = await matching_engine.calculate_match(db, job.id)

    return JobResponse(
        id=job.id,
        source=job.source,
        external_id=job.external_id,
        company=job.company,
        title=job.title,
        location=job.location,
        work_mode=job.work_mode,
        url=job.url,
        description=job.description,
        posted_at=job.posted_at,
        deadline=job.deadline,
        status=job.status,
        created_at=job.created_at,
        requirements=job.requirements,
        latest_match=match_breakdown
    )

@router.post("/import", response_model=JobResponse)
async def import_job(data: JobImportInput, db: AsyncSession = Depends(get_db)):
    """
    Import job via manual paste or URL. Deduplicates by normalized hash.
    Extracts structured requirements and computes match score.
    """
    company = data.company or "Imported Tech Employer"
    title = data.title or "Software Engineer"
    location = data.location or "San Francisco, CA / Remote"

    # Compute normalized hash for deduplication
    norm_text = f"{company.strip().lower()}:{title.strip().lower()}:{data.description[:200]}"
    norm_hash = hashlib.sha256(norm_text.encode()).hexdigest()

    existing = await db.execute(select(Job).where(Job.normalized_hash == norm_hash))
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="Duplicate job posting detected. This requisition is already tracked.")

    job = Job(
        source=data.source,
        company=company,
        title=title,
        location=location,
        work_mode=data.work_mode,
        url=data.url,
        description=data.description,
        posted_at="Just now",
        normalized_hash=norm_hash,
        status="DISCOVERED"
    )
    db.add(job)
    await db.flush()

    # Extract requirements
    extracted = await ai_provider.generate_structured(
        prompt=f"Extract technical requirements from this job description:\n{data.description}",
        schema_desc='{"requirements": [{"requirement_type": "technical_skill", "requirement_text": "...", "normalized_skill": "...", "mandatory": true}]}'
    )

    reqs = extracted.get("requirements", [])
    if not reqs:
        # Default extraction
        for tech in ["Python", "FastAPI", "PostgreSQL", "Docker", "TypeScript", "React"]:
            if tech.lower() in data.description.lower():
                req_obj = JobRequirement(
                    job_id=job.id,
                    requirement_type="technical_skill",
                    requirement_text=f"Hands-on experience with {tech}",
                    normalized_skill=tech,
                    mandatory=True
                )
                db.add(req_obj)
    else:
        for r in reqs:
            req_obj = JobRequirement(
                job_id=job.id,
                requirement_type=r.get("requirement_type", "technical_skill"),
                requirement_text=r.get("requirement_text", ""),
                normalized_skill=r.get("normalized_skill", ""),
                mandatory=r.get("mandatory", True)
            )
            db.add(req_obj)

    # Compute initial match
    await db.commit()
    match_breakdown = await matching_engine.calculate_match(db, job.id)

    # Persist match
    job_match = JobMatch(
        job_id=job.id,
        score=match_breakdown.score,
        eligibility_score=match_breakdown.eligibility_score,
        skill_score=match_breakdown.skill_score,
        project_score=match_breakdown.project_score,
        experience_score=match_breakdown.experience_score,
        preference_score=match_breakdown.preference_score,
        matched_evidence=match_breakdown.matched_evidence,
        missing_requirements=match_breakdown.missing_requirements,
        explanation=match_breakdown.explanation,
        recommended_action=match_breakdown.recommended_action
    )
    db.add(job_match)

    # Audit
    audit = AuditLog(
        actor_type="user",
        action="IMPORT_JOB",
        entity_type="job",
        entity_id=job.id,
        metadata_json={"company": company, "title": title, "match_score": match_breakdown.score}
    )
    db.add(audit)

    await db.commit()
    await db.refresh(job)

    return JobResponse(
        id=job.id,
        source=job.source,
        external_id=job.external_id,
        company=job.company,
        title=job.title,
        location=job.location,
        work_mode=job.work_mode,
        url=job.url,
        description=job.description,
        posted_at=job.posted_at,
        deadline=job.deadline,
        status=job.status,
        created_at=job.created_at,
        requirements=job.requirements,
        latest_match=match_breakdown
    )

@router.post("/{job_id}/match", response_model=JobMatchBreakdown)
async def match_job(job_id: str, db: AsyncSession = Depends(get_db)):
    return await matching_engine.calculate_match(db, job_id)
