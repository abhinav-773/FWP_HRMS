export declare class AiInterviewEngine {
    /**
     * Generates a dynamic interview question based on the candidate's resume and job description.
     */
    static generateNextQuestion(interviewId: string, candidateId: string, jobId: string, previousContext?: string[]): Promise<string>;
    /**
     * Analyzes the full transcript of the interview to generate behavioral metrics.
     */
    static analyzeInterviewPerformance(interviewId: string, transcriptText: string): Promise<any>;
}
//# sourceMappingURL=aiInterviewEngine.service.d.ts.map