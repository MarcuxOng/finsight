from src.router.auth import router as auth_router
from src.router.transactions import router as transactions_router
from src.router.analytics import router as analytics_router
from src.router.insights import router as insights_router
from src.router.upload import router as upload_router

# Collect all routers
all_routers = [
    auth_router,
    transactions_router,
    analytics_router,
    insights_router,
    upload_router,
]
