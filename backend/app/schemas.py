from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class FamilyLinkItem(BaseModel):
    relation: str = Field(..., description="Parent, Child, Sibling, Guardian, Spouse, Relative")
    name: str = Field(..., description="Name of family member")
    phone: Optional[str] = None

class CaseCreateSchema(BaseModel):
    case_type: str = Field(..., description="missing or found")
    vulnerability_category: Optional[str] = "Standard"  # Child, Elderly, Injured, Standard
    full_name: Optional[str] = "Unknown / Unidentified"
    aliases: Optional[List[str]] = []  # Alternate spellings, nicknames, native scripts
    family_links: Optional[List[FamilyLinkItem]] = []  # Family relationships graph
    
    gender: str = Field(..., description="Male, Female, Other, Unknown")
    age: int = Field(..., ge=0, le=120)
    height_cm: Optional[float] = None
    clothing_details: str
    distinguishing_marks: Optional[str] = None
    
    last_known_location: str
    latitude: float
    longitude: float
    incident_timestamp: str
    
    reporter_name: str
    reporter_phone: str
    reporter_device_id: str
    consent_given: bool = True
    
    secret_question: Optional[str] = None
    secret_answer: Optional[str] = None
    
    idempotency_key: Optional[str] = None
    is_offline_sync: bool = False

class CaseResponseSchema(BaseModel):
    case_id: str
    case_token: str
    case_type: str
    status: str
    vulnerability_category: str
    vulnerability_score: int
    full_name: Optional[str]
    aliases: Optional[List[str]] = []
    family_links: Optional[List[Dict[str, Any]]] = []
    gender: str
    age: int
    height_cm: Optional[float]
    clothing_details: str
    distinguishing_marks: Optional[str]
    last_known_location: str
    latitude: float
    longitude: float
    incident_timestamp: str
    secret_question: Optional[str]
    photo_url: Optional[str]
    created_at: str

    class Config:
        from_attributes = True

class MatchReviewSchema(BaseModel):
    match_id: int
    action: str  # Approve, Reject, Need Info
    secret_answer_provided: Optional[str] = None
    responder_notes: Optional[str] = None
    escalate_to_authority: Optional[bool] = False

class MergeDuplicateSchema(BaseModel):
    duplicate_record_id: int
    action: str  # Merge or Dismiss
    notes: Optional[str] = None

class OfflineSyncPayload(BaseModel):
    device_id: str
    queued_cases: List[CaseCreateSchema]

class StatusCheckSchema(BaseModel):
    case_id: str
    case_token: str
    secret_answer: Optional[str] = None
