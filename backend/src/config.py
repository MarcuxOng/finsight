from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
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

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = ""
    
    gemini_api_key: str
    gemini_model: str
    
    cors_origins: str 
    max_upload_size_mb: int

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list for FastAPI middleware."""
        if not self.cors_origins:
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

settings = Settings()
