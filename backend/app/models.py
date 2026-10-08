from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime
from datetime import datetime
from .database import Base

class CaseModel(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, unique=True, index=True)
    case_token = Column(String, unique=True, index=True)
    case_type = Column(String, index=True)  # 'missing' or 'found'
    status = Column(String, default="Searching")  # Searching -> Possible match -> Verified -> Reunited -> Closed -> Merged
    
    # Vulnerability category for review queue prioritization
    vulnerability_category = Column(String, default="Standard")  # Child, Elderly, Injured, Standard
    vulnerability_score = Column(Integer, default=20)  # Child=100, Injured=90, Elderly=80, Standard=20
    
    # Person details
    full_name = Column(String)
    normalized_name = Column(String, nullable=True, index=True)  # Phonetic normalized name for language-independent matching
    aliases_json = Column(Text, nullable=True)  # JSON array of alternate spellings, nicknames, native scripts
    family_links_json = Column(Text, nullable=True)  # JSON array of relationships: parent, child, sibling, guardian
    
    gender = Column(String)
    age = Column(Integer)
    height_cm = Column(Float, nullable=True)
    clothing_details = Column(Text)
    distinguishing_marks = Column(Text, nullable=True)
    
    # Location & Time
    last_known_location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    incident_timestamp = Column(String)
    
    # Encrypted sensitive reporter details (Field-level AES encryption)
    reporter_name_enc = Column(String)
    reporter_phone_enc = Column(String)
    reporter_device_id = Column(String, index=True)
    consent_given = Column(Boolean, default=True)
    
    # Family Secret Verification
    secret_question = Column(String, nullable=True)
    secret_answer_hash = Column(String, nullable=True)
    
    # Photos and Sync
    photo_url = Column(String, nullable=True)
    is_offline_sync = Column(Boolean, default=False)
    idempotency_key = Column(String, unique=True, nullable=True, index=True)
    merged_into_case_id = Column(String, nullable=True, index=True)
    
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class FaceEmbeddingModel(Base):
    __tablename__ = "face_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, index=True)
    embedding_json = Column(Text)  # JSON serialized array of 128-d float embeddings
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class MatchCandidateModel(Base):
    __tablename__ = "match_candidates"

    id = Column(Integer, primary_key=True, index=True)
    missing_case_id = Column(String, index=True)
    found_case_id = Column(String, index=True)
    
    confidence_score = Column(Float)
    confidence_band = Column(String)  # Low, Medium, High
    explanation_text = Column(Text)
    field_contributions_json = Column(Text, nullable=True)  # JSON dictionary of breakdown contributions
    
    face_similarity = Column(Float)
    location_similarity = Column(Float)
    time_similarity = Column(Float)
    text_similarity = Column(Float)
    
    status = Column(String, default="Suggested")  # Suggested, Under Review, Approved, Rejected
    secret_question_verified = Column(Boolean, default=False)
    responder_notes = Column(Text, nullable=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class DuplicateRecordModel(Base):
    __tablename__ = "duplicate_records"

    id = Column(Integer, primary_key=True, index=True)
    primary_case_id = Column(String, index=True)
    duplicate_case_id = Column(String, index=True)
    similarity_score = Column(Float)
    matching_factors = Column(Text)
    status = Column(String, default="Flagged")  # Flagged, Merged, Dismissed
    merged_by = Column(String, nullable=True)
    audit_notes = Column(Text, nullable=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, index=True)
    channel = Column(String)  # Push, SMS, WhatsApp
    safe_message = Column(Text)  # Privacy-first wording (No PII)
    delivery_status = Column(String, default="Pending")  # Pending, Delivered, Failed
    retry_count = Column(Integer, default=0)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True)
    action = Column(String)
    details = Column(String)
    spam_score = Column(Float, default=0.0)
    ip_address = Column(String, default="127.0.0.1")
    timestamp = Column(String, default=lambda: datetime.utcnow().isoformat())


class ShelterModel(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    capacity = Column(Integer)
    current_occupancy = Column(Integer)
    contact_phone = Column(String)
