import { GoogleGenAI } from '@google/genai';
import prisma from '../../config/prisma';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });

export class HireMindCopilotService {
  async processQuery(userId: string, role: string, fullName: string, message: string, context: string) {
    let roleContext = '';
    let dbData = '';

    try {
      if (role === 'EMPLOYEE') {
        roleContext = `You are the HireMind Employee Copilot. Guide the employee through company policies (WFH, Leaves, Payroll) and help them navigate the portal.`;
        
        // Fetch some basic employee data to make it personalized
        const userStats = await prisma.user.findUnique({
          where: { id: userId },
          include: { 
            EmployeeProfile: { select: { department: true } }
          }
        });
        if (userStats?.EmployeeProfile) {
          dbData = `Employee Info: Department - ${userStats.EmployeeProfile.department?.name || 'N/A'}.`;
        }
      } 
      else if (role === 'HR_RECRUITER' || role === 'SUPER_ADMIN') {
        roleContext = `You are the HireMind HR & Admin Copilot. Assist with drafting Job Descriptions, creating interview questions, and summarizing ATS pipeline metrics.`;
        
        // Fetch quick ATS metrics to provide context
        const activeJobs = await prisma.jobPosting.count({ where: { status: 'OPEN' } });
        const pendingInterviews = await prisma.interview.count({ where: { status: 'SCHEDULED' } });
        dbData = `Live ATS Metrics: ${activeJobs} Active Jobs, ${pendingInterviews} Scheduled Interviews.`;
      }
      else if (role === 'SENIOR_MANAGER') {
        roleContext = `You are the HireMind Manager Copilot. Assist the manager with team performance insights, leave approvals, and task management.`;
      }

      const prompt = `
      ${roleContext}
      
      System Data:
      ${dbData}
      
      User Context:
      - Name: ${fullName}
      - Role: ${role}
      - Current Page: ${context}
      
      User Query: "${message}"
      
      Respond professionally and concisely in Markdown format. If you provide navigation advice, use the current HireMind platform pages (e.g., /leaves, /attendance, /hr/ats).
      `;

      const response = await genai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return response.text;
    } catch (error) {
      console.error('Copilot Error:', error);
      throw new Error('Copilot AI service is currently unavailable.');
    }
  }
}

export default new HireMindCopilotService();
