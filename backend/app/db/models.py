import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid() -> str:
    return str(uuid.uuid4())

# 1. Profiles
class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    display_name = Column(String(255), nullable=False)
    headline = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    email_public = Column(String(255), nullable=True)
    phone_public = Column(String(50), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    website_url = Column(String(255), nullable=True)
    availability = Column(String(100), default="Open to opportunities")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    visibilities = relationship("ProfileVisibility", back_populates="profile", cascade="all, delete-orphan")

# 2. Profile Visibility Settings (Per-field privacy controls)
class ProfileVisibility(Base):
    __tablename__ = "profile_visibility"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    field_name = Column(String(100), nullable=False)
    visibility = Column(String(20), default="public")  # public / private / selective
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", back_populates="visibilities")

# 3. Skills
class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)  # languages, backend, frontend, data, ai_ml, devops, tools
    normalized_name = Column(String(100), nullable=False, index=True)
    proficiency = Column(String(50), default="Advanced")  # Beginner, Intermediate, Advanced, Expert
    verified = Column(Boolean, default=False)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    evidence_items = relationship("SkillEvidence", back_populates="skill", cascade="all, delete-orphan")
    projects = relationship("ProjectSkill", back_populates="skill", cascade="all, delete-orphan")

# 4. Skill Evidence
class SkillEvidence(Base):
    __tablename__ = "skill_evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    source_type = Column(String(50), nullable=False)  # github, project, experience, certification, education
    source_id = Column(String(100), nullable=True)
    evidence_text = Column(Text, nullable=False)
    evidence_url = Column(String(255), nullable=True)
    verification_state = Column(String(50), default="verified")  # verified, proposed, weak, unverified
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    skill = relationship("Skill", back_populates="evidence_items")

# 5. Projects
class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    short_description = Column(String(500), nullable=False)
    problem = Column(Text, nullable=False)
    solution = Column(Text, nullable=False)
    architecture = Column(Text, nullable=True)
    outcomes = Column(JSON, default=list)  # List of metrics / outcome strings
    technologies = Column(JSON, default=list)  # List of tech strings
    github_url = Column(String(255), nullable=True)
    demo_url = Column(String(255), nullable=True)
    featured = Column(Boolean, default=False)
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    skills = relationship("ProjectSkill", back_populates="project", cascade="all, delete-orphan")

# 6. Project Skills Mapping
class ProjectSkill(Base):
    __tablename__ = "project_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    evidence_strength = Column(String(50), default="strong")  # strong, moderate, mentioned

    project = relationship("Project", back_populates="skills")
    skill = relationship("Skill", back_populates="projects")

# 7. Experience
class Experience(Base):
    __tablename__ = "experience"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), default="Present")
    description = Column(Text, nullable=False)
    achievements = Column(JSON, default=list)
    technologies = Column(JSON, default=list)
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 8. Education
class Education(Base):
    __tablename__ = "education"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    institution = Column(String(255), nullable=False)
    degree = Column(String(255), nullable=False)
    field = Column(String(255), nullable=False)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    grade = Column(String(50), nullable=True)
    coursework = Column(JSON, default=list)
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# 9. Certifications
class Certification(Base):
    __tablename__ = "certifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    credential_url = Column(String(255), nullable=True)
    issue_date = Column(String(50), nullable=False)
    expiry_date = Column(String(50), nullable=True)
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# 10. Achievements
class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=True)
    date = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    evidence_url = Column(String(255), nullable=True)
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# 11. Preferences
class Preference(Base):
    __tablename__ = "preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    target_roles = Column(JSON, default=list)
    target_locations = Column(JSON, default=list)
    remote_preference = Column(String(50), default="remote_or_hybrid")
    target_industries = Column(JSON, default=list)
    target_companies = Column(JSON, default=list)
    excluded_companies = Column(JSON, default=list)
    minimum_match_score = Column(Integer, default=70)
    sponsorship_constraints = Column(String(100), default="None required / Authorized to work")
    internship_or_fulltime = Column(String(50), default="fulltime")
    application_preferences = Column(JSON, default=dict)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 12. GitHub Accounts
class GithubAccount(Base):
    __tablename__ = "github_accounts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    provider = Column(String(50), default="github")
    external_user_id = Column(String(100), nullable=True)
    username = Column(String(100), nullable=False)
    access_metadata = Column(JSON, default=dict)  # Token metadata (no raw secrets logged)
    created_at = Column(DateTime, default=datetime.utcnow)

    repositories = relationship("GithubRepository", back_populates="account", cascade="all, delete-orphan")

# 13. GitHub Repositories
class GithubRepository(Base):
    __tablename__ = "github_repositories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    github_account_id = Column(String(36), ForeignKey("github_accounts.id", ondelete="CASCADE"), nullable=False)
    external_repo_id = Column(String(100), nullable=True)
    name = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(255), nullable=False)
    default_branch = Column(String(100), default="main")
    language = Column(String(100), nullable=True)
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    last_synced_at = Column(DateTime, default=datetime.utcnow)

    account = relationship("GithubAccount", back_populates="repositories")
    evidence = relationship("GithubEvidence", back_populates="repository", cascade="all, delete-orphan")

# 14. GitHub Evidence
class GithubEvidence(Base):
    __tablename__ = "github_evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    repository_id = Column(String(36), ForeignKey("github_repositories.id", ondelete="CASCADE"), nullable=False)
    evidence_type = Column(String(50), nullable=False)  # dependency, readme, api_endpoint, dockerfile, tests
    evidence_text = Column(Text, nullable=False)
    source_path = Column(String(255), nullable=True)
    detected_skill = Column(String(100), nullable=False)
    confidence = Column(Float, default=0.85)
    proposal_status = Column(String(50), default="pending")  # pending, approved, rejected

    repository = relationship("GithubRepository", back_populates="evidence")

# 15. Job Sources
class JobSource(Base):
    __tablename__ = "job_sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    source_type = Column(String(50), nullable=False)  # manual_paste, url_import, greenhouse, lever, linkedin_assisted
    base_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    last_scraped_at = Column(DateTime, nullable=True)

# 16. Jobs
class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source = Column(String(100), nullable=False)
    external_id = Column(String(255), nullable=True)
    company = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    work_mode = Column(String(50), default="Remote")  # Remote, Hybrid, On-site
    url = Column(String(500), nullable=True)
    description = Column(Text, nullable=False)
    posted_at = Column(String(50), nullable=True)
    deadline = Column(String(50), nullable=True)
    normalized_hash = Column(String(64), nullable=False, unique=True, index=True)
    raw_snapshot_path = Column(String(255), nullable=True)
    status = Column(String(50), default="DISCOVERED")  # DISCOVERED, SHORTLISTED, APPROVED, APPLIED, ARCHIVED
    created_at = Column(DateTime, default=datetime.utcnow)

    requirements = relationship("JobRequirement", back_populates="job", cascade="all, delete-orphan")
    matches = relationship("JobMatch", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

# 17. Job Requirements
class JobRequirement(Base):
    __tablename__ = "job_requirements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    requirement_type = Column(String(50), nullable=False)  # technical_skill, experience, education, responsibility, eligibility
    requirement_text = Column(Text, nullable=False)
    normalized_skill = Column(String(100), nullable=True)
    mandatory = Column(Boolean, default=True)
    confidence = Column(Float, default=1.0)

    job = relationship("Job", back_populates="requirements")

# 18. Job Matches (Explainable Scoring)
class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False)  # 0 - 100
    eligibility_score = Column(Float, default=1.0)
    skill_score = Column(Float, default=0.0)
    project_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    preference_score = Column(Float, default=0.0)
    matched_evidence = Column(JSON, default=list)  # List of matched skills and their verified evidence IDs
    missing_requirements = Column(JSON, default=list)  # List of gaps
    explanation = Column(Text, nullable=False)
    recommended_action = Column(String(100), default="Apply with tailored resume")
    generated_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("Job", back_populates="matches")

# 19. Resume Families
class ResumeFamily(Base):
    __tablename__ = "resume_families"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)  # e.g., "SWE / Software Engineering", "Backend Developer", "ML/AI Engineer"
    slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=False)
    priority_rules = Column(JSON, default=list)  # Priority focus skills
    section_order = Column(JSON, default=list)   # e.g., ["summary", "skills", "projects", "experience", "education"]
    default_settings = Column(JSON, default=dict) # e.g., {"one_page": True, "ats_mode": True}

    versions = relationship("ResumeVersion", back_populates="family", cascade="all, delete-orphan")

# 20. Resume Versions (Immutable Snapshots)
class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    family_id = Column(String(36), ForeignKey("resume_families.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    version_name = Column(String(255), nullable=False)
    content_json = Column(JSON, nullable=False)  # Full verified structured snapshot
    rendered_pdf_path = Column(String(255), nullable=True)
    rendered_docx_path = Column(String(255), nullable=True)
    ats_report = Column(JSON, default=dict)  # Checklist & score
    factuality_report = Column(JSON, default=dict)  # Proof trace for every bullet
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)

    family = relationship("ResumeFamily", back_populates="versions")

# 21. Cover Letter Versions
class CoverLetterVersion(Base):
    __tablename__ = "cover_letter_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# 22. Applications (State Machine & History)
class Application(Base):
    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="AWAITING_APPROVAL")
    # DISCOVERED, ANALYZED, SHORTLISTED, AWAITING_APPROVAL, APPROVED, PREPARING, RESUME_READY,
    # APPLICATION_READY, IN_PROGRESS, WAITING_FOR_USER, SUBMITTED, ASSESSMENT, INTERVIEW,
    # OFFER, REJECTED, WITHDRAWN, FAILED
    approved_by_user_at = Column(DateTime, nullable=True)
    applied_at = Column(DateTime, nullable=True)
    source = Column(String(100), default="Direct Portal")
    application_url = Column(String(500), nullable=True)
    selected_resume_version_id = Column(String(36), ForeignKey("resume_versions.id", ondelete="SET NULL"), nullable=True)
    cover_letter_version_id = Column(String(36), ForeignKey("cover_letter_versions.id", ondelete="SET NULL"), nullable=True)
    notes = Column(Text, nullable=True)
    next_action = Column(String(255), nullable=True)
    next_action_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job = relationship("Job", back_populates="applications")
    events = relationship("ApplicationEvent", back_populates="application", cascade="all, delete-orphan")
    answers = relationship("ApplicationAnswer", back_populates="application", cascade="all, delete-orphan")
    followups = relationship("Followup", back_populates="application", cascade="all, delete-orphan")

# 23. Application Events (Auditable state timeline)
class ApplicationEvent(Base):
    __tablename__ = "application_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    source = Column(String(100), default="system")
    details = Column(JSON, default=dict)
    confidence = Column(Float, default=1.0)

    application = relationship("Application", back_populates="events")

# 24. Application Answers (Mapped field questions & generated answers)
class ApplicationAnswer(Base):
    __tablename__ = "application_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    field_name = Column(String(255), nullable=False)
    answer = Column(Text, nullable=False)
    evidence_source = Column(String(255), nullable=True)
    requires_review = Column(Boolean, default=False)
    approved = Column(Boolean, default=False)

    application = relationship("Application", back_populates="answers")

# 25. Followups
class Followup(Base):
    __tablename__ = "followups"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    due_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    application = relationship("Application", back_populates="followups")

# 26. Agent Runs (Observability & Safety)
class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_type = Column(String(100), nullable=False)
    input_summary = Column(Text, nullable=True)
    output_summary = Column(Text, nullable=True)
    status = Column(String(50), default="COMPLETED")  # STARTED, RUNNING, COMPLETED, FAILED, PAUSED_FOR_USER
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    error_code = Column(String(100), nullable=True)
    safe_metadata = Column(JSON, default=dict)

# 27. Audit Logs
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_type = Column(String(50), default="user")
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(JSON, default=dict)

# 28. Public Profile Settings
class PublicProfileSetting(Base):
    __tablename__ = "public_profile_settings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, nullable=False, default="alex-mercer")
    custom_domain = Column(String(255), nullable=True)
    enabled = Column(Boolean, default=True)
    seo_title = Column(String(255), default="Alex Mercer | Full-Stack AI Engineer & Placement Profile")
    seo_description = Column(Text, default="Personal AI Career Profile, verified GitHub evidence, live projects, and ATS CV.")
    public_cv_enabled = Column(Boolean, default=True)
    current_public_resume_id = Column(String(36), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 29. Career Proposals (From Natural Language Updates / GitHub Analyzer)
class CareerProposal(Base):
    __tablename__ = "career_proposals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source = Column(String(50), default="natural_language")  # natural_language, github, resume_import
    raw_input = Column(Text, nullable=False)
    parsed_diff = Column(JSON, nullable=False)  # {"added": [...], "changed": [...], "suggested": [...], "needs_clarification": [...]}
    status = Column(String(50), default="pending")  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
