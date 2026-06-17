import { generateNextQuestion, analyzeInterviewPerformance } from './ai/interviewAI.service';
export class AiInterviewEngine {
    /**
     * Generates a dynamic interview question based on the candidate's resume and job description.
     */
    static async generateNextQuestion(interviewId, candidateId, jobId, previousContext = []) {
        return generateNextQuestion(interviewId, candidateId, jobId, previousContext);
    }
    /**
     * Analyzes the full transcript of the interview to generate behavioral metrics.
     */
    static async analyzeInterviewPerformance(interviewId, transcriptText) {
        return analyzeInterviewPerformance(interviewId, transcriptText);
    }
}
//# sourceMappingURL=aiInterviewEngine.service.js.map