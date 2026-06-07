import os
import requests
from langchain.tools import tool

BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:5000/api/v1")
SERVICE_KEY = os.getenv("SERVICE_KEY", "internal_hrgpt_service_key_2026")

def _get_headers(user_id: str, role: str):
    return {
        "X-Service-Key": SERVICE_KEY,
        "X-User-Id": user_id,
        "X-User-Role": role
    }

@tool
def get_open_jobs(user_id: str, role: str) -> str:
    """Fetch a list of all currently open job postings in the ATS. Use this when asked about available roles."""
    try:
        res = requests.get(
            f"{BACKEND_URL}/copilot/ats/jobs/open",
            headers=_get_headers(user_id, role),
            timeout=10
        )
        res.raise_for_status()
        jobs = res.json()
        if not jobs:
            return "There are currently no open jobs."
        
        output = "Open Jobs:\n"
        for job in jobs:
            dept = job.get('department', {}).get('name', 'N/A')
            output += f"- [{job['id']}] {job['title']} (Dept: {dept}, Openings: {job['openings']})\n"
        return output
    except Exception as e:
        return f"Error fetching jobs: {str(e)}"

@tool
def get_top_candidates(job_id: str, user_id: str, role: str) -> str:
    """Fetch the top AI-scored candidates. You can optionally provide a job_id, or pass an empty string to get overall top candidates."""
    try:
        url = f"{BACKEND_URL}/copilot/ats/candidates/top"
        if job_id and job_id.strip():
            url += f"?jobId={job_id}"
            
        res = requests.get(url, headers=_get_headers(user_id, role), timeout=10)
        res.raise_for_status()
        candidates = res.json()
        
        if not candidates:
            return "No candidates found for this query."
            
        output = "Top Candidates:\n"
        for c in candidates:
            skills = ", ".join(c.get('skills', []))
            output += f"- {c['candidateName']} ({c['jobTitle']}) | AI Score: {c['aiScore']} | Exp: {c['experienceYears']}y | Skills: {skills}\n"
        return output
    except Exception as e:
        return f"Error fetching candidates: {str(e)}"

@tool
def create_job_posting(title: str, description: str, requirements: str, user_id: str, role: str) -> str:
    """Create a new job posting in the ATS. Only use this if the user explicitly asks to create a job."""
    try:
        res = requests.post(
            f"{BACKEND_URL}/copilot/ats/jobs",
            headers=_get_headers(user_id, role),
            json={
                "title": title,
                "description": description,
                "requirements": requirements,
                "skills": []
            },
            timeout=10
        )
        res.raise_for_status()
        return "Job created successfully! [ACTION: NAVIGATE_TO_JOBS]"
    except Exception as e:
        return f"Error creating job: {str(e)}"
