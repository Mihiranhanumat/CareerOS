import json
import csv
import io
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import (
    Profile, Skill, SkillEvidence, Project, Experience, Education,
    Certification, Achievement, Preference, Job, Application, ResumeVersion
)

class ExportService:
    """
    Handles complete JSON backup and structured CSV exports
    for applications, career facts, projects, and skills.
    """

    async def export_full_json_backup(self, db: AsyncSession) -> Dict[str, Any]:
        p_res = await db.execute(select(Profile))
        profile = p_res.scalars().first()

        s_res = await db.execute(select(Skill))
        skills = s_res.scalars().all()

        proj_res = await db.execute(select(Project))
        projects = proj_res.scalars().all()

        exp_res = await db.execute(select(Experience))
        experiences = exp_res.scalars().all()

        edu_res = await db.execute(select(Education))
        education = edu_res.scalars().all()

        app_res = await db.execute(select(Application))
        applications = app_res.scalars().all()

        return {
            "version": "1.0.0",
            "exported_at": "2026-09-03T16:00:00Z",
            "profile": {
                "display_name": profile.display_name if profile else "",
                "headline": profile.headline if profile else "",
                "summary": profile.summary if profile else "",
                "location": profile.location if profile else "",
                "email": profile.email_public if profile else ""
            },
            "skills": [{"name": s.name, "category": s.category, "proficiency": s.proficiency, "verified": s.verified} for s in skills],
            "projects": [{"name": p.name, "slug": p.slug, "problem": p.problem, "solution": p.solution, "technologies": p.technologies, "outcomes": p.outcomes} for p in projects],
            "experience": [{"organization": e.organization, "title": e.title, "dates": f"{e.start_date}-{e.end_date}", "achievements": e.achievements} for e in experiences],
            "education": [{"institution": ed.institution, "degree": ed.degree, "field": ed.field, "grade": ed.grade} for ed in education],
            "applications": [{"id": a.id, "job_id": a.job_id, "status": a.status, "applied_at": str(a.applied_at)} for a in applications]
        }

    async def export_applications_csv(self, db: AsyncSession) -> str:
        app_res = await db.execute(select(Application))
        applications = app_res.scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Application ID", "Job ID", "Status", "Source", "Approved At", "Applied At", "Notes", "Next Action"])

        for a in applications:
            writer.writerow([a.id, a.job_id, a.status, a.source, a.approved_by_user_at, a.applied_at, a.notes, a.next_action])

        return output.getvalue()

    async def export_skills_csv(self, db: AsyncSession) -> str:
        s_res = await db.execute(select(Skill))
        skills = s_res.scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Skill ID", "Name", "Category", "Proficiency", "Verified", "Confidence"])

        for s in skills:
            writer.writerow([s.id, s.name, s.category, s.proficiency, s.verified, s.confidence])

        return output.getvalue()

export_service = ExportService()
