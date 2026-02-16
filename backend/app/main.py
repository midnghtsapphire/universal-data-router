"""
Universal Data Router — FastAPI Application
AI-Powered Multi-Source File Organizer by GlowStarLabs

Part of the GlowStarLabs / Audrey Evans ecosystem
https://meetaudreyevans.com
"""
import time
import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import init_db
from app.core.carbon import carbon_tracker
from app.api import auth, sources, files, rules, dashboard, billing

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("Starting Universal Data Router", version=settings.APP_VERSION)
    await init_db()
    logger.info("Database initialized")
    yield
    logger.info("Shutting down Universal Data Router")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI-Powered Multi-Source File Organizer — connects Gmail, Google Drive, "
        "GitHub, Dropbox, and local filesystem. Automatic categorization, "
        "deduplication, and smart routing. Part of the GlowStarLabs ecosystem."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Carbon tracking middleware
@app.middleware("http")
async def carbon_tracking_middleware(request: Request, call_next):
    """Track carbon footprint of each API call."""
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    if settings.CARBON_TRACKING_ENABLED:
        content_length = int(response.headers.get("content-length", 0))
        carbon_tracker.record_api_call(duration, content_length)

    return response


# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "ecosystem": "GlowStarLabs",
    }


# API info
@app.get("/", tags=["Info"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "AI-Powered Multi-Source File Organizer",
        "ecosystem": "GlowStarLabs / Audrey Evans",
        "hub": "https://meetaudreyevans.com",
        "docs": "/api/docs",
        "attribution": (
            "File categorization powered by OpenRouter AI API. "
            "Payment processing provided by Stripe. "
            "Built with free and open-source tools."
        ),
    }


# Register routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(sources.router, prefix=settings.API_PREFIX)
app.include_router(files.router, prefix=settings.API_PREFIX)
app.include_router(rules.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(billing.router, prefix=settings.API_PREFIX)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )
