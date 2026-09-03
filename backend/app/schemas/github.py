from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class GithubEvidenceItem(BaseModel):
    id: str
    repository_id: str
    evidence_type: str
    evidence_text: str
    source_path: Optional[str] = None
    detected_skill: str
    confidence: float
    proposal_status: str

    class Config:
        from_attributes = True

class GithubRepositoryResponse(BaseModel):
    id: str
    name: str
    full_name: str
    description: Optional[str] = None
    url: str
    language: Optional[str] = None
    stars: int = 0
    forks: int = 0
    last_synced_at: Optional[datetime] = None
    evidence: List[GithubEvidenceItem] = []

    class Config:
        from_attributes = True

class GithubAccountResponse(BaseModel):
    id: str
    provider: str
    username: str
    created_at: datetime
    repositories: List[GithubRepositoryResponse] = []

    class Config:
        from_attributes = True

class EvidenceApprovalRequest(BaseModel):
    action: str  # approve, reject
    add_as_verified_skill: bool = True
    add_as_project_evidence: bool = True
