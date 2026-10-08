import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'reunite.db')}"
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

ADMIN_TOKEN = os.environ.get("REUNITE_ADMIN_TOKEN", "")
RESPONDER_TOKEN = os.environ.get("REUNITE_RESPONDER_TOKEN", "")

# Rate Limit Config (Requests per minute per device ID)
RATE_LIMIT_RPM = 30

# Retention Policy
AUTO_DELETE_PHOTOS_ON_CLOSE = True
BLUR_DEFAULT = True

# Match Weight Config
WEIGHT_FACE = 0.45
WEIGHT_LOCATION = 0.25
WEIGHT_TIME = 0.15
WEIGHT_TEXT = 0.15

# Confidence Threshold Bands
CONFIDENCE_HIGH = 0.78
CONFIDENCE_MEDIUM = 0.55
