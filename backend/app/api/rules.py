"""
Routing rules endpoints — create, manage, and apply file routing rules.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.rule import RoutingRule
from app.schemas.rule import RuleCreate, RuleResponse, RuleUpdate

router = APIRouter(prefix="/rules", tags=["Routing Rules"])


@router.get("/", response_model=List[RuleResponse])
async def list_rules(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all routing rules for the current user."""
    stmt = (
        select(RoutingRule)
        .where(RoutingRule.user_id == user_id)
        .order_by(RoutingRule.priority.desc(), RoutingRule.created_at.desc())
    )
    result = await db.execute(stmt)
    rules = result.scalars().all()
    return [
        RuleResponse(
            id=str(r.id),
            name=r.name,
            description=r.description,
            is_active=r.is_active,
            priority=r.priority,
            conditions=r.conditions,
            actions=r.actions,
            rule_type=r.rule_type,
            times_triggered=r.times_triggered,
            last_triggered_at=r.last_triggered_at,
            created_at=r.created_at,
        )
        for r in rules
    ]


@router.post("/", response_model=RuleResponse, status_code=201)
async def create_rule(
    rule_data: RuleCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new routing rule."""
    rule = RoutingRule(
        user_id=user_id,
        name=rule_data.name,
        description=rule_data.description,
        priority=rule_data.priority,
        conditions=rule_data.conditions,
        actions=rule_data.actions,
        rule_type=rule_data.rule_type,
        is_active=rule_data.is_active,
    )
    db.add(rule)
    await db.flush()

    return RuleResponse(
        id=str(rule.id),
        name=rule.name,
        description=rule.description,
        is_active=rule.is_active,
        priority=rule.priority,
        conditions=rule.conditions,
        actions=rule.actions,
        rule_type=rule.rule_type,
        times_triggered=rule.times_triggered,
        last_triggered_at=rule.last_triggered_at,
        created_at=rule.created_at,
    )


@router.patch("/{rule_id}", response_model=RuleResponse)
async def update_rule(
    rule_id: str,
    update_data: RuleUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing routing rule."""
    stmt = select(RoutingRule).where(RoutingRule.id == rule_id, RoutingRule.user_id == user_id)
    result = await db.execute(stmt)
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(rule, field, value)

    await db.flush()

    return RuleResponse(
        id=str(rule.id),
        name=rule.name,
        description=rule.description,
        is_active=rule.is_active,
        priority=rule.priority,
        conditions=rule.conditions,
        actions=rule.actions,
        rule_type=rule.rule_type,
        times_triggered=rule.times_triggered,
        last_triggered_at=rule.last_triggered_at,
        created_at=rule.created_at,
    )


@router.delete("/{rule_id}", status_code=204)
async def delete_rule(
    rule_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a routing rule."""
    stmt = select(RoutingRule).where(RoutingRule.id == rule_id, RoutingRule.user_id == user_id)
    result = await db.execute(stmt)
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    await db.delete(rule)
    await db.flush()


@router.post("/suggest")
async def suggest_rules(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Use AI to suggest routing rules based on file patterns."""
    from app.services.ai_categorizer import ai_categorizer
    from app.models.file import File

    stmt = select(File).where(File.user_id == user_id, File.is_deleted == False).limit(50)
    result = await db.execute(stmt)
    files = result.scalars().all()

    patterns = [
        {
            "filename": f.filename,
            "extension": f.file_extension,
            "category": f.ai_category,
            "source_type": "unknown",
        }
        for f in files
    ]

    suggestions = await ai_categorizer.suggest_rules(patterns)
    return {"suggestions": suggestions}
