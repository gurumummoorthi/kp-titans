import time
from typing import Dict, Tuple

# Simple in-memory rate limiting and spam detector cache
REQUEST_HISTORY: Dict[str, list] = {}

def calculate_spam_score(device_id: str, case_text: str) -> Tuple[float, str]:
    """
    Evaluates fraud/spam score [0.0 = Clean, 1.0 = Highly Suspicious/Spam].
    Triggers based on rapid repetition, dummy content, or suspicious patterns.
    """
    score = 0.0
    reasons = []
    
    # Check rapid repeat submissions (more than 5 requests in 60s)
    now = time.time()
    history = REQUEST_HISTORY.get(device_id, [])
    recent = [t for t in history if now - t < 60]
    REQUEST_HISTORY[device_id] = recent + [now]
    
    if len(recent) > 5:
        score += 0.4
        reasons.append("High submission velocity (>5 in 1 min)")
        
    # Check for short or repetitive spam text
    text = (case_text or "").strip().lower()
    if len(text) < 5:
        score += 0.3
        reasons.append("Very short description text")
    
    # Check dummy keywords
    spam_keywords = ["test1234", "asdfgh", "qwerty", "fake", "lorem ipsum"]
    for kw in spam_keywords:
        if kw in text:
            score += 0.5
            reasons.append(f"Suspicious keyword detected: '{kw}'")
            break
            
    final_score = min(1.0, round(score, 2))
    reason_str = ", ".join(reasons) if reasons else "Normal clean traffic"
    return final_score, reason_str
