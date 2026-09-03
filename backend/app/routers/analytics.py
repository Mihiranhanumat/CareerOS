from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.system import AnalyticsResponse
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Career Analytics & Intelligence"])

@router.get("", response_model=AnalyticsResponse)
@router.get("/overview", response_model=AnalyticsResponse)
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    return await analytics_service.get_analytics(db)
