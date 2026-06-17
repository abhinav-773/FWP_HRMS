import { scoreResume } from './ai/resumeScoring.service';
export class AiRankingService {
    /**
     * Ranks a candidate using Gemini AI + keyword heuristics.
     * Replaces the old VectorDB/embedding-based approach.
     */
    static async rankCandidate(candidateId, resumeText, jobText, candidateSkills = [], jobId) {
        return scoreResume(candidateId, resumeText, jobText, candidateSkills);
    }
}
export default AiRankingService;
//# sourceMappingURL=aiRanking.service.js.map