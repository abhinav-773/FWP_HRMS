import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "HRGPT AI Microservice"
    API_V1_STR: str = "/api/v1"
    
    # MongoDB Atlas
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://admin:password@localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "hrgpt_ai_db")
    
    # Model configs
    SENTENCE_TRANSFORMER_MODEL: str = "all-MiniLM-L6-v2"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
