"""
Billing endpoints — Stripe subscription management.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.core.config import settings
from app.models.subscription import Subscription
from app.models.user import User
from app.services.billing import billing_service
from app.schemas.subscription import SubscriptionResponse

router = APIRouter(prefix="/billing", tags=["Billing"])


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get current subscription details."""
    stmt = select(Subscription).where(Subscription.user_id == user_id)
    result = await db.execute(stmt)
    sub = result.scalar_one_or_none()

    if not sub:
        raise HTTPException(status_code=404, detail="No subscription found")

    return SubscriptionResponse(
        id=str(sub.id),
        tier=sub.tier,
        status=sub.status,
        max_sources=sub.max_sources,
        max_files=sub.max_files,
        max_rules=sub.max_rules,
        ai_categorizations_remaining=sub.ai_categorizations_remaining,
        crossover_memory_enabled=sub.crossover_memory_enabled,
        current_period_start=sub.current_period_start,
        current_period_end=sub.current_period_end,
        cancel_at_period_end=sub.cancel_at_period_end,
        created_at=sub.created_at,
    )


@router.post("/checkout")
async def create_checkout(
    tier: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe checkout session for upgrading subscription."""
    price_map = {
        "pro": settings.STRIPE_PRICE_PRO,
        "enterprise": settings.STRIPE_PRICE_ENTERPRISE,
    }

    if tier not in price_map:
        raise HTTPException(status_code=400, detail="Invalid tier")

    # Get or create Stripe customer
    stmt = select(Subscription).where(Subscription.user_id == user_id)
    result = await db.execute(stmt)
    sub = result.scalar_one_or_none()

    if not sub:
        raise HTTPException(status_code=404, detail="No subscription found")

    if not sub.stripe_customer_id:
        user_stmt = select(User).where(User.id == user_id)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one()
        customer_id = await billing_service.create_customer(user.email, user.display_name)
        sub.stripe_customer_id = customer_id
        await db.flush()

    frontend_url = settings.ALLOWED_ORIGINS.split(",")[0]
    session = await billing_service.create_checkout_session(
        customer_id=sub.stripe_customer_id,
        price_id=price_map[tier],
        success_url=f"{frontend_url}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{frontend_url}/billing/cancel",
    )

    return session


@router.post("/portal")
async def create_portal(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe Customer Portal session."""
    stmt = select(Subscription).where(Subscription.user_id == user_id)
    result = await db.execute(stmt)
    sub = result.scalar_one_or_none()

    if not sub or not sub.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No Stripe customer found")

    frontend_url = settings.ALLOWED_ORIGINS.split(",")[0]
    return await billing_service.create_portal_session(
        sub.stripe_customer_id,
        f"{frontend_url}/settings",
    )


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = await billing_service.handle_webhook(payload, sig_header)
    except Exception:
        raise HTTPException(status_code=400, detail="Webhook verification failed")

    event_type = event["event_type"]
    data = event["data"]

    if event_type == "customer.subscription.created":
        await _handle_subscription_change(db, data)
    elif event_type == "customer.subscription.updated":
        await _handle_subscription_change(db, data)
    elif event_type == "customer.subscription.deleted":
        await _handle_subscription_cancel(db, data)

    return {"status": "ok"}


async def _handle_subscription_change(db: AsyncSession, data: dict):
    """Update subscription based on Stripe event."""
    stripe_sub_id = data.get("id")
    stripe_customer_id = data.get("customer")
    price_id = data.get("items", {}).get("data", [{}])[0].get("price", {}).get("id", "")

    stmt = select(Subscription).where(Subscription.stripe_customer_id == stripe_customer_id)
    result = await db.execute(stmt)
    sub = result.scalar_one_or_none()

    if sub:
        sub.stripe_subscription_id = stripe_sub_id
        sub.stripe_price_id = price_id
        sub.status = data.get("status", "active")

        # Determine tier from price
        if price_id == settings.STRIPE_PRICE_ENTERPRISE:
            tier = "enterprise"
        elif price_id == settings.STRIPE_PRICE_PRO:
            tier = "pro"
        else:
            tier = "free"

        limits = billing_service.get_tier_limits(tier)
        sub.tier = tier
        sub.max_sources = limits["max_sources"]
        sub.max_files = limits["max_files"]
        sub.max_rules = limits["max_rules"]
        sub.ai_categorizations_remaining = limits["ai_categorizations_monthly"]
        sub.crossover_memory_enabled = limits["crossover_memory"]

        await db.flush()


async def _handle_subscription_cancel(db: AsyncSession, data: dict):
    """Handle subscription cancellation."""
    stripe_customer_id = data.get("customer")

    stmt = select(Subscription).where(Subscription.stripe_customer_id == stripe_customer_id)
    result = await db.execute(stmt)
    sub = result.scalar_one_or_none()

    if sub:
        sub.status = "canceled"
        sub.tier = "free"
        limits = billing_service.get_tier_limits("free")
        sub.max_sources = limits["max_sources"]
        sub.max_files = limits["max_files"]
        sub.max_rules = limits["max_rules"]
        sub.ai_categorizations_remaining = limits["ai_categorizations_monthly"]
        sub.crossover_memory_enabled = False
        await db.flush()
