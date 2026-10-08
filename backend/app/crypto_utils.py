import base64
import hashlib
import json
import uuid

def encrypt_sensitive_field(plain_text: str) -> str:
    """Simulates AES field-level encryption for sensitive PII."""
    if not plain_text:
        return ""
    # Obfuscated Base64 + XOR with key for light field-level encryption demo
    key = b"REUNITE_SECRET"
    data = plain_text.encode('utf-8')
    xor_bytes = bytes([b ^ key[i % len(key)] for i, b in enumerate(data)])
    return "ENC:" + base64.b64encode(xor_bytes).decode('utf-8')

def decrypt_sensitive_field(cipher_text: str) -> str:
    """Decrypts field-level encrypted PII."""
    if not cipher_text or not cipher_text.startswith("ENC:"):
        return cipher_text
    try:
        raw = base64.b64decode(cipher_text[4:])
        key = b"REUNITE_SECRET"
        plain_bytes = bytes([b ^ key[i % len(key)] for i, b in enumerate(raw)])
        return plain_bytes.decode('utf-8')
    except Exception:
        return cipher_text

def hash_secret_answer(answer: str) -> str:
    """Hashes the family secret answer for verification without storing raw answer."""
    if not answer:
        return ""
    normalized = answer.strip().lower()
    return hashlib.sha256(normalized.encode('utf-8')).hexdigest()

def generate_case_token() -> str:
    """Generates a secure case access token."""
    return f"TK-{uuid.uuid4().hex[:12].upper()}"

def generate_case_id(case_type: str) -> str:
    """Generates human readable case ID like MP-8492 or FP-1204."""
    prefix = "MP" if case_type == "missing" else "FP"
    suffix = uuid.uuid4().hex[:6].upper()
    return f"{prefix}-{suffix}"
