from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.router import all_routers

# Initialize FastAPI app
app = FastAPI(
    title="FinSight API",
    description="AI-powered financial insights and analysis",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "FinSight API is running",
        "version": "1.0.0",
        "status": "healthy"
    }


# Include all routers
for router in all_routers:
    app.include_router(router)

