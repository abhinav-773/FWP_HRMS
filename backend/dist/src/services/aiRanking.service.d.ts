export declare class AiRankingService {
    /**
     * Ranks a candidate using Gemini AI + keyword heuristics.
     * Replaces the old VectorDB/embedding-based approach.
     */
    static rankCandidate(candidateId: string, resumeText: string, jobText: string, candidateSkills?: string[], jobId?: string): Promise<import("./ai/resumeScoring.service").ResumeScoreResult>;
}
export default AiRankingService;
//# sourceMappingURL=aiRanking.service.d.ts.map