import os
import tempfile
import whisper
import json
import logging
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate
from langchain_core.exceptions import OutputParserException

logger = logging.getLogger(__name__)

# Load whisper model lazily to avoid blocking startup
_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        logger.info("Loading Whisper base model...")
        _whisper_model = whisper.load_model("base")
    return _whisper_model

async def transcribe_audio(audio_bytes: bytes) -> str:
    """
    Writes audio bytes to a temporary file and transcribes it using Whisper.
    """
    # Write to a temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        model = get_whisper_model()
        # transcribe using local temp file
        result = model.transcribe(tmp_path)
        return result.get("text", "").strip()
    except Exception as e:
        logger.error(f"Error transcribing audio: {e}")
        raise e
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

def evaluate_answer(question: str, answer: str, job_title: str) -> dict:
    """
    Evaluates the transcribed answer using LangChain + Llama3 via Ollama.
    """
    if not answer or len(answer) < 5:
         return {
             "score": 0,
             "feedback": "The answer was too short or inaudible.",
             "is_complete": False
         }
         
    try:
        llm = Ollama(model="llama3")
        
        prompt = PromptTemplate(
            input_variables=["question", "answer", "job_title"],
            template="""You are an expert technical interviewer evaluating a candidate's answer.
Role: {job_title}
Question Asked: {question}
Candidate's Answer: {answer}

Evaluate the candidate's answer based on relevance, technical accuracy, and completeness.
Return ONLY a valid JSON object (no markdown, no quotes around the json block) in this exact format:
{{
  "score": <a number between 1 and 10>,
  "feedback": "<brief constructive feedback>",
  "is_complete": <true or false>
}}
"""
        )
        
        chain = prompt | llm
        result = chain.invoke({
            "question": question,
            "answer": answer,
            "job_title": job_title
        })
        
        # Simple cleanup to parse JSON properly in case LLM adds backticks
        result = result.strip()
        if result.startswith("```json"):
            result = result[7:]
        if result.endswith("```"):
            result = result[:-3]
            
        parsed = json.loads(result.strip())
        return {
            "score": parsed.get("score", 5),
            "feedback": parsed.get("feedback", "No feedback provided."),
            "is_complete": parsed.get("is_complete", False)
        }
    except Exception as e:
        logger.error(f"Error evaluating answer: {e}")
        # Graceful fallback if Ollama fails (e.g. not installed or not running)
        return {
            "score": 5,
            "feedback": "Fallback evaluation (LLM unavailable). Answer received.",
            "is_complete": True
        }
