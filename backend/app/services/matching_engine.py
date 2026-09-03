import re
from typing import Dict, Any, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Job, JobRequirement, Skill, SkillEvidence, Project, Experience, Preference
from app.schemas.jobs import JobMatchBreakdown

class MatchingEngine:
    """
    Explainable Semantic and Deterministic Match Engine.
    Combines verified facts, strict eligibility checks, skill evidence, and weighted multi-factor scoring.
    """

    async def calculate_match(self, db: AsyncSession, job_id: str) -> JobMatchBreakdown:
        # 1. Fetch Job and its requirements
        j_res = await db.execute(select(Job).where(Job.id == job_id))
        job = j_res.scalars().first()
        if not job:
            raise ValueError(f"Job {job_id} not found")

        r_res = await db.execute(select(JobRequirement).where(JobRequirement.job_id == job_id))
        requirements = r_res.scalars().all()

        # 2. Fetch User verified facts
        skills_res = await db.execute(select(Skill).where(Skill.verified == True))
        verified_skills = skills_res.scalars().all()
        skills_map = {s.normalized_name: s for s in verified_skills}

        ev_res = await db.execute(select(SkillEvidence).where(SkillEvidence.verification_state == "verified"))
        verified_evidences = ev_res.scalars().all()

        proj_res = await db.execute(select(Project).where(Project.verified == True))
        verified_projects = proj_res.scalars().all()

        exp_res = await db.execute(select(Experience).where(Experience.verified == True))
        verified_experiences = exp_res.scalars().all()

        pref_res = await db.execute(select(Preference))
        preferences = pref_res.scalars().first()

        # 3. Factor Evaluations
        # Factor A: Mandatory Technical Skills (Weight: 30%)
        mandatory_reqs = [r for r in requirements if r.requirement_type == "technical_skill" and r.mandatory]
        matched_evidence = []
        missing_requirements = []
        mandatory_hits = 0

        for req in mandatory_reqs:
            norm = (req.normalized_skill or req.requirement_text).lower().replace(" ", "_")
            found = False
            for s_norm, s_obj in skills_map.items():
                if norm in s_norm or s_norm in norm:
                    found = True
                    # Find supporting evidence
                    ev_text = next((e.evidence_text for e in verified_evidences if e.skill_id == s_obj.id), f"Verified skill: {s_obj.name}")
                    matched_evidence.append({
                        "skill": s_obj.name,
                        "proficiency": s_obj.proficiency,
                        "evidence": ev_text,
                        "evidence_strength": "strong"
                    })
                    break
            
            if found:
                mandatory_hits += 1
            else:
                missing_requirements.append({
                    "requirement": req.requirement_text,
                    "severity": "high",
                    "suggestion": f"Add verified proof or project evidence for {req.requirement_text}"
                })

        mandatory_score = (mandatory_hits / max(len(mandatory_reqs), 1)) if mandatory_reqs else 1.0

        # Factor B: Project & Experience Relevance (Weight: 20%)
        project_score = 0.0
        job_desc_lower = job.description.lower()
        for proj in verified_projects:
            for tech in (proj.technologies or []):
                if tech.lower() in job_desc_lower:
                    project_score += 0.25
        project_score = min(project_score, 1.0)
        if not verified_projects:
            project_score = 0.5

        # Factor C: Eligibility & Sponsorship (Weight: 15% - HARD GATE)
        eligibility_score = 1.0
        if preferences and preferences.sponsorship_constraints:
            # Check if job requires citizenship or sponsorship conflict
            if "us citizen" in job_desc_lower and "citizen" not in preferences.sponsorship_constraints.lower():
                eligibility_score = 0.0  # HARD BLOCKER

        # Factor D: Role Alignment (Weight: 10%)
        role_alignment_score = 0.8
        if preferences and preferences.target_roles:
            for target in preferences.target_roles:
                if target.lower() in job.title.lower() or job.title.lower() in target.lower():
                    role_alignment_score = 1.0
                    break

        # Factor E: Preferred Technologies (Weight: 10%)
        preferred_reqs = [r for r in requirements if not r.mandatory or r.requirement_type == "preferred_skill"]
        pref_hits = 0
        for req in preferred_reqs:
            norm = (req.normalized_skill or req.requirement_text).lower()
            if any(norm in s for s in skills_map.keys()):
                pref_hits += 1
        pref_tech_score = (pref_hits / max(len(preferred_reqs), 1)) if preferred_reqs else 0.9

        # Factor F: Location / Work Mode (Weight: 5%)
        location_score = 1.0
        if job.work_mode.lower() == "remote" or (preferences and preferences.remote_preference == "remote_or_hybrid"):
            location_score = 1.0
        else:
            location_score = 0.8

        # Factor G: Company Preference (Weight: 5%)
        company_score = 0.9
        if preferences:
            if any(c.lower() in job.company.lower() for c in (preferences.target_companies or [])):
                company_score = 1.0
            elif any(c.lower() in job.company.lower() for c in (preferences.excluded_companies or [])):
                company_score = 0.1

        # Factor H: Application Feasibility (Weight: 5%)
        feasibility_score = 1.0

        # Weighted Total (0 - 100)
        raw_score = (
            (mandatory_score * 30.0) +
            (project_score * 20.0) +
            (eligibility_score * 15.0) +
            (role_alignment_score * 10.0) +
            (pref_tech_score * 10.0) +
            (location_score * 5.0) +
            (company_score * 5.0) +
            (feasibility_score * 5.0)
        )

        # Enforce hard blocker rule: if eligibility failed, cap score at 30
        if eligibility_score < 0.5:
            final_score = int(min(raw_score, 30))
            explanation = f"Potential Blocker: Failed hard eligibility check for {job.company}. Job requires specific citizenship/sponsorship criteria."
            action = "Do not apply (Eligibility Blocker)"
        else:
            final_score = int(round(raw_score))
            matched_tech_str = ", ".join([m["skill"] for m in matched_evidence[:4]]) or "Core backend stack"
            if final_score >= 85:
                explanation = f"Exceptional {final_score}% match — strong verified evidence in {matched_tech_str}. Eligibility confirmed."
                action = "One-Click Approve and generate tailored resume"
            elif final_score >= 70:
                explanation = f"Strong {final_score}% match with solid foundation in {matched_tech_str}. Review missing requirements before applying."
                action = "Review application details and apply"
            else:
                explanation = f"Moderate {final_score}% match. Missing several key mandatory skills for this role."
                action = "Consider upskilling before applying"

        # Determine Recommended Resume Family
        recommended_family = "SWE / Software Engineering"
        title_lower = job.title.lower()
        if "backend" in title_lower or "infrastructure" in title_lower or "api" in title_lower:
            recommended_family = "Backend Developer"
        elif "full" in title_lower or "stack" in title_lower or "web" in title_lower:
            recommended_family = "Full-Stack Developer"
        elif "data" in title_lower or "analytics" in title_lower:
            recommended_family = "Data Science / Data Analyst"
        elif "ml" in title_lower or "machine learning" in title_lower or "ai" in title_lower:
            recommended_family = "Machine Learning / AI Engineer"
        elif "nlp" in title_lower or "genai" in title_lower or "llm" in title_lower:
            recommended_family = "NLP / Generative AI"

        return JobMatchBreakdown(
            score=final_score,
            eligibility_score=eligibility_score,
            skill_score=round(mandatory_score, 2),
            project_score=round(project_score, 2),
            experience_score=round(role_alignment_score, 2),
            preference_score=round(company_score, 2),
            matched_evidence=matched_evidence,
            missing_requirements=missing_requirements,
            explanation=explanation,
            recommended_action=action,
            recommended_resume_family=recommended_family,
            deadline_urgency="High" if job.deadline and "2026-09" in job.deadline else "Normal",
            application_feasibility="High"
        )

matching_engine = MatchingEngine()
