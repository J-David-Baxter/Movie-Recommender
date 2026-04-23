from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATA_DIR: Path = Path("data/ml-latest-small")
    ALPHA: float = 0.6
    TOP_N: int = 20
    COLD_START_THRESHOLD: int = 5
    SVD_N_FACTORS: int = 50
    SVD_N_EPOCHS: int = 20
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    DATABASE_URL: str = ""


settings = Settings()
