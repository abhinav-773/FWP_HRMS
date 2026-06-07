import prisma from '../config/prisma';
import { GoogleGenAI } from '@google/genai';
import { GoalStatus } from '@prisma/client';
const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });
export class PerformanceService {
    // Goals (OKRs)
    async createGoal(employeeId, title, description, targetDate) {
        return await prisma.performanceGoal.create({
            data: {
                employeeId,
                title,
                description,
                targetDate: targetDate ? new Date(targetDate) : null,
                progress: 0,
                status: GoalStatus.ACTIVE
            }
        });
    }
    async getEmployeeGoals(employeeId) {
        return await prisma.performanceGoal.findMany({
            where: { employeeId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async updateGoalProgress(goalId, progress, status) {
        return await prisma.performanceGoal.update({
            where: { id: goalId },
            data: {
                progress,
                ...(status && { status })
            }
        });
    }
    // Reviews
    async createReview(employeeId, reviewerId, reviewPeriod, rating, comments) {
        return await prisma.performanceReview.create({
            data: {
                employeeId,
                reviewerId,
                reviewPeriod,
                technicalRating: rating,
                communicationRating: rating,
                productivityRating: rating,
                teamworkRating: rating,
                overallRating: rating,
                managerRemarks: comments
            }
        });
    }
    async getEmployeeReviews(employeeId) {
        return await prisma.performanceReview.findMany({
            where: { employeeId },
            include: {
                reviewer: {
                    include: {
                        user: { select: { fullName: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    // Peer Feedback
    async requestFeedback(employeeId, peerId, reviewPeriod, feedbackText, rating) {
        return await prisma.peerFeedback.create({
            data: {
                employeeId,
                peerId,
                reviewPeriod,
                feedbackText,
                rating
            }
        });
    }
    async getEmployeeFeedback(employeeId) {
        return await prisma.peerFeedback.findMany({
            where: { employeeId },
            include: {
                peer: {
                    include: {
                        user: { select: { fullName: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    // AI Performance Summary & Skill Gap Analysis
    async generateAISummary(employeeId, reviewPeriod) {
        try {
            // 1. Gather all context
            const employee = await prisma.employeeProfile.findUnique({
                where: { id: employeeId },
                include: { user: true, department: true, designation: true }
            });
            if (!employee)
                throw new Error('Employee profile not found');
            const goals = await prisma.performanceGoal.findMany({ where: { employeeId } });
            const reviews = await prisma.performanceReview.findMany({ where: { employeeId, reviewPeriod } });
            const feedbacks = await prisma.peerFeedback.findMany({ where: { employeeId, reviewPeriod } });
            // 2. Format prompt
            const prompt = `
      You are an expert HR Performance analyst. Construct a professional, executive-grade AI Performance Summary and Skill Gap Analysis for the following employee based on their achievements, goals progress, and peer feedback.

      Employee Profile:
      - Name: ${employee.user.fullName}
      - Title: ${employee.designation?.title || 'Team Member'}
      - Department: ${employee.department?.name || 'Operations'}
      
      Review Period: ${reviewPeriod}

      Goals (OKRs) Status:
      ${goals.map(g => `- ${g.title}: Progress: ${g.progress}%, Status: ${g.status}`).join('\n')}

      Manager Comments:
      ${reviews.map(r => `- Rating ${r.technicalRating}/5: "${r.managerRemarks}"`).join('\n')}

      Peer Feedback Comments:
      ${feedbacks.map(f => `- Rating ${f.rating || 'N/A'}/5: "${f.feedbackText}"`).join('\n')}

      Analyze this data and return:
      1. Accomplishments Summary
      2. Identified Strengths
      3. Key Growth Areas / Skill Gap Analysis
      4. Recommendations for Training/Development

      Provide your response in clean Markdown formatting. Keep it concise, helpful, and highly constructive.
      `;
            // 3. Request completion from Gemini
            const response = await genai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });
            const summaryText = response.text || 'Performance data insufficient for AI Summary.';
            // Save summary back to the latest review if exists
            const latestReview = reviews[0];
            if (latestReview) {
                await prisma.performanceReview.update({
                    where: { id: latestReview.id },
                    data: { aiSummary: summaryText }
                });
            }
            return summaryText;
        }
        catch (error) {
            console.error('generateAISummary error:', error);
            return `Failed to compile AI summary. Error: ${error.message}`;
        }
    }
}
export default new PerformanceService();
//# sourceMappingURL=performance.service.js.map