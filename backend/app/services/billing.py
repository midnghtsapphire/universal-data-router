"""
Stripe billing service — manages subscription tiers and payments.
Subscription Tiers:
  - Free: 2 sources, 500 files, 5 rules, 50 AI calls/month
  - Pro ($9.99/mo): 10 sources, 50K files, 100 rules, 500 AI calls/month
  - Enterprise ($29.99/mo): Unlimited sources/files/rules, 5000 AI calls, crossover memory
"""
import stripe
import structlog
from typing import Optional, Dict
from app.core.config import settings

logger = structlog.get_logger()

stripe.api_key = settings.STRIPE_SECRET_KEY

TIER_LIMITS = {
    "free": {
        "max_sources": 2,
        "max_files": 500,
        "max_rules": 5,
        "ai_categorizations_monthly": 50,
        "crossover_memory": False,
    },
    "pro": {
        "max_sources": 10,
        "max_files": 50000,
        "max_rules": 100,
        "ai_categorizations_monthly": 500,
        "crossover_memory": False,
    },
    "enterprise": {
        "max_sources": 999999,
        "max_files": 999999,
        "max_rules": 999999,
        "ai_categorizations_monthly": 5000,
        "crossover_memory": True,
    },
}


class BillingService:
    """Manages Stripe subscriptions and billing."""

    @staticmethod
    async def create_customer(email: str, name: Optional[str] = None) -> str:
        """Create a Stripe customer."""
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name or email,
                metadata={"app": "universal-data-router", "ecosystem": "glowstarlabs"},
            )
            return customer.id
        except stripe.error.StripeError as e:
            logger.error("Stripe customer creation failed", error=str(e))
            raise

    @staticmethod
    async def create_checkout_session(
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
    ) -> Dict:
        """Create a Stripe Checkout session for subscription."""
        try:
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[{"price": price_id, "quantity": 1}],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={"app": "universal-data-router"},
            )
            return {"session_id": session.id, "url": session.url}
        except stripe.error.StripeError as e:
            logger.error("Stripe checkout creation failed", error=str(e))
            raise

    @staticmethod
    async def create_portal_session(customer_id: str, return_url: str) -> Dict:
        """Create a Stripe Customer Portal session for managing subscriptions."""
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            return {"url": session.url}
        except stripe.error.StripeError as e:
            logger.error("Stripe portal creation failed", error=str(e))
            raise

    @staticmethod
    async def cancel_subscription(subscription_id: str) -> Dict:
        """Cancel a subscription at period end."""
        try:
            sub = stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True,
            )
            return {"status": sub.status, "cancel_at_period_end": True}
        except stripe.error.StripeError as e:
            logger.error("Stripe cancellation failed", error=str(e))
            raise

    @staticmethod
    def get_tier_limits(tier: str) -> Dict:
        """Get limits for a subscription tier."""
        return TIER_LIMITS.get(tier, TIER_LIMITS["free"])

    @staticmethod
    async def handle_webhook(payload: bytes, sig_header: str) -> Dict:
        """Process Stripe webhook events."""
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            logger.error("Webhook verification failed", error=str(e))
            raise

        event_type = event["type"]
        data = event["data"]["object"]

        logger.info("Stripe webhook received", event_type=event_type)

        return {"event_type": event_type, "data": data}


billing_service = BillingService()
