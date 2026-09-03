import pytest
import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select
from app.db.models import (
    Base, Profile, ProfileVisibility, Skill, SkillEvidence, Project,
    Experience, Education, Job, JobRequirement, JobMatch, ResumeVersion,
    ResumeFamily, Application, ApplicationEvent, Preference
)
from app.services.matching_engine import matching_engine
from app.services.resume_engine import resume_engine
from app.services.career_manager import career_manager_service
from app.services.export_service import export_service
from app.schemas.resumes import ResumeGenerateRequest

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture
async def test_db():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # Seed test facts
        prof = Profile(
            id="test-prof",
            display_name="Alex Mercer",
            headline="Senior Backend Engineer",
            summary="FastAPI and Python systems specialist.",
            location="San Francisco, CA",
            email_public="alex.mercer.eng@gmail.com",
            phone_public="+1 (415) 555-0192"
        )
        session.add(prof)

        vis1 = ProfileVisibility(profile_id="test-prof", field_name="display_name", visibility="public")
        vis2 = ProfileVisibility(profile_id="test-prof", field_name="email_public", visibility="selective")
        vis3 = ProfileVisibility(profile_id="test-prof", field_name="phone_public", visibility="private")
        session.add_all([vis1, vis2, vis3])

        skill1 = Skill(id="sk-python", name="Python", category="languages", normalized_name="python", proficiency="Expert", verified=True)
        skill2 = Skill(id="sk-fastapi", name="FastAPI", category="backend", normalized_name="fastapi", proficiency="Expert", verified=True)
        session.add_all([skill1, skill2])

        ev1 = SkillEvidence(skill_id="sk-python", source_type="github", evidence_text="Built CareerOS backend in async Python", verification_state="verified")
        ev2 = SkillEvidence(skill_id="sk-fastapi", source_type="github", evidence_text="Developed async REST APIs", verification_state="verified")
        session.add_all([ev1, ev2])

        proj1 = Project(
            id="proj-careeros",
            name="CareerOS",
            slug="careeros",
            short_description="AI career platform",
            problem="Resume tailoring fatigue",
            solution="Verified career knowledge base",
            technologies=["Python", "FastAPI", "PostgreSQL"],
            outcomes=["100% verified factuality"],
            verified=True
        )
        session.add(proj1)

        exp1 = Experience(
            id="exp-1",
            organization="Apex AI Systems",
            title="Senior Backend Engineer",
            start_date="2024",
            end_date="Present",
            description="Leading async microservices",
            achievements=["99.98% uptime across 12M daily requests"],
            verified=True
        )
        session.add(exp1)

        edu1 = Education(
            id="edu-1",
            institution="UC Berkeley",
            degree="B.S.",
            field="Computer Science",
            start_date="2020",
            end_date="2024",
            grade="3.88",
            verified=True
        )
        session.add(edu1)

        fam = ResumeFamily(
            id="fam-backend",
            name="Backend Developer",
            slug="backend",
            description="High performance backend focus",
            priority_rules=["Python", "FastAPI"]
        )
        session.add(fam)

        pref = Preference(
            id="pref-1",
            target_roles=["Backend Engineer"],
            target_locations=["San Francisco, CA"],
            sponsorship_constraints="US Citizen / No sponsorship required"
        )
        session.add(pref)

        job1 = Job(
            id="job-stripe",
            source="Direct",
            company="Stripe",
            title="Backend Engineer",
            location="San Francisco, CA",
            work_mode="Remote",
            description="Looking for Python and FastAPI backend engineer with database experience.",
            normalized_hash="test-hash-stripe-123",
            status="DISCOVERED"
        )
        session.add(job1)

        req1 = JobRequirement(job_id="job-stripe", requirement_type="technical_skill", requirement_text="Python", normalized_skill="Python", mandatory=True)
        req2 = JobRequirement(job_id="job-stripe", requirement_type="technical_skill", requirement_text="FastAPI", normalized_skill="FastAPI", mandatory=True)
        session.add_all([req1, req2])

        await session.commit()
        yield session

    await engine.dispose()

@pytest.mark.asyncio
async def test_semantic_match_engine(test_db: AsyncSession):
    match_result = await matching_engine.calculate_match(test_db, "job-stripe")
    assert match_result.score >= 85
    assert match_result.eligibility_score == 1.0
    assert len(match_result.matched_evidence) >= 2
    assert "Python" in [m["skill"] for m in match_result.matched_evidence]

@pytest.mark.asyncio
async def test_factuality_validator_and_resume_generation(test_db: AsyncSession):
    resume_req = ResumeGenerateRequest(
        family_slug="backend",
        job_id="job-stripe",
        one_page_mode=True,
        ats_only_mode=True
    )
    resume = await resume_engine.generate_resume(test_db, resume_req)
    assert resume.version_name.startswith("Stripe_BACKEND_v")
    assert resume.factuality_report["hallucination_risk"] == "0.0%"
    assert resume.factuality_report["status"] == "PASSED_EVIDENCE_GATE"
    assert resume.ats_report["single_column"] is True
    assert resume.ats_report["ats_score"] >= 95

@pytest.mark.asyncio
async def test_natural_language_update_proposal_and_approval(test_db: AsyncSession):
    raw_text = "I learned Docker containerization and deployed my FastAPI NLP service."
    proposal = await career_manager_service.parse_update_and_propose(test_db, raw_text)
    assert proposal.status == "pending"
    assert len(proposal.added) > 0

    # Test approval
    result = await career_manager_service.approve_proposal(test_db, proposal.proposal_id)
    assert result["status"] == "approved"
    assert result["applied_items"] > 0

@pytest.mark.asyncio
async def test_export_backup_formats(test_db: AsyncSession):
    json_data = await export_service.export_full_json_backup(test_db)
    assert json_data["profile"]["display_name"] == "Alex Mercer"
    assert len(json_data["skills"]) >= 2
    assert len(json_data["projects"]) >= 1

    csv_data = await export_service.export_skills_csv(test_db)
    assert "Skill ID" in csv_data
    assert "Python" in csv_data
