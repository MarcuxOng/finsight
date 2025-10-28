from fastapi import APIRouter, Depends

from src.utils.auth import get_current_user_id
from src.services.insights import generate_insights, get_user_insights
from src.utils.schema import InsightGenerate

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.post("/generate")
async def create_insights(
    params: InsightGenerate,
    user_id: str = Depends(get_current_user_id)
):
    """Generate AI-powered insights."""
    return await generate_insights(user_id, params.period)


@router.get("")
async def list_insights(
    limit: int = 10,
    user_id: str = Depends(get_current_user_id)
):
    """Get recent insights."""
    return await get_user_insights(user_id, limit)
