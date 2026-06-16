from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from schemas import RegisterRequest, LoginRequest, AuthResponse, UserOut
from email_service import generate_otp, send_otp_email, send_welcome_email
from pydantic import BaseModel, EmailStr
import os
from dotenv import load_dotenv
import re

load_dotenv()

router        = APIRouter()
pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

SECRET_KEY     = os.getenv("JWT_SECRET", "changeme")
ALGORITHM      = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 10080))


# ── Pydantic Schemas ──────────────────────────────────────────────────────────

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

class UpdateNameRequest(BaseModel):
    name: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password[:72])

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain[:72], hashed)

def create_token(email: str) -> str:
    return jwt.encode(
        {"sub": email, "exp": datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)},
        SECRET_KEY, algorithm=ALGORITHM,
    )


# ── Auth Dependency ───────────────────────────────────────────────────────────

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    result = await db.execute(select(User).where(User.email == email))
    user   = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result   = await db.execute(select(User).where(User.email == req.email.lower().strip()))
    existing = result.scalar_one_or_none()

    if existing and existing.is_verified:
        raise HTTPException(status_code=400, detail="Email already registered")

    def validate_password(password: str):
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        if not re.search(r'[A-Z]', password):
            raise HTTPException(status_code=400, detail="Password must contain at least one capital letter")
        # if not re.search(r'[0-9]', password):
        #     raise HTTPException(status_code=400, detail="Password must contain at least one number")
        if not re.search(r'[^a-zA-Z0-9]', password):
            raise HTTPException(status_code=400, detail="Password must contain at least one symbol")

    validate_password(req.password)

    otp         = generate_otp()
    otp_expires = datetime.now(timezone.utc) + timedelta(minutes=10)

    if existing and not existing.is_verified:
        existing.name        = req.name.strip()
        existing.password    = hash_password(req.password)
        existing.otp_code    = otp
        existing.otp_expires = otp_expires
        await db.commit()
    else:
        user = User(
            name        = req.name.strip(),
            email       = req.email.lower().strip(),
            password    = hash_password(req.password),
            is_verified = False,
            otp_code    = otp,
            otp_expires = otp_expires,
        )
        db.add(user)
        await db.commit()

    send_otp_email(req.email, req.name, otp)
    return {"message": "OTP sent to your email.", "email": req.email.lower().strip()}


@router.post("/verify-otp")
async def verify_otp(req: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email.lower().strip()))
    user   = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    if user.otp_code != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")

    now     = datetime.now(timezone.utc)
    otp_exp = user.otp_expires
    if otp_exp.tzinfo is None:
        otp_exp = otp_exp.replace(tzinfo=timezone.utc)
    if now > otp_exp:
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")

    user.is_verified = True
    user.otp_code    = None
    user.otp_expires = None
    await db.commit()

    send_welcome_email(user.email, user.name)
    return AuthResponse(token=create_token(user.email), name=user.name, email=user.email)


@router.post("/resend-otp")
async def resend_otp(req: ResendOTPRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email.lower().strip()))
    user   = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    otp              = generate_otp()
    user.otp_code    = otp
    user.otp_expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    await db.commit()

    send_otp_email(user.email, user.name, otp)
    return {"message": "New OTP sent to your email"}


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email.lower().strip()))
    user   = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_verified:
        otp              = generate_otp()
        user.otp_code    = otp
        user.otp_expires = datetime.now(timezone.utc) + timedelta(minutes=10)
        await db.commit()
        send_otp_email(user.email, user.name, otp)
        raise HTTPException(status_code=403, detail="Email not verified. A new OTP has been sent.")

    return AuthResponse(token=create_token(user.email), name=user.name, email=user.email)


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return UserOut(name=current_user.name, email=current_user.email)


@router.put("/update-name")
async def update_name(
    req: UpdateNameRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be empty")
    current_user.name = req.name.strip()
    await db.commit()
    return {"message": "Name updated", "name": current_user.name}


@router.put("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(req.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    current_user.password = hash_password(req.new_password)
    await db.commit()
    return {"message": "Password changed successfully"}


@router.delete("/delete-account")
async def delete_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.delete(current_user)
    await db.commit()
    return {"message": "Account deleted"}
