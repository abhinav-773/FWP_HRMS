"""
AI Chat API Router.
Handles conversational AI chat with role-aware system prompts,
MongoDB chat history persistence, and modular LLM backend.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import logging
import uuid

from app.core.db import get_database
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)
router = APIRouter()


# --- Pydantic Models ---

class ChatMessageRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    user_id: str
    user_role: str = "EMPLOYEE"
    user_name: str = "User"
    context: Optional[str] = None


class ChatMessageResponse(BaseModel):
    session_id: str
    message: str
    ai_response: str
    timestamp: str


# --- Helper Functions ---

def serialize_mongo_doc(doc):
    """Convert MongoDB document to JSON-serializable dict."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


# --- API Endpoints ---

@router.post("/", response_model=ChatMessageResponse)
async def send_chat_message(request: ChatMessageRequest):
    """
    Send a message to the AI HR Assistant.
    Creates a new session if session_id is not provided.
    Persists both user message and AI response to MongoDB.
    """
    db = get_database()

    # Generate or reuse session ID
    session_id = request.session_id or str(uuid.uuid4())

    try:
        # Ensure session exists in MongoDB
        sessions_col = db["chat_sessions"]
        messages_col = db["chat_messages"]

        existing_session = await sessions_col.find_one({"session_id": session_id})
        if not existing_session:
            await sessions_col.insert_one({
                "session_id": session_id,
                "user_id": request.user_id,
                "user_role": request.user_role,
                "user_name": request.user_name,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "title": request.message[:50] + ("..." if len(request.message) > 50 else "")
            })

        # Fetch conversation history for context
        history_cursor = messages_col.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).limit(20)

        history = []
        async for msg in history_cursor:
            history.append({
                "role": msg["role"],
                "content": msg["content"]
            })

        # Save user message to MongoDB
        user_msg_doc = {
            "session_id": session_id,
            "user_id": request.user_id,
            "role": "user",
            "content": request.message,
            "timestamp": datetime.utcnow()
        }
        await messages_col.insert_one(user_msg_doc)

        # Generate AI response via LLM service
        ai_response = await llm_service.generate_response(
            message=request.message,
            user_id=request.user_id,
            role=request.user_role,
            history=history,
            context=request.context
        )

        # Save AI response to MongoDB
        ai_msg_doc = {
            "session_id": session_id,
            "user_id": "ai_assistant",
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.utcnow()
        }
        await messages_col.insert_one(ai_msg_doc)

        # Update session timestamp and title if first message
        await sessions_col.update_one(
            {"session_id": session_id},
            {"$set": {"updated_at": datetime.utcnow()}}
        )

        return ChatMessageResponse(
            session_id=session_id,
            message=request.message,
            ai_response=ai_response,
            timestamp=datetime.utcnow().isoformat()
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Chat error: {str(e)}")
        # Still return a graceful response even on DB errors
        return ChatMessageResponse(
            session_id=session_id,
            message=request.message,
            ai_response="I encountered an internal error. Please try again shortly.",
            timestamp=datetime.utcnow().isoformat()
        )


@router.get("/{session_id}/history")
async def get_chat_history(session_id: str):
    """Retrieve full chat history for a given session."""
    db = get_database()
    messages_col = db["chat_messages"]

    messages = []
    cursor = messages_col.find({"session_id": session_id}).sort("timestamp", 1)
    async for msg in cursor:
        messages.append({
            "role": msg["role"],
            "content": msg["content"],
            "timestamp": msg["timestamp"].isoformat() if isinstance(msg["timestamp"], datetime) else str(msg["timestamp"])
        })

    return {"session_id": session_id, "messages": messages}


@router.get("/sessions/{user_id}")
async def get_user_sessions(user_id: str):
    """Retrieve all chat sessions for a user, sorted by most recent."""
    db = get_database()
    sessions_col = db["chat_sessions"]

    sessions = []
    cursor = sessions_col.find({"user_id": user_id}).sort("updated_at", -1).limit(20)
    async for session in cursor:
        sessions.append({
            "session_id": session["session_id"],
            "title": session.get("title", "Untitled Chat"),
            "user_role": session.get("user_role", "EMPLOYEE"),
            "created_at": session["created_at"].isoformat() if isinstance(session["created_at"], datetime) else str(session["created_at"]),
            "updated_at": session["updated_at"].isoformat() if isinstance(session["updated_at"], datetime) else str(session["updated_at"])
        })

    return {"sessions": sessions}


@router.get("/health")
async def chat_health():
    """Check if the LLM backend is available."""
    available = llm_service.is_available()
    return {
        "status": "ok" if available else "degraded",
        "llm_provider": llm_service.provider,
        "llm_model": llm_service.model,
        "llm_available": available
    }
