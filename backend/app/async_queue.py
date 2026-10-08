import asyncio
import json
import logging
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import CaseModel, FaceEmbeddingModel, MatchCandidateModel, NotificationModel
from .matching_engine import evaluate_match_pair
from .notification_service import generate_safe_notification_text, dispatch_notification_with_backoff

logger = logging.getLogger("reunite_worker")

async def run_background_matching_job(case_id: str):
    """
    Background worker job (Celery/Redis queue equivalent).
    Executes matching calculations against all opposing open cases.
    """
    db: Session = SessionLocal()
    try:
        target_case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
        if not target_case or target_case.status in ["Reunited", "Closed"]:
            return

        opposing_type = "found" if target_case.case_type == "missing" else "missing"
        opposing_cases = db.query(CaseModel).filter(
            CaseModel.case_type == opposing_type,
            CaseModel.status.in_(["Searching", "Possible match"])
        ).all()

        # Fetch target embedding if exists
        target_emb_model = db.query(FaceEmbeddingModel).filter(FaceEmbeddingModel.case_id == case_id).first()
        target_vec = json.loads(target_emb_model.embedding_json) if target_emb_model else None

        for opp in opposing_cases:
            opp_emb_model = db.query(FaceEmbeddingModel).filter(FaceEmbeddingModel.case_id == opp.case_id).first()
            opp_vec = json.loads(opp_emb_model.embedding_json) if opp_emb_model else None

            missing_case = target_case if target_case.case_type == "missing" else opp
            found_case = opp if target_case.case_type == "missing" else target_case
            missing_vec = target_vec if target_case.case_type == "missing" else opp_vec
            found_vec = opp_vec if target_case.case_type == "missing" else target_vec

            match_res = evaluate_match_pair(missing_case, found_case, missing_vec, found_vec)

            # If score is Medium or High, store candidate match & update status
            if match_res["confidence_score"] >= 0.50:
                # Check if candidate already recorded
                existing = db.query(MatchCandidateModel).filter(
                    MatchCandidateModel.missing_case_id == missing_case.case_id,
                    MatchCandidateModel.found_case_id == found_case.case_id
                ).first()

                if not existing:
                    candidate = MatchCandidateModel(
                        missing_case_id=missing_case.case_id,
                        found_case_id=found_case.case_id,
                        confidence_score=match_res["confidence_score"],
                        confidence_band=match_res["confidence_band"],
                        explanation_text=match_res["explanation"],
                        field_contributions_json=json.dumps(match_res.get("field_contributions", {})),
                        face_similarity=match_res["face_similarity"],
                        location_similarity=match_res["location_similarity"],
                        time_similarity=match_res["time_similarity"],
                        text_similarity=match_res["text_similarity"],
                        status="Suggested"
                    )
                    db.add(candidate)
                    
                    # Update cases status to 'Possible match' if currently Searching
                    if missing_case.status == "Searching":
                        missing_case.status = "Possible match"
                    if found_case.status == "Searching":
                        found_case.status = "Possible match"
                        
                    # Queue safe privacy notifications for both sides
                    safe_msg_m = generate_safe_notification_text("possible_match", missing_case.case_id)
                    safe_msg_f = generate_safe_notification_text("possible_match", found_case.case_id)
                    
                    db.add(NotificationModel(case_id=missing_case.case_id, channel="Push", safe_message=safe_msg_m))
                    db.add(NotificationModel(case_id=found_case.case_id, channel="Push", safe_message=safe_msg_f))

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error in background matching worker: {e}")
    finally:
        db.close()
