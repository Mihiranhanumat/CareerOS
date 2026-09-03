from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: Optional[bool] = True

@router.post("/register")
@router.post("/signup")
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        return await auth_service.register(db, data.email, data.password, data.full_name)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        return await auth_service.login(db, data.email, data.password, data.remember_me or True)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.get("/me")
async def get_me(authorization: Optional[str] = Header(None), db: AsyncSession = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid token")
    token = authorization.replace("Bearer ", "").strip()
    user = await auth_service.get_current_user(db, token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session or user not found")
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "is_active": user.is_active
    }
