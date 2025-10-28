from fastapi import APIRouter, Depends
from typing import Optional
from datetime import date

from src.utils.auth import get_current_user_id
from src.services.analytics import get_spending_summary, detect_anomalies, compare_monthly_trends

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
async def get_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    user_id: str = Depends(get_current_user_id)
):
    """Get spending summary."""
    return await get_spending_summary(user_id, start_date, end_date)


@router.get("/anomalies")
async def get_anomalies(
    user_id: str = Depends(get_current_user_id)
):
    """Detect spending anomalies."""
    return await detect_anomalies(user_id)


@router.get("/trends")
async def get_trends(
    months: int = 3,
    user_id: str = Depends(get_current_user_id)
):
    """Compare monthly spending trends."""
    return await compare_monthly_trends(user_id, months)
