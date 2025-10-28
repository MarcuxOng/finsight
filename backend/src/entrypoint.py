import uvicorn

from src.app import app
from src.config import settings
    
def main():
    # Run the FastAPI application
    uvicorn.run(
        "src.app:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=True,
        reload_dirs=["src"]
    )