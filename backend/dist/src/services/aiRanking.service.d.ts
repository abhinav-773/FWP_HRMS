export declare class AiRankingService {
    /**
     * Computes keyword overlap score between resume text and job description
     */
    private static computeKeywordScore;
    /**
     * Extracts key skills from text
     */
    private static extractSkills;
    /**
     * Ranks a candidate using detailed sub-scores (semantic, technical, experience, education)
     */
    static rankCandidate(candidateId: string, resumeText: string, jobText: string, candidateSkills?: string[], jobId?: string): Promise<{
        score: number;
        insights: string;
    }>;
}
export default AiRankingService;
//# sourceMappingURL=aiRanking.service.d.ts.map