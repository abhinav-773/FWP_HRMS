from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.db import connect_to_mongo, close_mongo_connection
from app.api.resume import router as resume_router
from app.api.interview import router as interview_router
from app.api.chat import router as chat_router
import logging
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(resume_router, prefix=f"{settings.API_V1_STR}/resume", tags=["Resume"])
app.include_router(interview_router, prefix=f"{settings.API_V1_STR}/interview", tags=["AI Interview"])
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}/chat", tags=["AI Chat"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
