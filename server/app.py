import hashlib
import os
import secrets
import sqlite3
from contextlib import asynccontextmanager, closing
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "snappify.db"
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield

@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield

app = FastAPI(title="Snappify API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=70)
    login: str = Field(min_length=3, max_length=64, pattern=r"^[a-zA-Z0-9_.-]+$")
    password: str = Field(min_length=8, max_length=128)


class LoginIn(BaseModel):
    login: str
    password: str


class PasskeyConfirmIn(BaseModel):
    login: str
    passkey_code: str = Field(min_length=6, max_length=6)


class EventIn(BaseModel):
    name: str
    shots_limit: int = Field(ge=1, le=50)
    reveal_mode: str = Field(pattern="^(instant|delayed)$")
    reveal_at: Optional[str] = None
    is_public: bool = True
    film_filter: bool = False


def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    salt, digest = stored.split("$")
    check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000).hex()
    return secrets.compare_digest(check, digest)


def init_db() -> None:
    with closing(db()) as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'organizer',
                is_verified INTEGER NOT NULL DEFAULT 0,
                passkey_code TEXT,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS verification_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                code TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                shots_limit INTEGER NOT NULL,
                reveal_mode TEXT NOT NULL,
                reveal_at TEXT,
                is_public INTEGER NOT NULL,
                film_filter INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(owner_id) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                guest_name TEXT NOT NULL,
                guest_key TEXT NOT NULL,
                shots_used INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY(event_id) REFERENCES events(id)
            );
            CREATE TABLE IF NOT EXISTS photos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                participant_id INTEGER NOT NULL,
                file_path TEXT NOT NULL,
                filter_name TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(event_id) REFERENCES events(id),
                FOREIGN KEY(participant_id) REFERENCES participants(id)
            );
            """
        )
        conn.commit()


def get_current_user(authorization: str = Header(default="")) -> sqlite3.Row:
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(401, "Missing token")
    with closing(db()) as conn:
        session = conn.execute("SELECT user_id, expires_at FROM sessions WHERE token = ?", (token,)).fetchone()
        if not session or datetime.fromisoformat(session["expires_at"]) < datetime.now(timezone.utc):
            raise HTTPException(401, "Session expired")
        user = conn.execute("SELECT * FROM users WHERE id=?", (session["user_id"],)).fetchone()
        if not user:
            raise HTTPException(401, "User not found")
        return user


@app.get("/doc", include_in_schema=False)
def doc_redirect(request: Request):
    from fastapi.responses import RedirectResponse

    return RedirectResponse(url=str(request.base_url) + "docs")


@app.post("/api/auth/register")
def register(payload: RegisterIn):
    login = payload.login.strip().lower()
    name = payload.name.strip().replace("<", "").replace(">", "")
    passkey_code = str(secrets.randbelow(900000) + 100000)
    with closing(db()) as conn:
        existing = conn.execute("SELECT * FROM users WHERE email=?", (login,)).fetchone()
        if existing:
            raise HTTPException(400, "Login already registered")
        conn.execute(
            "INSERT INTO users(name,email,password_hash,is_verified,passkey_code,created_at) VALUES(?,?,?,?,?,?)",
            (name, login, hash_password(payload.password), 0, passkey_code, now()),
        )
        conn.commit()
    return {"ok": True, "message": "Подтвердите passkey на этом компьютере", "passkey_code": passkey_code, "login": login}


@app.post("/api/auth/passkey/confirm")
def passkey_confirm(payload: PasskeyConfirmIn):
    login = payload.login.strip().lower()
    with closing(db()) as conn:
        user = conn.execute("SELECT * FROM users WHERE email=?", (login,)).fetchone()
        if not user:
            raise HTTPException(404, "User not found")
        if user["passkey_code"] != payload.passkey_code:
            raise HTTPException(400, "Invalid passkey")
        conn.execute("UPDATE users SET is_verified=1, passkey_code=NULL WHERE id=?", (user["id"],))
        conn.commit()
    return {"ok": True}


@app.post("/api/auth/verify")
def verify(email: str = Form(), code: str = Form()):
    with closing(db()) as conn:
        user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        if not user:
            raise HTTPException(404, "User not found")
        v = conn.execute("SELECT * FROM verification_codes WHERE user_id=? ORDER BY id DESC LIMIT 1", (user["id"],)).fetchone()
        if not v or v["code"] != code or datetime.fromisoformat(v["expires_at"]) < datetime.now(timezone.utc):
            raise HTTPException(400, "Invalid code")
        conn.execute("UPDATE users SET is_verified=1 WHERE id=?", (user["id"],))
        conn.commit()
    return {"ok": True}


@app.post("/api/auth/login")
def login(payload: LoginIn):
    with closing(db()) as conn:
        user = conn.execute("SELECT * FROM users WHERE email=?", (payload.login,)).fetchone()
        if not user or not verify_password(payload.password, user["password_hash"]):
            raise HTTPException(401, "Invalid credentials")
        if not user["is_verified"]:
            raise HTTPException(403, "Passkey is not confirmed")
        token = secrets.token_urlsafe(40)
        expires = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        conn.execute("INSERT INTO sessions(user_id,token,expires_at) VALUES(?,?,?)", (user["id"], token, expires))
        conn.commit()
    return {"token": token, "user": {"name": user["name"], "email": user["email"], "role": user["role"]}}


@app.get("/api/events")
def get_events(user=Depends(get_current_user)):
    with closing(db()) as conn:
        rows = conn.execute("SELECT * FROM events WHERE owner_id=? ORDER BY id DESC", (user["id"],)).fetchall()
        return [dict(r) for r in rows]


@app.post("/api/events")
def create_event(payload: EventIn, user=Depends(get_current_user)):
    code = ""
    with closing(db()) as conn:
        for _ in range(10):
            candidate = secrets.token_urlsafe(6)[:6]
            taken = conn.execute("SELECT id FROM events WHERE code=?", (candidate,)).fetchone()
            if not taken:
                code = candidate
                break
        if not code:
            raise HTTPException(500, "Could not generate event code")

        conn.execute(
            """INSERT INTO events(owner_id,code,name,shots_limit,reveal_mode,reveal_at,is_public,film_filter,created_at)
               VALUES(?,?,?,?,?,?,?,?,?)""",
            (user["id"], code, payload.name, payload.shots_limit, payload.reveal_mode, payload.reveal_at, int(payload.is_public), int(payload.film_filter), now()),
        )
        conn.commit()
    return {"ok": True, "code": code}


@app.post("/api/events/{code}/join")
def join_event(code: str, guest_name: str = Form(...)):
    guest_name = guest_name.strip()
    if len(guest_name) < 2:
        raise HTTPException(400, "Guest name is too short")
    with closing(db()) as conn:
        event = conn.execute("SELECT * FROM events WHERE code=?", (code,)).fetchone()
        if not event:
            raise HTTPException(404, "Event not found")
        guest_key = secrets.token_urlsafe(24)
        conn.execute("INSERT INTO participants(event_id,guest_name,guest_key) VALUES(?,?,?)", (event["id"], guest_name, guest_key))
        conn.commit()
    return {"guest_key": guest_key, "event_id": event["id"], "shots_limit": event["shots_limit"]}


@app.post("/api/events/{code}/photos")
def upload_photo(code: str, guest_key: str = Form(...), filter_name: str = Form(default="none"), photo: UploadFile = File(...)):
    raw = photo.file.read()
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "File is too large. Max size is 10MB")

    with closing(db()) as conn:
        event = conn.execute("SELECT * FROM events WHERE code=?", (code,)).fetchone()
        if not event:
            raise HTTPException(404, "Event not found")
        participant = conn.execute("SELECT * FROM participants WHERE event_id=? AND guest_key=?", (event["id"], guest_key)).fetchone()
        if not participant:
            raise HTTPException(401, "Invalid guest key")
        if participant["shots_used"] >= event["shots_limit"]:
            raise HTTPException(403, "Shots limit reached")
        suffix = Path(photo.filename or "photo.jpg").suffix.lower() or ".jpg"
        if suffix not in ALLOWED_EXTENSIONS:
            raise HTTPException(400, "Unsupported file type")
        filename = f"{code}_{secrets.token_hex(8)}{suffix}"
        target = UPLOAD_DIR / filename
        with target.open("wb") as f:
            f.write(raw)
        conn.execute("INSERT INTO photos(event_id,participant_id,file_path,filter_name,created_at) VALUES(?,?,?,?,?)", (event["id"], participant["id"], filename, filter_name, now()))
        conn.execute("UPDATE participants SET shots_used=shots_used+1 WHERE id=?", (participant["id"],))
        conn.commit()
    return {"ok": True, "url": f"/uploads/{filename}"}


@app.get("/api/events/{code}/gallery")
def gallery(code: str, user=Depends(get_current_user)):
    with closing(db()) as conn:
        event = conn.execute("SELECT * FROM events WHERE code=? AND owner_id=?", (code, user["id"])).fetchone()
        if not event:
            raise HTTPException(404, "Event not found")
        rows = conn.execute(
            """SELECT p.file_path,p.filter_name,p.created_at,pt.guest_name
               FROM photos p JOIN participants pt ON p.participant_id = pt.id
               WHERE p.event_id=? ORDER BY p.id DESC""",
            (event["id"],),
        ).fetchall()
        return [{**dict(r), "url": f"/uploads/{r['file_path']}"} for r in rows]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host=os.getenv("HOST", "0.0.0.0"), port=int(os.getenv("PORT", "8000")), reload=True)
