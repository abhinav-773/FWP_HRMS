import prisma from '../config/prisma';
import { scoreResume } from './ai/resumeScoring.service';

export class AiRankingService {
    /**
     * Ranks a candidate using Gemini AI + keyword heuristics.
     * Replaces the old VectorDB/embedding-based approach.
     */
    static async rankCandidate(
        candidateId: string, 
        resumeText: string, 
        jobText: string, 
        candidateSkills: string[] = [],
        jobId?: string
    ) {
        return scoreResume(candidateId, resumeText, jobText, candidateSkills);
    }
}
export default AiRankingService;
