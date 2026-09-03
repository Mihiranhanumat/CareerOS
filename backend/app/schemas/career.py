from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ProfileBase(BaseModel):
    display_name: str
    headline: str
    summary: str
    location: str
    email_public: Optional[str] = None
    phone_public: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    availability: str = "Open to opportunities"

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    location: Optional[str] = None
    email_public: Optional[str] = None
    phone_public: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website_url: Optional[str] = None
    availability: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProfileVisibilityItem(BaseModel):
    field_name: str
    visibility: str  # public / private / selective

class SkillEvidenceItem(BaseModel):
    id: Optional[str] = None
    skill_id: Optional[str] = None
    source_type: str
    source_id: Optional[str] = None
    evidence_text: str
    evidence_url: Optional[str] = None
    verification_state: str = "verified"
    confidence: float = 1.0

class SkillBase(BaseModel):
    name: str
    category: str
    normalized_name: str
    proficiency: str = "Advanced"
    verified: bool = False
    confidence: float = 1.0

class SkillCreate(SkillBase):
    evidence: Optional[List[SkillEvidenceItem]] = None

class SkillResponse(SkillBase):
    id: str
    created_at: datetime
    updated_at: datetime
    evidence_items: List[SkillEvidenceItem] = []

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    slug: str
    short_description: str
    problem: str
    solution: str
    architecture: Optional[str] = None
    outcomes: List[str] = []
    technologies: List[str] = []
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    featured: bool = False
    verified: bool = True

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ExperienceBase(BaseModel):
    organization: str
    title: str
    location: Optional[str] = None
    start_date: str
    end_date: str = "Present"
    description: str
    achievements: List[str] = []
    technologies: List[str] = []
    verified: bool = True

class ExperienceResponse(ExperienceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EducationBase(BaseModel):
    institution: str
    degree: str
    field: str
    start_date: str
    end_date: str
    grade: Optional[str] = None
    coursework: List[str] = []
    verified: bool = True

class EducationResponse(EducationBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class CertificationBase(BaseModel):
    name: str
    issuer: str
    credential_url: Optional[str] = None
    issue_date: str
    expiry_date: Optional[str] = None
    verified: bool = True

class CertificationResponse(CertificationBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class AchievementBase(BaseModel):
    title: str
    organization: Optional[str] = None
    date: str
    description: str
    evidence_url: Optional[str] = None
    verified: bool = True

class AchievementResponse(AchievementBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class PreferenceBase(BaseModel):
    target_roles: List[str] = []
    target_locations: List[str] = []
    remote_preference: str = "remote_or_hybrid"
    target_industries: List[str] = []
    target_companies: List[str] = []
    excluded_companies: List[str] = []
    minimum_match_score: int = 70
    sponsorship_constraints: str = "None required / Authorized to work"
    internship_or_fulltime: str = "fulltime"
    application_preferences: Dict[str, Any] = {}

class PreferenceResponse(PreferenceBase):
    id: str
    updated_at: datetime

    class Config:
        from_attributes = True

# Natural Language Career Update Models
class NaturalLanguageUpdateInput(BaseModel):
    text: str = Field(..., description="Informal career update e.g., 'I learned Docker and containerized my FastAPI NLP project.'")

class ProposalDiffItem(BaseModel):
    type: str  # skill, project, experience, achievement, certification
    action: str  # added, changed, suggested, needs_clarification
    title: str
    details: Dict[str, Any]
    evidence_required: bool = False
    evidence_text: Optional[str] = None
    confidence: float = 0.9

class ProposalDiffResponse(BaseModel):
    proposal_id: str
    raw_input: str
    added: List[ProposalDiffItem] = []
    changed: List[ProposalDiffItem] = []
    suggested: List[ProposalDiffItem] = []
    needs_clarification: List[ProposalDiffItem] = []
    status: str = "pending"
