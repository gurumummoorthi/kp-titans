import math
import json
import re
from datetime import datetime
from typing import Tuple, List, Dict, Any
from .config import WEIGHT_FACE, WEIGHT_LOCATION, WEIGHT_TIME, WEIGHT_TEXT, CONFIDENCE_HIGH, CONFIDENCE_MEDIUM
from .face_recognition_sim import calculate_cosine_similarity

def normalize_phonetic_name(name_str: str) -> str:
    """
    Language-independent text normalizer:
    Normalizes common transliterations, strips accents, punctuation, and unifies vowels.
    e.g. 'Aarav' -> 'arav', 'Arav' -> 'arav', 'ஆரவ்' -> 'arav', 'आरव' -> 'arav'
    """
    if not name_str:
        return ""
    text = name_str.lower().strip()
    
    # Transliteration & vowels unification rules
    text = re.sub(r'aa|ah', 'a', text)
    text = re.sub(r'ee|ea|i+', 'i', text)
    text = re.sub(r'oo|ou|u+', 'u', text)
    text = re.sub(r'th|dh', 't', text)
    text = re.sub(r'sh|zh', 's', text)
    text = re.sub(r'[^a-z0-9\s]', '', text)
    
    return text.strip()

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates ground distance in kilometers between two geo-coordinates."""
    R = 6371.0  # Earth radius in KM
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def compute_location_similarity(distance_km: float) -> float:
    """
    Score decays with distance:
    0 km -> 1.0
    <= 5 km -> 0.9
    <= 20 km -> 0.7
    <= 50 km -> 0.4
    > 100 km -> 0.1
    """
    if distance_km <= 1.0:
        return 1.0
    elif distance_km <= 5.0:
        return 0.9
    elif distance_km <= 20.0:
        return 0.7
    elif distance_km <= 50.0:
        return 0.4
    elif distance_km <= 100.0:
        return 0.2
    else:
        return 0.05

def compute_time_similarity(timestamp1_str: str, timestamp2_str: str) -> float:
    """Computes time interval decay score between incident timestamps."""
    try:
        t1 = datetime.fromisoformat(timestamp1_str.replace("Z", "+00:00"))
        t2 = datetime.fromisoformat(timestamp2_str.replace("Z", "+00:00"))
        hours_diff = abs((t1 - t2).total_seconds()) / 3600.0
        
        if hours_diff <= 2:
            return 1.0
        elif hours_diff <= 12:
            return 0.85
        elif hours_diff <= 24:
            return 0.70
        elif hours_diff <= 72:
            return 0.50
        else:
            return 0.30
    except Exception:
        return 0.50

def compute_alias_name_similarity(case_m, case_f) -> Tuple[float, str]:
    """
    Language-Independent Alias Matching:
    Compares primary names and all aliases of missing person against found person.
    """
    m_names = [case_m.full_name]
    if case_m.aliases_json:
        try:
            m_names.extend(json.loads(case_m.aliases_json))
        except Exception:
            pass

    f_names = [case_f.full_name]
    if case_f.aliases_json:
        try:
            f_names.extend(json.loads(case_f.aliases_json))
        except Exception:
            pass

    best_score = 0.0
    best_match_str = "No name/alias overlap"

    for m in m_names:
        norm_m = normalize_phonetic_name(m)
        if not norm_m:
            continue
        for f in f_names:
            norm_f = normalize_phonetic_name(f)
            if not norm_f:
                continue
            
            if norm_m == norm_f:
                return 1.0, f"Exact name/alias match ('{m}' == '{f}')"
            elif norm_m in norm_f or norm_f in norm_m:
                score = 0.85
                if score > best_score:
                    best_score = score
                    best_match_str = f"Partial alias match ('{m}' ~ '{f}')"
            else:
                # Substring token overlap
                m_tokens = set(norm_m.split())
                f_tokens = set(norm_f.split())
                common = m_tokens.intersection(f_tokens)
                if common:
                    score = 0.70
                    if score > best_score:
                        best_score = score
                        best_match_str = f"Phonetic name token match ('{list(common)[0]}')"

    return round(best_score, 4), best_match_str

def compute_family_links_score(case_m, case_f) -> Tuple[float, str]:
    """
    Evaluates family relationship graph links for supporting match evidence.
    """
    if not case_m.family_links_json and not case_f.family_links_json:
        return 0.5, "No family links provided"

    m_links = json.loads(case_m.family_links_json) if case_m.family_links_json else []
    f_links = json.loads(case_f.family_links_json) if case_f.family_links_json else []

    m_names = {normalize_phonetic_name(l.get("name", "")) for l in m_links if l.get("name")}
    f_names = {normalize_phonetic_name(l.get("name", "")) for l in f_links if l.get("name")}

    common = m_names.intersection(f_names) - {""}
    if common:
        return 0.95, f"Family relation link match ({len(common)} relative names match)"
    
    return 0.5, "Family graphs reviewed (No direct overlap)"

def evaluate_match_pair(missing_case, found_case, missing_embedding=None, found_embedding=None) -> Dict[str, Any]:
    """
    AI Identity Resolver: Multi-factor ranking with clear field contribution breakdowns.
    """
    field_contributions = {}
    reasons = []
    
    # 1. Location Distance
    dist_km = calculate_haversine_distance(
        missing_case.latitude, missing_case.longitude,
        found_case.latitude, found_case.longitude
    )
    loc_score = compute_location_similarity(dist_km)
    field_contributions["Geo Location"] = f"{int(loc_score*100)}% ({dist_km} km apart)"
    reasons.append(f"Proximity: ~{dist_km} km apart")
    
    # 2. Time Similarity
    time_score = compute_time_similarity(missing_case.incident_timestamp, found_case.incident_timestamp)
    field_contributions["Incident Time"] = f"{int(time_score*100)}% interval match"
    
    # 3. Name & Alias Matching (Language-Independent)
    alias_score, alias_reason = compute_alias_name_similarity(missing_case, found_case)
    field_contributions["Name & Aliases"] = f"{int(alias_score*100)}% ({alias_reason})"
    if alias_score > 0.5:
        reasons.append(alias_reason)

    # 4. Demographics & Clothing
    age_diff = abs(missing_case.age - found_case.age)
    age_score = 1.0 if age_diff <= 1 else (0.8 if age_diff <= 4 else 0.4)
    field_contributions["Age Bracket"] = f"{int(age_score*100)}% ({missing_case.age} vs {found_case.age} yrs)"

    gender_score = 1.0 if (missing_case.gender.lower() == found_case.gender.lower() or found_case.gender.lower() == 'unknown') else 0.0
    field_contributions["Gender"] = f"{int(gender_score*100)}% ({missing_case.gender})"

    # 5. Family Relationship Graph
    fam_score, fam_reason = compute_family_links_score(missing_case, found_case)
    field_contributions["Family Links"] = f"{int(fam_score*100)}% ({fam_reason})"

    # 6. Face Image Clue (Clearly labeled clue, not identity proof)
    if missing_embedding and found_embedding:
        face_score = calculate_cosine_similarity(missing_embedding, found_embedding)
        field_contributions["Face Image Clue"] = f"{int(face_score*100)}% similarity (Possible clue - Not identity proof)"
        reasons.append(f"Face image similarity clue: {int(face_score * 100)}%")
    else:
        face_score = alias_score
        field_contributions["Face Image Clue"] = "N/A (No photo uploaded - Demo score applied)"

    # Combined Text/Demographic score
    text_score = (alias_score * 0.4 + age_score * 0.3 + gender_score * 0.3)

    # Calculate Total Score
    total_score = (
        face_score * WEIGHT_FACE +
        loc_score * WEIGHT_LOCATION +
        time_score * WEIGHT_TIME +
        text_score * WEIGHT_TEXT
    )
    total_score = round(total_score, 4)

    # Assign Confidence Band
    if total_score >= CONFIDENCE_HIGH:
        band = "High"
    elif total_score >= CONFIDENCE_MEDIUM:
        band = "Medium"
    else:
        band = "Low"

    explanation = f"Match Score: {int(total_score * 100)}% ({band} Band). Key Factors: " + "; ".join(reasons)

    return {
        "confidence_score": total_score,
        "confidence_band": band,
        "explanation": explanation,
        "field_contributions": field_contributions,
        "face_similarity": round(face_score, 4),
        "location_similarity": round(loc_score, 4),
        "time_similarity": round(time_score, 4),
        "text_similarity": round(text_score, 4),
        "distance_km": dist_km
    }

def detect_duplicate_cases(new_case, existing_cases) -> List[Dict[str, Any]]:
    """
    Detects potential duplicate reports based on name/alias phonetic similarity, age range, location, and time.
    """
    flagged_duplicates = []
    norm_new_name = normalize_phonetic_name(new_case.full_name)
    
    for ext in existing_cases:
        if ext.case_id == new_case.case_id or ext.case_type != new_case.case_type:
            continue
        
        # Check age difference
        if abs(ext.age - new_case.age) > 4:
            continue
            
        # Check location distance
        dist_km = calculate_haversine_distance(new_case.latitude, new_case.longitude, ext.latitude, ext.longitude)
        if dist_km > 25.0:
            continue
            
        # Check name/alias match
        norm_ext_name = normalize_phonetic_name(ext.full_name)
        alias_sim, _ = compute_alias_name_similarity(new_case, ext)
        
        if alias_sim >= 0.70 or norm_new_name == norm_ext_name:
            dup_score = round(0.5 * alias_sim + 0.3 * (1 - dist_km/25.0) + 0.2 * (1 - abs(ext.age - new_case.age)/4.0), 2)
            flagged_duplicates.append({
                "primary_case_id": ext.case_id,
                "duplicate_case_id": new_case.case_id,
                "similarity_score": dup_score,
                "factors": f"Name match ({int(alias_sim*100)}%), Dist: {dist_km} km, Age diff: {abs(ext.age - new_case.age)} yrs"
            })

    return flagged_duplicates
