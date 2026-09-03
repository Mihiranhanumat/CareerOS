from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class ApplicationEventItem(BaseModel):
    id: str
    event_type: str
    timestamp: datetime
    source: str
    details: Dict[str, Any]
    confidence: float

    class Config:
        from_attributes = True

class ApplicationAnswerItem(BaseModel):
    id: str
    field_name: str
    answer: str
    evidence_source: Optional[str] = None
    requires_review: bool = False
    approved: bool = False

    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    status: str
    approved_by_user_at: Optional[datetime] = None
    applied_at: Optional[datetime] = None
    source: str
    application_url: Optional[str] = None
    selected_resume_version_id: Optional[str] = None
    cover_letter_version_id: Optional[str] = None
    notes: Optional[str] = None
    next_action: Optional[str] = None
    next_action_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    events: List[ApplicationEventItem] = []
    answers: List[ApplicationAnswerItem] = []

    class Config:
        from_attributes = True

class OneClickApprovalRequest(BaseModel):
    job_id: str
    custom_resume_family: Optional[str] = None

class ApplicationUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    next_action: Optional[str] = None
    next_action_at: Optional[datetime] = None

class BrowserActionPayload(BaseModel):
    action: str  # start, pause, resume, checkpoint_resolve
    checkpoint_response: Optional[Dict[str, Any]] = None
