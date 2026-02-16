"""
Authentication endpoints — email/password, Google OAuth, GitHub OAuth.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import settings
from app.models.user import User
from app.models.subscription import Subscription
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
import httpx
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user with email and password."""
    # Check if email exists
    stmt = select(User).where(User.email == user_data.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_data.email,
        display_name=user_data.display_name or user_data.email.split("@")[0],
        hashed_password=hash_password(user_data.password) if user_data.password else None,
    )
    db.add(user)
    await db.flush()

    # Create free subscription
    subscription = Subscription(user_id=user.id, tier="free")
    db.add(subscription)
    await db.flush()

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            is_active=user.is_active,
            is_admin=user.is_admin,
            created_at=user.created_at,
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""
    stmt = select(User).where(User.email == credentials.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            is_active=user.is_active,
            is_admin=user.is_admin,
            created_at=user.created_at,
        ),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: Request, db: AsyncSession = Depends(get_db)):
    """Refresh access token using refresh token."""
    body = await request.json()
    token = body.get("refresh_token")
    if not token:
        raise HTTPException(status_code=400, detail="Refresh token required")

    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=400, detail="Invalid token type")

    user_id = payload.get("sub")
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    access_token = create_access_token({"sub": str(user.id)})
    new_refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            is_active=user.is_active,
            is_admin=user.is_admin,
            created_at=user.created_at,
        ),
    )


@router.get("/google")
async def google_login():
    """Redirect to Google OAuth consent screen."""
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/gmail.readonly",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + "&".join(
        f"{k}={v}" for k, v in params.items()
    )
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Handle Google OAuth callback."""
    try:
        # Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )
            tokens = token_response.json()

            # Get user info
            userinfo_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {tokens['access_token']}"},
            )
            userinfo = userinfo_response.json()

        # Find or create user
        stmt = select(User).where(User.google_id == userinfo["id"])
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            # Check if email exists
            stmt = select(User).where(User.email == userinfo["email"])
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()

            if user:
                user.google_id = userinfo["id"]
                user.avatar_url = userinfo.get("picture")
            else:
                user = User(
                    email=userinfo["email"],
                    display_name=userinfo.get("name", userinfo["email"]),
                    avatar_url=userinfo.get("picture"),
                    google_id=userinfo["id"],
                )
                db.add(user)
                await db.flush()

                subscription = Subscription(user_id=user.id, tier="free")
                db.add(subscription)
                await db.flush()

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        # Redirect to frontend with tokens
        frontend_url = settings.ALLOWED_ORIGINS.split(",")[0]
        return RedirectResponse(
            f"{frontend_url}/auth/callback?access_token={access_token}&refresh_token={refresh_token}"
        )

    except Exception as e:
        logger.error("Google OAuth callback failed", error=str(e))
        raise HTTPException(status_code=500, detail="OAuth authentication failed")


@router.get("/github")
async def github_login():
    """Redirect to GitHub OAuth consent screen."""
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
        "scope": "user:email repo",
    }
    url = "https://github.com/login/oauth/authorize?" + "&".join(
        f"{k}={v}" for k, v in params.items()
    )
    return RedirectResponse(url)


@router.get("/github/callback")
async def github_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Handle GitHub OAuth callback."""
    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                json={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                },
                headers={"Accept": "application/json"},
            )
            tokens = token_response.json()

            userinfo_response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"token {tokens['access_token']}"},
            )
            userinfo = userinfo_response.json()

            # Get primary email
            emails_response = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"token {tokens['access_token']}"},
            )
            emails = emails_response.json()
            primary_email = next(
                (e["email"] for e in emails if e.get("primary")),
                userinfo.get("email", f"{userinfo['login']}@github.com"),
            )

        stmt = select(User).where(User.github_id == str(userinfo["id"]))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            stmt = select(User).where(User.email == primary_email)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()

            if user:
                user.github_id = str(userinfo["id"])
                user.avatar_url = user.avatar_url or userinfo.get("avatar_url")
            else:
                user = User(
                    email=primary_email,
                    display_name=userinfo.get("name") or userinfo["login"],
                    avatar_url=userinfo.get("avatar_url"),
                    github_id=str(userinfo["id"]),
                )
                db.add(user)
                await db.flush()

                subscription = Subscription(user_id=user.id, tier="free")
                db.add(subscription)
                await db.flush()

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})

        frontend_url = settings.ALLOWED_ORIGINS.split(",")[0]
        return RedirectResponse(
            f"{frontend_url}/auth/callback?access_token={access_token}&refresh_token={refresh_token}"
        )

    except Exception as e:
        logger.error("GitHub OAuth callback failed", error=str(e))
        raise HTTPException(status_code=500, detail="OAuth authentication failed")
