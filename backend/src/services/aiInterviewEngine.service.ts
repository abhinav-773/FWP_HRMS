import prisma from '../config/prisma';
import { generateNextQuestion, analyzeInterviewPerformance } from './ai/interviewAI.service';

export class AiInterviewEngine {
    
    /**
     * Generates a dynamic interview question based on the candidate's resume and job description.
     */
    static async generateNextQuestion(interviewId: string, candidateId: string, jobId: string, previousContext: string[] = []): Promise<string> {
        return generateNextQuestion(interviewId, candidateId, jobId, previousContext);
    }

    /**
     * Analyzes the full transcript of the interview to generate behavioral metrics.
     */
    static async analyzeInterviewPerformance(interviewId: string, transcriptText: string) {
        return analyzeInterviewPerformance(interviewId, transcriptText);
    }
}
