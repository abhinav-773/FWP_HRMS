export interface ResumeScoreResult {
    score: number;
    insights: string;
}
/**
 * Score a candidate's resume against a job description.
 * Uses Gemini API when available, falls back to keyword heuristics.
 * Returns same shape as old AiRankingService for backward compatibility.
 */
export declare function scoreResume(candidateId: string, resumeText: string, jobText: string, candidateSkills?: string[]): Promise<ResumeScoreResult>;
//# sourceMappingURL=resumeScoring.service.d.ts.map