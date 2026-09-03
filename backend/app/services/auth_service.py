import os
import hashlib
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.db.models import User, Profile, ProfileVisibility

SECRET_KEY = getattr(settings, "JWT_SECRET", "careeros_jwt_super_secret_signing_key_2026_xyz")
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    # PBKDF2 HMAC SHA-256 for secure zero-dependency password hashing
    salt = "careeros_salt_2026"
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=30)  # Default 30-day Remember Me token
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

class AuthService:
    async def register(self, db: AsyncSession, email: str, password: str, full_name: str) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        res = await db.execute(select(User).where(User.email == email_clean))
        existing_user = res.scalars().first()
        if existing_user:
            raise ValueError("An account with this email already exists.")

        user = User(
            email=email_clean,
            hashed_password=hash_password(password),
            full_name=full_name.strip()
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Create linked initial profile
        prof = Profile(
            user_id=user.id,
            display_name=user.full_name,
            headline="Software Engineer",
            summary=f"Professional profile for {user.full_name}.",
            location="Remote / Global",
            email_public=user.email,
            availability="Open to opportunities"
        )
        db.add(prof)
        await db.flush()

        # Add default field visibilities
        vis_fields = [
            ("display_name", "public"),
            ("headline", "public"),
            ("summary", "public"),
            ("location", "public"),
            ("email_public", "selective"),
            ("phone_public", "private"),
            ("github_url", "public"),
            ("linkedin_url", "public")
        ]
        for field, vis in vis_fields:
            db.add(ProfileVisibility(profile_id=prof.id, field_name=field, visibility=vis))

        await db.commit()

        token = create_access_token({"sub": user.id, "email": user.email, "name": user.full_name})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name
            }
        }

    async def login(self, db: AsyncSession, email: str, password: str, remember_me: bool = True) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        res = await db.execute(select(User).where(User.email == email_clean))
        user = res.scalars().first()
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password.")

        expires = timedelta(days=90 if remember_me else 7)
        token = create_access_token({"sub": user.id, "email": user.email, "name": user.full_name}, expires_delta=expires)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name
            }
        }

    async def get_current_user(self, db: AsyncSession, token: str) -> Optional[User]:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            res = await db.execute(select(User).where(User.id == user_id))
            return res.scalars().first()
        except JWTError:
            return None

auth_service = AuthService()
