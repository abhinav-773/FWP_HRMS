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
def get_low_attendance(user_id: str, role: str) -> str:
    """Fetch a list of employees with low attendance or burnout risks. Use this for attendance queries."""
    if role not in ["SUPER_ADMIN", "SENIOR_MANAGER", "HR_RECRUITER"]:
        return "Access denied: You do not have permission to view company-wide attendance data."
        
    try:
        res = requests.get(
            f"{BACKEND_URL}/copilot/attendance/low",
            headers=_get_headers(user_id, role),
            timeout=10
        )
        res.raise_for_status()
        data = res.json()
        
        if not data:
            return "All employees have good attendance right now."
            
        output = "Employees with Low Attendance / Burnout Risk:\n"
        for emp in data:
            output += f"- {emp['fullName']} ({emp['email']}) | Attendance Rate: {emp.get('attendanceRate')}% | Absences: {emp.get('absencesThisMonth')}\n"
        return output
    except Exception as e:
        return f"Error fetching attendance: {str(e)}"

@tool
def get_payroll_summary(user_id: str, role: str) -> str:
    """Fetch the latest payroll summary, expenditure, and anomalies."""
    if role not in ["SUPER_ADMIN"]:
        return "Access denied: Only SUPER_ADMIN can view payroll summaries."
        
    try:
        res = requests.get(
            f"{BACKEND_URL}/copilot/payroll/summary",
            headers=_get_headers(user_id, role),
            timeout=10
        )
        res.raise_for_status()
        data = res.json()
        
        output = f"Payroll Summary for {data.get('month')}:\n"
        output += f"Total Expenditure: ${data.get('totalExpenditure'):,}\n\n"
        output += "Department Breakdown:\n"
        for dept, amount in data.get('departmentBreakdown', {}).items():
            output += f"- {dept}: ${amount:,}\n"
            
        if data.get('anomalies'):
            output += "\nAnomalies Detected:\n"
            for anom in data['anomalies']:
                output += f"- {anom}\n"
                
        return output
    except Exception as e:
        return f"Error fetching payroll data: {str(e)}"

@tool
def get_pending_leaves(user_id: str, role: str) -> str:
    """Fetch pending leave requests that need approval."""
    if role not in ["SUPER_ADMIN", "SENIOR_MANAGER"]:
        return "Access denied: Only Managers and Admins can view pending leaves."
        
    try:
        res = requests.get(
            f"{BACKEND_URL}/copilot/leaves/pending",
            headers=_get_headers(user_id, role),
            timeout=10
        )
        res.raise_for_status()
        data = res.json()
        
        if not data:
            return "There are no pending leave requests."
            
        output = "Pending Leave Requests:\n"
        for req in data:
            output += f"- [{req['id']}] {req['employee']} | Type: {req['type']} | Days: {req['days']}\n"
        return output
    except Exception as e:
        return f"Error fetching leaves: {str(e)}"
