"""NilamTrace Backend Configuration Settings"""
import os
from pathlib import Path
from typing import Optional, Union, List, Any
from dotenv import load_dotenv
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Determine directory paths for robust .env loading across root and api dirs
API_DIR = Path(__file__).resolve().parent
ROOT_DIR = API_DIR.parent

# Explicit dotenv preloading: api/.env takes precedence over root .env
if (ROOT_DIR / ".env").exists():
    load_dotenv(ROOT_DIR / ".env")
if (API_DIR / ".env").exists():
    load_dotenv(API_DIR / ".env", override=True)


class Settings(BaseSettings):
    """NilamTrace application runtime settings with environment overrides."""
    
    # AI / LLM Configuration (Groq Cloud API Key only)
    GROQ_API_KEY: str = Field(default="", description="Groq API key for Llama extraction")
    GROQ_MODEL: str = Field(default="llama-3.3-70b-versatile", description="Primary model for Tamil land record extraction")
    GROQ_FALLBACK_MODEL: str = Field(default="llama-3.1-8b-instant", description="Fast fallback model")
    GROQ_TIMEOUT_SECONDS: float = Field(default=15.0, description="Groq API timeout in seconds")
    MAX_TOKENS: int = Field(default=2048, description="Max generation tokens")
    
    # Fallback and Extraction Thresholds
    FALLBACK_CONFIDENCE_THRESHOLD: float = Field(default=0.70, description="Minimum confidence threshold before fallback")
    SHRINKAGE_DEED_PERCENT_EPSILON: float = Field(default=0.01, description="1% deed cents tolerance")
    SHRINKAGE_MIN_EPSILON: float = Field(default=0.25, description="0.25 cents minimum tolerance")
    
    # PDF & Squeeze Machine Constraints
    MAX_PDF_SIZE_BYTES: int = Field(default=409600, description="Strict 400 KB limit (400 * 1024 bytes)")
    PDF_TARGET_DPI_LEVELS: list[int] = Field(default=[150, 120, 96, 72])
    PDF_JPEG_QUALITY_LEVELS: list[int] = Field(default=[75, 60, 45])
    
    # App Settings
    API_PREFIX: str = Field(default="/api")
    APP_NAME: str = Field(default="NilamTrace API")
    APP_VERSION: str = Field(default="2.0.0")
    APP_ENV: str = Field(default="production")
    ALLOWED_ORIGINS: Union[str, List[str]] = Field(
        default=["*"],
        description="Allowed CORS origins list or comma-separated string"
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if v.strip() == "*":
                return ["*"]
            return [orig.strip() for orig in v.split(",") if orig.strip()]
        if isinstance(v, list):
            return v
        return ["*"]

    model_config = SettingsConfigDict(
        env_file=(
            str(ROOT_DIR / ".env"),
            str(API_DIR / ".env"),
            ".env",
            "api/.env",
        ),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
