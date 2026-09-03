from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ResumeFamilyResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    priority_rules: List[str]
    section_order: List[str]
    default_settings: Dict[str, Any]

    class Config:
        from_attributes = True

class ResumeBulletEvidence(BaseModel):
    bullet_text: str
    supporting_evidence_ids: List[str] = []
    evidence_strength: str = "strong"  # strong / weak / unsupported
    status: str = "supported"  # supported / weak / unsupported
    suggested_action: str = "keep"  # keep / rewrite / remove

class FactualityReport(BaseModel):
    total_claims: int
    verified_claims: int
    unsupported_claims: int
    hallucination_risk: str
    status: str
    evidence_map: List[ResumeBulletEvidence] = []

class ATSReport(BaseModel):
    ats_score: int  # 0 - 100
    single_column: bool = True
    standard_fonts: bool = True
    parsable_headings: bool = True
    no_unsupported_graphics: bool = True
    extracted_text_fidelity: str = "100%"
    suggestions: List[str] = []

class ResumeGenerateRequest(BaseModel):
    family_slug: Optional[str] = None
    job_id: Optional[str] = None
    one_page_mode: bool = True
    ats_only_mode: bool = True
    section_order: Optional[List[str]] = None
    custom_instruction: Optional[str] = None  # e.g., "Prioritize Python and FastAPI", "Move projects above education"

class ResumeVersionResponse(BaseModel):
    id: str
    family_id: str
    job_id: Optional[str] = None
    version_name: str
    content_json: Dict[str, Any]
    rendered_pdf_path: Optional[str] = None
    rendered_docx_path: Optional[str] = None
    ats_report: Dict[str, Any]
    factuality_report: Dict[str, Any]
    created_at: datetime
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CoverLetterResponse(BaseModel):
    id: str
    job_id: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
