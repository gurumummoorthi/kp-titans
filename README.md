# Reunite

Reunite is a missing-person reporting and reunification platform with a FastAPI backend and a browser-based frontend.

## Backend

From the project root, install the backend dependencies (`fastapi`, `uvicorn`, `sqlalchemy`, `pillow`, and `python-multipart`) and start the API, which serves the frontend at its root URL:

```powershell
python -m pip install fastapi uvicorn sqlalchemy pillow python-multipart
python -m uvicorn app.main:app --app-dir backend --reload
```

Open `http://127.0.0.1:8000` for the app and `http://127.0.0.1:8000/docs` for the API documentation.

Set responder/admin authentication tokens in the environment before starting the backend:

```powershell
$env:REUNITE_ADMIN_TOKEN = "your-admin-token"
$env:REUNITE_RESPONDER_TOKEN = "your-responder-token"
```

The responder/admin interface asks for its token and keeps it in session storage for the current browser session. Set the matching environment variables before starting the backend; privileged endpoints are disabled if their token is not configured. Never use sample or placeholder tokens in a deployed environment.

The local SQLite database and uploaded files are runtime data and are intentionally excluded from version control.
