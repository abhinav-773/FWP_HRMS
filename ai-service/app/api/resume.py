from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.pdf_parser import parse_pdf_from_bytes
from app.services.scoring_engine import calculate_similarity_score, extract_insights
from app.core.db import get_database
import uuid
import datetime

router = APIRouter()

@router.post("/evaluate")
async def evaluate_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        # Read the file bytes
        file_bytes = await resume.read()
        
        # 1. Parse PDF
        parsed_text = parse_pdf_from_bytes(file_bytes)
        
        # 2. Calculate AI Score
        score = calculate_similarity_score(parsed_text, job_description)
        
        # 3. Extract AI Insights
        insights = extract_insights(parsed_text, job_description, score)
        
        # 4. Save to MongoDB
        db = get_database()
        doc_id = str(uuid.uuid4())
        evaluation_record = {
            "_id": doc_id,
            "filename": resume.filename,
            "parsed_text_length": len(parsed_text),
            "score": score,
            "insights": insights,
            "created_at": datetime.datetime.utcnow()
        }
        
        if db is not None:
            await db["ai_evaluations"].insert_one(evaluation_record)
        
        # 5. Return Results
        return {
            "success": True,
            "score": score,
            "insights": insights,
            "evaluation_id": doc_id
        }

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
