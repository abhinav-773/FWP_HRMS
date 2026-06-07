import type { Request, Response } from 'express';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import prisma from '../config/prisma';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });

const COMPANY_POLICIES_CONTEXT = `
You are HireMind, the intelligent virtual HR coach and onboarding assistant for HireMind Systems.
Your goal is to answer employee queries, policy questions, and onboarding steps accurately.

Here are the official company guidelines:
1. WORK FROM HOME (WFH) POLICY:
   - All employees are eligible for up to 2 days of work from home (remote) per week.
   - WFH requests should be logged on the "My Attendance" page by checking the WFH option when clocking in.
   - Manager approval is required for consecutive remote days.

2. LEAVE POLICY:
   - Annual Leaves: 15 days per calendar year.
   - Sick Leaves: 10 days per calendar year.
   - Maternity/Paternity: Paid leaves as per labor guidelines.
   - Applications must be logged through the "My Leaves" portal, and will be approved by the employee's designated manager.

3. EMPLOYEE ONBOARDING & IT HARDWARE:
   - Onboarding checklists are assigned to all new hires.
   - Critical initial tasks: Sign the NDA contract and upload a government-issued ID proof (e.g. Passport/Passport scan) via the "My Onboarding" portal.
   - IT Asset Provisioning: Laptops and secure YubiKeys are provisioned by HR after document verification is complete.

4. PAYROLL AND SALARY:
   - Payslips are generated monthly.
   - Employees can view breakdown graphs (basic salary, allowances, deductions) and download their direct-deposit slips via the "My Payroll" portal.

System Navigation Guide:
- To clock in/out or check breaks: go to "/attendance" ("My Attendance").
- To submit leaves: go to "/leaves" ("My Leaves").
- To view payslips: go to "/payroll" ("My Payroll").
- To manage documents: go to "/documents" ("My Documents").
- To complete onboarding checklist: go to "/onboarding" ("My Onboarding").
- To view reporting structures: go to "/directory" ("Directory" and click "Org Chart").
- To view/update goals: go to "/performance" ("My Performance").
`;

export const sendChatMessage = async (req: Request, res: Response) => {
  const { session_id, message, context } = req.body;
  const user = (req as any).user;

  try {
    // Try to delegate to Python microservice first
    const response = await axios.post(`${AI_SERVICE_URL}/api/v1/chat/`, {
      session_id,
      message,
      user_id: user.userId,
      user_role: user.role || 'EMPLOYEE',
      user_name: 'User',
      context
    }, { timeout: 4000 }); // Low timeout so we fallback to local Gemini quickly

    return res.json(response.data);
  } catch (error: any) {
    console.warn('[Chat Controller] Python AI service unavailable, falling back to local Gemini:');
    
    try {
      // Fallback: Query Gemini directly using local company handbook context
      const prompt = `
      ${COMPANY_POLICIES_CONTEXT}

      User Details:
      - Name: ${user.fullName || 'Employee'}
      - Role: ${user.role || 'EMPLOYEE'}
      - User ID: ${user.userId}
      
      User Message: "${message}"
      Page Context: "${context || 'No specific page context'}"

      Please reply to the employee in a warm, professional, and helpful tone. Format your response in clean Markdown. If they ask to navigate or execute something, refer them to the appropriate system path.
      `;

      const geminiResponse = await genai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = geminiResponse.text || "I'm here to help, but I'm having trouble retrieving details right now.";

      return res.json({
        session_id: session_id || `local-${Date.now()}`,
        message,
        ai_response: text,
        timestamp: new Date().toISOString()
      });
    } catch (geminiError: any) {
      console.error('[Chat Controller] Gemini fallback failed:', geminiError.message);
      
      const msg = (message || '').toLowerCase();
      let localResponse = "";

      if (msg.includes('leave') || msg.includes('sick') || msg.includes('vacation') || msg.includes('annual')) {
        localResponse = `### 📅 Leave Policy Guidelines
* **Annual Leaves**: 15 days per calendar year.
* **Sick Leaves**: 10 days per calendar year.
* **Maternity/Paternity**: Paid leaves as per labor guidelines.

**How to apply:**
Please go to the **My Leaves** page in the sidebar to log your applications and submit them for manager approval.`;
      } else if (msg.includes('wfh') || msg.includes('remote') || msg.includes('work from home')) {
        localResponse = `### 🏠 Work From Home (WFH) Policy
* **Allowance**: All employees are eligible for up to **2 days** of remote work per week.
* **How to log**: Select the **Work From Home Shift** checkbox when clocking in on the **My Attendance** page.
* **Manager Approval**: Consecutive remote days require approval from your designated manager.`;
      } else if (msg.includes('onboarding') || msg.includes('nda') || msg.includes('checklist') || msg.includes('welcome') || msg.includes('hardware') || msg.includes('asset') || msg.includes('laptop')) {
        localResponse = `### 🚀 Employee Onboarding Workflow
* **Checklist**: Your digital onboarding tasks must be completed in order.
* **Initial Tasks**: You must sign the NDA contract and upload a government-issued ID card scan in the **My Onboarding** portal.
* **Asset Provisioning**: Once verified, HR will assign your secure YubiKey and laptop (fleet asset) to you.`;
      } else if (msg.includes('payslip') || msg.includes('payroll') || msg.includes('salary') || msg.includes('deposit') || msg.includes('slip')) {
        localResponse = `### 💵 Payroll & Payslips
* **Frequency**: Payslips are generated monthly.
* **Access**: You can view salary breakdowns, allowance details, deductions, and download direct-deposit slips as HTML prints on the **My Payroll** page.`;
      } else if (msg.includes('org') || msg.includes('chart') || msg.includes('structure') || msg.includes('hierarchy') || msg.includes('manager')) {
        localResponse = `### 🌳 Company Org Chart & Directory
* **Access**: Go to the **Directory** page in the sidebar.
* **Org Chart View**: Click the **Org Chart** toggle button at the top-right next to the search bar to see hierarchical reporting lines.`;
      } else if (msg.includes('goal') || msg.includes('okr') || msg.includes('performance') || msg.includes('review') || msg.includes('feedback')) {
        localResponse = `### 📈 Performance & OKRs
* **OKRs Tracker**: Update your quarterly goal sliders on the **My Performance** page.
* **Reviews**: View manager comments and submit peer evaluations under the performance tabs.`;
      } else {
        localResponse = `### 👋 Welcome to HireMind Systems Co-Pilot
The AI service is temporarily rate-limited, but I can help you with core policies:
* **Leaves**: Ask about leave balance or sick leaves.
* **WFH**: Ask about remote shift policies.
* **Onboarding**: Ask about welcome checklist or NDA.
* **Payroll**: Ask about payslips or salary breakdown.
* **Org Chart**: Ask about organizational directory.
* **Performance**: Ask about OKRs or quarterly reviews.

Please let me know how I can guide you!`;
      }

      return res.json({
        session_id: session_id || `local-fallback-${Date.now()}`,
        message,
        ai_response: localResponse,
        timestamp: new Date().toISOString()
      });
    }
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const response = await axios.get(`${AI_SERVICE_URL}/api/v1/chat/${sessionId}/history`, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    console.error('Chat history proxy error:', error.message);
    res.json({ session_id: req.params.sessionId, messages: [] });
  }
};

export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const response = await axios.get(`${AI_SERVICE_URL}/api/v1/chat/sessions/${user.userId}`, { timeout: 5000 });
    res.json(response.data);
  } catch (error: any) {
    console.error('Chat sessions proxy error:', error.message);
    res.json({ sessions: [] });
  }
};

export const getChatHealth = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/v1/chat/health`, { timeout: 3000 });
    res.json(response.data);
  } catch (error: any) {
    res.json({ status: 'fallback_active', llm_available: true });
  }
};
