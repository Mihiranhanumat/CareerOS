import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.db.models import (
    Base, Profile, ProfileVisibility, Skill, SkillEvidence, Project,
    Experience, Education, Job, JobRequirement, JobMatch, ResumeVersion,
    ResumeFamily, Application, Preference
)
from app.services.matching_engine import matching_engine
from app.services.resume_engine import resume_engine
from app.services.career_manager import career_manager_service
from app.services.export_service import export_service
from app.schemas.resumes import ResumeGenerateRequest

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

async def setup_test_db():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session = async_session()
    
    # 1. Profile
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

    # 2. Visibilities
    session.add(ProfileVisibility(profile_id="test-prof", field_name="display_name", visibility="public"))
    session.add(ProfileVisibility(profile_id="test-prof", field_name="email_public", visibility="selective"))
    session.add(ProfileVisibility(profile_id="test-prof", field_name="phone_public", visibility="private"))

    # 3. Skills
    s1 = Skill(id="sk-python", name="Python", category="languages", normalized_name="python", proficiency="Expert", verified=True)
    s2 = Skill(id="sk-fastapi", name="FastAPI", category="backend", normalized_name="fastapi", proficiency="Expert", verified=True)
    session.add_all([s1, s2])

    # 4. Evidence
    session.add(SkillEvidence(skill_id="sk-python", source_type="github", evidence_text="Built CareerOS backend in async Python", verification_state="verified"))
    session.add(SkillEvidence(skill_id="sk-fastapi", source_type="github", evidence_text="Developed async REST APIs", verification_state="verified"))

    # 5. Projects
    session.add(Project(
        id="proj-careeros",
        name="CareerOS",
        slug="careeros",
        short_description="AI career platform",
        problem="Resume tailoring fatigue",
        solution="Verified career knowledge base",
        technologies=["Python", "FastAPI", "PostgreSQL"],
        outcomes=["100% verified factuality"],
        verified=True
    ))

    # 6. Experience & Education
    session.add(Experience(
        id="exp-1",
        organization="Apex AI Systems",
        title="Senior Backend Engineer",
        start_date="2024",
        end_date="Present",
        description="Leading async microservices",
        achievements=["99.98% uptime across 12M daily requests"],
        verified=True
    ))
    session.add(Education(
        id="edu-1",
        institution="UC Berkeley",
        degree="B.S.",
        field="Computer Science",
        start_date="2020",
        end_date="2024",
        grade="3.88",
        verified=True
    ))

    # 7. Resume Family & Preferences
    session.add(ResumeFamily(
        id="fam-backend",
        name="Backend Developer",
        slug="backend",
        description="High performance backend focus",
        priority_rules=["Python", "FastAPI"]
    ))
    session.add(Preference(
        id="pref-1",
        target_roles=["Backend Engineer"],
        target_locations=["San Francisco, CA"],
        sponsorship_constraints="US Citizen / No sponsorship required"
    ))

    # 8. Job & Requirements
    session.add(Job(
        id="job-stripe",
        source="Direct",
        company="Stripe",
        title="Backend Engineer",
        location="San Francisco, CA",
        work_mode="Remote",
        description="Looking for Python and FastAPI backend engineer with database experience.",
        normalized_hash="test-hash-stripe-123",
        status="DISCOVERED"
    ))
    session.add(JobRequirement(job_id="job-stripe", requirement_type="technical_skill", requirement_text="Python", normalized_skill="Python", mandatory=True))
    session.add(JobRequirement(job_id="job-stripe", requirement_type="technical_skill", requirement_text="FastAPI", normalized_skill="FastAPI", mandatory=True))

    await session.commit()
    return session, engine

async def run_all_tests():
    print("=" * 60)
    print("CAREEROS AUTOMATED TEST SUITE EXECUTION")
    print("=" * 60)

    session, engine = await setup_test_db()
    passed = 0
    failed = 0

    # Test 1: Match Engine
    try:
        match_result = await matching_engine.calculate_match(session, "job-stripe")
        assert match_result.score >= 85, f"Expected score >= 85, got {match_result.score}"
        assert match_result.eligibility_score == 1.0, "Eligibility score mismatch"
        assert len(match_result.matched_evidence) >= 2, "Missing evidence matches"
        assert "Python" in [m["skill"] for m in match_result.matched_evidence]
        print(f"[PASS] TEST 1: Semantic & Deterministic Match Engine passed (Score: {match_result.score}%)")
        passed += 1
    except Exception as e:
        print(f"[FAIL] TEST 1: Match Engine FAILED: {e}")
        failed += 1

    # Test 2: Factuality Validator & Resume Engine
    try:
        resume_req = ResumeGenerateRequest(
            family_slug="backend",
            job_id="job-stripe",
            one_page_mode=True,
            ats_only_mode=True
        )
        resume = await resume_engine.generate_resume(session, resume_req)
        assert resume.version_name.startswith("Stripe_BACKEND_v")
        assert resume.factuality_report["hallucination_risk"] == "0.0%"
        assert resume.factuality_report["status"] == "PASSED_EVIDENCE_GATE"
        assert resume.ats_report["single_column"] is True
        assert resume.ats_report["ats_score"] >= 95
        print(f"[PASS] TEST 2: Factuality Validator & ATS Resume Generation passed (ATS: {resume.ats_report['ats_score']}/100)")
        passed += 1
    except Exception as e:
        print(f"[FAIL] TEST 2: Resume Engine FAILED: {e}")
        failed += 1

    # Test 3: Natural Language Update & Diff Proposal Gate
    try:
        raw_text = "I learned Docker containerization and deployed my FastAPI NLP service."
        proposal = await career_manager_service.parse_update_and_propose(session, raw_text)
        assert proposal.status == "pending"
        assert len(proposal.added) > 0

        # Approve proposal
        result = await career_manager_service.approve_proposal(session, proposal.proposal_id)
        assert result["status"] == "approved"
        assert result["applied_items"] > 0
        print("[PASS] TEST 3: Natural Language Update Diff & Human Approval Gate passed")
        passed += 1
    except Exception as e:
        print(f"[FAIL] TEST 3: Career Manager FAILED: {e}")
        failed += 1

    # Test 4: Export Formats & Backup Integrity
    try:
        json_data = await export_service.export_full_json_backup(session)
        assert json_data["profile"]["display_name"] == "Alex Mercer"
        assert len(json_data["skills"]) >= 2
        assert len(json_data["projects"]) >= 1

        csv_data = await export_service.export_skills_csv(session)
        assert "Skill ID" in csv_data
        assert "Python" in csv_data
        print("[PASS] TEST 4: Full JSON Backup & CSV Export Verification passed")
        passed += 1
    except Exception as e:
        print(f"[FAIL] TEST 4: Export Service FAILED: {e}")
        failed += 1

    await session.close()
    await engine.dispose()

    print("=" * 60)
    print(f"RESULTS: {passed} PASSED, {failed} FAILED")
    print("=" * 60)
    return failed == 0

if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
