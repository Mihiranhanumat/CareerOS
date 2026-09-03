from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class CredentialCheckItem(BaseModel):
    service: str
    status: str  # configured / missing / optional / valid / invalid
    env_var: str
    is_required: bool
    purpose: str
    setup_url: str
    instructions: str
    test_endpoint: str
    expected_result: str

class SystemHealthResponse(BaseModel):
    database: Dict[str, Any]
    ai: Dict[str, Any]
    github: Dict[str, Any]
    storage: Dict[str, Any]
    browser: Dict[str, Any]
    public_url: Dict[str, Any]
    overall_status: str  # healthy / degraded / disconnected

class InterviewPrepPack(BaseModel):
    job_id: str
    company: str
    role: str
    technical_questions: List[Dict[str, Any]]
    behavioral_questions: List[Dict[str, Any]]
    project_star_stories: List[Dict[str, Any]]
    weak_areas_to_address: List[str]
    final_day_checklist: List[str]

class AnalyticsResponse(BaseModel):
    funnel: Dict[str, int]
    role_performance: List[Dict[str, Any]]
    source_performance: List[Dict[str, Any]]
    skill_gaps: List[Dict[str, Any]]
    weekly_metrics: Dict[str, Any]
    learning_recommendations: List[Dict[str, Any]]
