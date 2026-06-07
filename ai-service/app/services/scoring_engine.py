import logging
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

logger = logging.getLogger(__name__)

# Initialize the model globally so it's loaded only once at startup
try:
    logger.info("Loading sentence-transformer model: all-MiniLM-L6-v2")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load sentence-transformer model: {e}")
    model = None

def calculate_similarity_score(resume_text: str, jd_text: str) -> float:
    """
    Calculates a semantic similarity score between the parsed resume text and the Job Description.
    Returns a score between 0.0 and 100.0.
    """
    if not model:
        raise RuntimeError("SentenceTransformer model is not loaded.")
    
    if not resume_text or not jd_text:
        return 0.0

    # Generate embeddings
    embeddings = model.encode([resume_text, jd_text])
    
    resume_embedding = embeddings[0].reshape(1, -1)
    jd_embedding = embeddings[1].reshape(1, -1)
    
    # Calculate cosine similarity
    similarity = cosine_similarity(resume_embedding, jd_embedding)[0][0]
    
    # Cosine similarity is between -1 and 1. Convert to a 0-100 percentage.
    # We clip negative values to 0 since completely opposite text isn't a negative match in recruitment context, just 0% match.
    score = float(max(0, similarity) * 100)
    
    # Round to 2 decimal places
    return round(score, 2)

def extract_insights(resume_text: str, jd_text: str, score: float) -> str:
    """
    For MVP, we generate some basic insights based on the semantic score.
    In a fully advanced version, we would use LangChain to ping Ollama/Llama3 for detailed reasoning.
    """
    if score >= 85:
        return "Excellent Match: Strong semantic alignment with required skills and experience."
    elif score >= 65:
        return "Good Match: Meets several key requirements, but may lack some specific keywords or depth in certain areas."
    elif score >= 40:
        return "Average Match: Has some overlapping skills, but significant gaps compared to the job description."
    else:
        return "Low Match: Minimal alignment with the job description. Unlikely to be a fit."
