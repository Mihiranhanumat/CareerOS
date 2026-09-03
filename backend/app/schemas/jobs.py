from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class JobRequirementItem(BaseModel):
    id: Optional[str] = None
    requirement_type: str  # technical_skill, experience, education, responsibility, eligibility
    requirement_text: str
    normalized_skill: Optional[str] = None
    mandatory: bool = True
    confidence: float = 1.0

class JobImportInput(BaseModel):
    source: str = "Manual Paste"  # Manual Paste, URL Import, Greenhouse, Lever, LinkedIn Assisted
    url: Optional[str] = None
    company: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    work_mode: str = "Remote"
    description: str

class JobMatchBreakdown(BaseModel):
    score: int  # 0 - 100
    eligibility_score: float
    skill_score: float
    project_score: float
    experience_score: float
    preference_score: float
    matched_evidence: List[Dict[str, Any]]
    missing_requirements: List[Dict[str, Any]]
    explanation: str
    recommended_action: str
    recommended_resume_family: str = "Backend Developer"
    deadline_urgency: str = "Normal"
    application_feasibility: str = "High"

class JobResponse(BaseModel):
    id: str
    source: str
    external_id: Optional[str] = None
    company: str
    title: str
    location: str
    work_mode: str
    url: Optional[str] = None
    description: str
    posted_at: Optional[str] = None
    deadline: Optional[str] = None
    status: str
    created_at: datetime
    requirements: List[JobRequirementItem] = []
    latest_match: Optional[JobMatchBreakdown] = None

    class Config:
        from_attributes = True

class MatchScoreWeightConfig(BaseModel):
    mandatory_technical_skills: float = 30.0
    project_experience_relevance: float = 20.0
    eligibility: float = 15.0
    role_alignment: float = 10.0
    preferred_technologies: float = 10.0
    location_work_mode: float = 5.0
    company_industry_preference: float = 5.0
    application_feasibility: float = 5.0
