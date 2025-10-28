from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    app_host: str
    app_port: int

    supabase_url: str
    supabase_key: str
    supabase_service_key: str
    
    jwt_secret: str
    jwt_algorithm: str
    jwt_expiration_hours: int
    
    gemini_api_key: str
    
    environment: str
    cors_origins: str 
    max_upload_size_mb: int

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list for FastAPI middleware."""
        if not self.cors_origins:
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

settings = Settings()
