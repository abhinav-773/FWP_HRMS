import { PrismaClient } from '@prisma/client';
import { generateAIResponse } from './gemini.service.js';

const prisma = new PrismaClient();

export const calculateProductivity = async (department: string) => {
  // Get all employees in the department
  const employees = await prisma.employeeProfile.findMany({
    where: { department: { name: department } },
    include: { attendances: true, assignedTasks: true }
  });

  let totalTasks = 0;
  let totalCompleted = 0;
  let totalOverdue = 0;
  let totalAttendanceDays = 0;
  let totalPresentDays = 0;

  for (const emp of employees) {
    const tasks = emp.assignedTasks;
    totalTasks += tasks.length;
    totalCompleted += tasks.filter(t => t.status === 'COMPLETED').length;
    totalOverdue += tasks.filter(t => t.status === 'OVERDUE').length;

    totalAttendanceDays += emp.attendances.length;
    totalPresentDays += emp.attendances.filter(a => a.status === 'PRESENT').length;
  }

  const averageAttendance = totalAttendanceDays > 0 ? (totalPresentDays / totalAttendanceDays) * 100 : 100;
  const averageProductivity = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 100;
  
  // Calculate burnout risk (simple heuristic: high overtime/overdue + low attendance/productivity = high risk)
  const burnoutRiskScore = ((totalOverdue * 5) + (100 - averageAttendance)) / 2;

  const teamAnalytics = await prisma.teamAnalytics.create({
    data: {
      department,
      averageAttendance,
      averageProductivity,
      overdueTasks: totalOverdue,
      completedTasks: totalCompleted,
      burnoutRiskScore: Math.min(burnoutRiskScore, 100)
    }
  });

  return teamAnalytics;
};

export const generatePerformanceSummary = async (metrics: any) => {
  const prompt = `Generate a performance summary for an employee with the following metrics:
  Technical Rating: ${metrics.technicalRating}/5
  Communication: ${metrics.communicationRating}/5
  Productivity: ${metrics.productivityRating}/5
  Teamwork: ${metrics.teamworkRating}/5
  Strengths: ${metrics.strengths.join(', ')}
  Weaknesses: ${metrics.weaknesses.join(', ')}
  
  Provide a concise 3-sentence summary of their performance, followed by 1 key area for improvement.`;
  
  return await generateAIResponse(prompt);
};
