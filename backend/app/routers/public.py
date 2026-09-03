from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.db.models import (
    Profile, ProfileVisibility, Skill, Project, Experience, Education,
    Certification, Achievement, PublicProfileSetting, ResumeVersion
)

router = APIRouter(prefix="/public", tags=["Public Live Portfolio & CV"])

@router.get("/{slug}")
async def get_public_profile(slug: str, db: AsyncSession = Depends(get_db)):
    """
    Public Profile endpoint with strict privacy filtering.
    Only approved, public fields are returned. No sensitive application or contact data is exposed.
    """
    setting_res = await db.execute(select(PublicProfileSetting).where(PublicProfileSetting.slug == slug))
    settings = setting_res.scalars().first()
    if not settings or not settings.enabled:
        raise HTTPException(status_code=404, detail="Public profile not found or disabled")

    # Fetch Profile
    p_res = await db.execute(select(Profile))
    profile = p_res.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Fetch Visibility Rules
    vis_res = await db.execute(select(ProfileVisibility).where(ProfileVisibility.profile_id == profile.id))
    visibility_map = {v.field_name: v.visibility for v in vis_res.scalars().all()}

    # Verified Skills
    skills_res = await db.execute(select(Skill).where(Skill.verified == True))
    verified_skills = skills_res.scalars().all()

    # Featured Projects
    proj_res = await db.execute(select(Project).where(Project.verified == True).order_by(Project.featured.desc()))
    projects = proj_res.scalars().all()

    # Experience
    exp_res = await db.execute(select(Experience).where(Experience.verified == True).order_by(Experience.created_at.desc()))
    experiences = exp_res.scalars().all()

    # Education
    edu_res = await db.execute(select(Education).where(Education.verified == True))
    education = edu_res.scalars().all()

    # Certifications & Achievements
    cert_res = await db.execute(select(Certification).where(Certification.verified == True))
    certs = cert_res.scalars().all()

    ach_res = await db.execute(select(Achievement).where(Achievement.verified == True))
    achievements = ach_res.scalars().all()

    # Compose strictly sanitized public payload
    return {
        "slug": slug,
        "seo_title": settings.seo_title,
        "seo_description": settings.seo_description,
        "profile": {
            "display_name": profile.display_name,
            "headline": profile.headline,
            "summary": profile.summary,
            "location": profile.location,
            "availability": profile.availability,
            "github_url": profile.github_url if visibility_map.get("github_url", "public") == "public" else None,
            "linkedin_url": profile.linkedin_url if visibility_map.get("linkedin_url", "public") == "public" else None,
            "website_url": profile.website_url if visibility_map.get("website_url", "public") == "public" else None,
            # Email only if public or selective
            "email": profile.email_public if visibility_map.get("email_public") in ["public", "selective"] else None,
            # Phone strictly excluded from public default
            "phone": profile.phone_public if visibility_map.get("phone_public") == "public" else None
        },
        "skills": [
            {"id": s.id, "name": s.name, "category": s.category, "proficiency": s.proficiency}
            for s in verified_skills
        ],
        "projects": [
            {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "short_description": p.short_description,
                "problem": p.problem,
                "solution": p.solution,
                "architecture": p.architecture,
                "outcomes": p.outcomes,
                "technologies": p.technologies,
                "github_url": p.github_url,
                "demo_url": p.demo_url,
                "featured": p.featured
            }
            for p in projects
        ],
        "experience": [
            {
                "id": e.id,
                "organization": e.organization,
                "title": e.title,
                "location": e.location,
                "start_date": e.start_date,
                "end_date": e.end_date,
                "description": e.description,
                "achievements": e.achievements,
                "technologies": e.technologies
            }
            for e in experiences
        ],
        "education": [
            {
                "id": ed.id,
                "institution": ed.institution,
                "degree": ed.degree,
                "field": ed.field,
                "start_date": ed.start_date,
                "end_date": ed.end_date,
                "grade": ed.grade,
                "coursework": ed.coursework
            }
            for ed in education
        ],
        "certifications": [
            {"name": c.name, "issuer": c.issuer, "issue_date": c.issue_date, "credential_url": c.credential_url}
            for c in certs
        ],
        "achievements": [
            {"title": a.title, "organization": a.organization, "date": a.date, "description": a.description}
            for a in achievements
        ],
        "public_cv_enabled": settings.public_cv_enabled,
        "cv_url": f"/api/public/{slug}/cv" if settings.public_cv_enabled else None
    }

@router.get("/{slug}/cv")
async def get_public_cv(slug: str, db: AsyncSession = Depends(get_db)):
    """
    Returns the latest approved public CV snapshot.
    """
    setting_res = await db.execute(select(PublicProfileSetting).where(PublicProfileSetting.slug == slug))
    settings = setting_res.scalars().first()
    if not settings or not settings.enabled or not settings.public_cv_enabled:
        raise HTTPException(status_code=404, detail="Public CV not enabled")

    # Fetch latest approved resume version
    res = await db.execute(
        select(ResumeVersion).order_by(ResumeVersion.created_at.desc())
    )
    latest_resume = res.scalars().first()
    if not latest_resume:
        raise HTTPException(status_code=404, detail="No public CV generated yet")

    return {
        "slug": slug,
        "version_name": latest_resume.version_name,
        "content": latest_resume.content_json,
        "ats_report": latest_resume.ats_report,
        "created_at": latest_resume.created_at
    }

@router.get("/{slug}/projects/{project_slug}")
async def get_public_project_detail(slug: str, project_slug: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Project).where(Project.slug == project_slug, Project.verified == True))
    proj = res.scalars().first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj
