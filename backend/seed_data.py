import sys
import os
import json
from datetime import datetime, timedelta

# Append backend directory to path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal, Base, engine
from app.models import CaseModel, FaceEmbeddingModel, MatchCandidateModel, ShelterModel, AuditLogModel
from app.crypto_utils import encrypt_sensitive_field, hash_secret_answer, generate_case_id, generate_case_token
from app.matching_engine import evaluate_match_pair

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("[SEED] Seeding database with realistic missing/found cases & shelters...")

    # 1. Shelters
    shelters_data = [
        ShelterModel(name="Hope Central Rescue Center", location="Chennai Central", latitude=13.0827, longitude=80.2707, capacity=150, current_occupancy=42, contact_phone="+91 98765 43210"),
        ShelterModel(name="Sanctuary Elder & Child Care", location="T. Nagar, Chennai", latitude=13.0418, longitude=80.2341, capacity=80, current_occupancy=65, contact_phone="+91 98765 12345"),
        ShelterModel(name="Metro Disaster Transit Shelter", location="Koyambedu, Chennai", latitude=13.0694, longitude=80.1948, capacity=200, current_occupancy=110, contact_phone="+91 98765 67890"),
    ]
    db.add_all(shelters_data)

    now = datetime.utcnow()

    # 2. Missing Cases
    missing_1 = CaseModel(
        case_id="MP-CHILD-101",
        case_token="TK-M101-SECURE",
        case_type="missing",
        status="Searching",
        vulnerability_category="Child",
        vulnerability_score=100,
        full_name="Aarav Kumar",
        normalized_name="arav kumar",
        aliases_json=json.dumps(["Arav", "Aarav K.", "ஆர்வ்"]),
        family_links_json=json.dumps([
            {"relation": "Mother", "name": "Priya Kumar", "phone": "+91 99401 22334"},
            {"relation": "Sister", "name": "Anita Kumar"}
        ]),
        gender="Male",
        age=7,
        height_cm=120.0,
        clothing_details="Blue shirt, denim shorts, red sneakers",
        distinguishing_marks="Small scar on left chin",
        last_known_location="Marina Beach North Pavilion, Chennai",
        latitude=13.0500,
        longitude=80.2824,
        incident_timestamp=(now - timedelta(hours=4)).isoformat(),
        reporter_name_enc=encrypt_sensitive_field("Priya Kumar (Mother)"),
        reporter_phone_enc=encrypt_sensitive_field("+91 99401 22334"),
        reporter_device_id="DEV-MOTHER-01",
        secret_question="What is the name of Aarav's favorite pet dog?",
        secret_answer_hash=hash_secret_answer("Bruno"),
        photo_url="",
        idempotency_key="IDEMP-M101"
    )

    missing_2 = CaseModel(
        case_id="MP-ELDER-102",
        case_token="TK-M102-SECURE",
        case_type="missing",
        status="Searching",
        vulnerability_category="Elderly",
        vulnerability_score=80,
        full_name="Ramanathan Iyer",
        normalized_name="ramanatan iyer",
        aliases_json=json.dumps(["Ramana", "Ramanathan", "ரமணா"]),
        family_links_json=json.dumps([
            {"relation": "Son", "name": "Suresh Iyer", "phone": "+91 98402 33445"}
        ]),
        gender="Male",
        age=76,
        height_cm=168.0,
        clothing_details="White dhoti, light green shirt, silver wrist watch",
        distinguishing_marks="Glasses, memory disorientation (dementia)",
        last_known_location="T. Nagar Bus Terminus",
        latitude=13.0400,
        longitude=80.2330,
        incident_timestamp=(now - timedelta(hours=14)).isoformat(),
        reporter_name_enc=encrypt_sensitive_field("Suresh Iyer (Son)"),
        reporter_phone_enc=encrypt_sensitive_field("+91 98402 33445"),
        reporter_device_id="DEV-SON-02",
        secret_question="What town was grandfather born in?",
        secret_answer_hash=hash_secret_answer("Madurai"),
        photo_url="",
        idempotency_key="IDEMP-M102"
    )

    # 3. Found Cases
    found_1 = CaseModel(
        case_id="FP-BOY-201",
        case_token="TK-F201-SECURE",
        case_type="found",
        status="Searching",
        vulnerability_category="Child",
        vulnerability_score=100,
        full_name="Unidentified Young Boy",
        normalized_name="unidentified young boy",
        aliases_json=json.dumps(["Arav", "Young kid near beach"]),
        family_links_json=json.dumps([
            {"relation": "Possible Mother", "name": "Priya Kumar"}
        ]),
        gender="Male",
        age=8,
        height_cm=122.0,
        clothing_details="Blue shirt with cartoon emblem, denim shorts",
        distinguishing_marks="Small scar on chin",
        last_known_location="Santhome Church Plaza (2 km from Marina)",
        latitude=13.0335,
        longitude=80.2785,
        incident_timestamp=(now - timedelta(hours=2)).isoformat(),
        reporter_name_enc=encrypt_sensitive_field("Volunteer K. Selvam"),
        reporter_phone_enc=encrypt_sensitive_field("+91 97903 44556"),
        reporter_device_id="DEV-VOLUNTEER-01",
        secret_question=None,
        secret_answer_hash=None,
        photo_url="",
        idempotency_key="IDEMP-F201"
    )

    # Duplicate case for demo
    missing_dup = CaseModel(
        case_id="MP-CHILD-101-DUP",
        case_token="TK-M101-DUP",
        case_type="missing",
        status="Searching",
        vulnerability_category="Child",
        vulnerability_score=100,
        full_name="Arav Kumar",
        normalized_name="arav kumar",
        aliases_json=json.dumps(["Aarav"]),
        gender="Male",
        age=7,
        clothing_details="Blue t-shirt, denim shorts",
        last_known_location="Marina Beach",
        latitude=13.0510,
        longitude=80.2830,
        incident_timestamp=(now - timedelta(hours=3)).isoformat(),
        reporter_name_enc=encrypt_sensitive_field("Uncle Rajesh"),
        reporter_phone_enc=encrypt_sensitive_field("+91 99401 99999"),
        reporter_device_id="DEV-UNCLE-03",
        idempotency_key="IDEMP-M101-DUP"
    )

    db.add_all([missing_1, missing_2, found_1, missing_dup])
    db.commit()

    # Add Duplicate Flag Record
    from app.models import DuplicateRecordModel
    db.add(DuplicateRecordModel(
        primary_case_id="MP-CHILD-101",
        duplicate_case_id="MP-CHILD-101-DUP",
        similarity_score=0.92,
        matching_factors="Name match ('Aarav Kumar' vs 'Arav Kumar'), Dist: 0.15 km, Age: 7 yrs",
        status="Flagged"
    ))

    # Generate Dummy Vectors (128-d)
    import numpy as np
    rng = np.random.default_rng(42)
    v1 = (rng.standard_normal(128) / np.linalg.norm(rng.standard_normal(128))).tolist()
    # v2 close to v1 for high simulated face match
    v2 = (np.array(v1) + 0.05 * rng.standard_normal(128)).tolist()
    v2 = (np.array(v2) / np.linalg.norm(v2)).tolist()

    db.add(FaceEmbeddingModel(case_id="MP-CHILD-101", embedding_json=json.dumps(v1)))
    db.add(FaceEmbeddingModel(case_id="FP-BOY-201", embedding_json=json.dumps(v2)))

    # Compute candidate match
    res = evaluate_match_pair(missing_1, found_1, v1, v2)
    candidate = MatchCandidateModel(
        missing_case_id="MP-CHILD-101",
        found_case_id="FP-BOY-201",
        confidence_score=res["confidence_score"],
        confidence_band=res["confidence_band"],
        explanation_text=res["explanation"],
        face_similarity=res["face_similarity"],
        location_similarity=res["location_similarity"],
        time_similarity=res["time_similarity"],
        text_similarity=res["text_similarity"],
        status="Suggested"
    )
    db.add(candidate)

    missing_1.status = "Possible match"
    found_1.status = "Possible match"

    # Audit log
    db.add(AuditLogModel(device_id="SYSTEM", action="SEED_DATA", details="Initial database seed executed cleanly."))

    db.commit()
    db.close()
    print("[SEED SUCCESS] Seeding complete! Database pre-loaded with demo cases and high-confidence match.")

if __name__ == "__main__":
    seed_database()
