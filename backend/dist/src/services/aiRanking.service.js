import { VectorDbService } from './vectorDb.service';
import prisma from '../config/prisma';
export class AiRankingService {
    /**
     * Computes keyword overlap score between resume text and job description
     */
    static computeKeywordScore(resumeText, jobText) {
        const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
        const resumeWords = new Set(normalize(resumeText));
        const jobWords = normalize(jobText);
        if (jobWords.length === 0)
            return 50;
        const uniqueJobWords = [...new Set(jobWords)];
        const matched = uniqueJobWords.filter(w => w.length > 3 && resumeWords.has(w));
        return Math.round((matched.length / uniqueJobWords.length) * 100);
    }
    /**
     * Extracts key skills from text
     */
    static extractSkills(text) {
        const commonSkills = [
            'javascript', 'typescript', 'python', 'java', 'react', 'node', 'nodejs',
            'express', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'linux', 'css',
            'html', 'vue', 'angular', 'graphql', 'rest', 'api', 'flask', 'django',
            'c++', 'c#', 'go', 'rust', 'swift', 'kotlin', 'flutter', 'firebase',
            'tailwind', 'bootstrap', 'figma', 'agile', 'scrum', 'machine learning',
            'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'devops',
            'ci/cd', 'microservices', 'kafka', 'rabbitmq', 'elasticsearch'
        ];
        const lower = text.toLowerCase();
        return commonSkills.filter(skill => lower.includes(skill));
    }
    /**
     * Ranks a candidate using detailed sub-scores (semantic, technical, experience, education)
     */
    static async rankCandidate(candidateId, resumeText, jobText, candidateSkills = [], jobId) {
        // 1. Semantic Similarity (with offline cosine fallback)
        let semanticScore = 0;
        try {
            const raw = await VectorDbService.getCandidateSimilarity(candidateId, jobText);
            semanticScore = Math.max(0, Math.min(100, Math.round(raw * 100)));
            if (semanticScore === 0) {
                const candEmb = await VectorDbService.getEmbedding(resumeText);
                const jobEmb = await VectorDbService.getEmbedding(jobText);
                const dotProduct = candEmb.reduce((sum, val, i) => sum + val * (jobEmb[i] ?? 0), 0);
                const magA = Math.sqrt(candEmb.reduce((sum, val) => sum + val * val, 0));
                const magB = Math.sqrt(jobEmb.reduce((sum, val) => sum + val * val, 0));
                const sim = magA === 0 || magB === 0 ? 0 : dotProduct / (magA * magB);
                semanticScore = Math.max(0, Math.min(100, Math.round(sim * 100)));
            }
        }
        catch (error) {
            console.error("[AiRanking] Vector DB similarity query failed, executing local fallback...", error);
            try {
                const candEmb = await VectorDbService.getEmbedding(resumeText);
                const jobEmb = await VectorDbService.getEmbedding(jobText);
                const dotProduct = candEmb.reduce((sum, val, i) => sum + val * (jobEmb[i] ?? 0), 0);
                const magA = Math.sqrt(candEmb.reduce((sum, val) => sum + val * val, 0));
                const magB = Math.sqrt(jobEmb.reduce((sum, val) => sum + val * val, 0));
                const sim = magA === 0 || magB === 0 ? 0 : dotProduct / (magA * magB);
                semanticScore = Math.max(0, Math.min(100, Math.round(sim * 100)));
            }
            catch (localErr) {
                console.error("[AiRanking] Local similarity fallback failed:", localErr);
                semanticScore = this.computeKeywordScore(resumeText, jobText);
            }
        }
        // 2. Technical Relevance Score
        const resumeSkills = this.extractSkills(resumeText);
        const jobSkills = this.extractSkills(jobText);
        const matchedSkills = resumeSkills.filter(s => jobSkills.includes(s));
        const missingSkills = jobSkills.filter(s => !resumeSkills.includes(s));
        let technicalScore = 50; // default baseline
        if (jobSkills.length > 0) {
            technicalScore = Math.round((matchedSkills.length / jobSkills.length) * 100);
        }
        else {
            technicalScore = Math.min(100, (candidateSkills.length || resumeSkills.length) * 8);
        }
        technicalScore = Math.max(10, Math.min(100, technicalScore));
        // 3. Experience Match Score
        let expRequired = 2; // default assumption
        const expMatch = jobText.match(/(\d+)\+?\s*years?/i);
        if (expMatch)
            expRequired = parseInt(expMatch[1] || '2', 10);
        let candidateExp = 0;
        try {
            const cand = await prisma.candidate.findUnique({ where: { id: candidateId } });
            if (cand)
                candidateExp = cand.experience;
        }
        catch (err) {
            console.warn("[AiRanking] Failed to load candidate experience, using fallback.");
        }
        let experienceScore = 50;
        if (candidateExp >= expRequired) {
            experienceScore = 90 + Math.min(10, (candidateExp - expRequired) * 2);
        }
        else {
            experienceScore = Math.max(20, Math.round((candidateExp / expRequired) * 80));
        }
        // 4. Education Fit Score
        const eduKeywords = ['phd', 'doctorate', 'master', 'mtech', 'm.tech', 'msc', 'mba', 'btech', 'b.tech', 'be', 'b.e', 'bsc', 'bachelor', 'degree'];
        const candidateEduText = resumeText.toLowerCase();
        const jobEduText = jobText.toLowerCase();
        let educationScore = 70; // baseline
        const jobRequiresHigher = jobEduText.includes('master') || jobEduText.includes('phd') || jobEduText.includes('mtech');
        const candidateHasHigher = candidateEduText.includes('master') || candidateEduText.includes('phd') || candidateEduText.includes('mtech') || candidateEduText.includes('msc');
        const candidateHasBachelor = candidateEduText.includes('bachelor') || candidateEduText.includes('btech') || candidateEduText.includes('b.e') || candidateEduText.includes('bsc') || candidateEduText.includes('degree');
        if (jobRequiresHigher) {
            educationScore = candidateHasHigher ? 95 : (candidateHasBachelor ? 65 : 40);
        }
        else if (candidateHasHigher || candidateHasBachelor) {
            educationScore = 90;
        }
        // 5. Overall AI Score blending
        let overallScore = Math.round((semanticScore * 0.4) + (technicalScore * 0.3) + (experienceScore * 0.15) + (educationScore * 0.15));
        overallScore = Math.max(1, Math.min(99, overallScore));
        // Generate Recruiter insights details
        const recommendation = overallScore >= 80 ? 'Shortlist for Interview' : (overallScore >= 60 ? 'Schedule Screening' : 'Reject / Keep on Hold');
        let explanation = '';
        if (overallScore >= 80) {
            explanation = `Candidate shows strong alignment with ${overallScore}% match. High skill overlap and solid experience match.`;
        }
        else if (overallScore >= 60) {
            explanation = `Candidate is a moderate fit with ${overallScore}% match. Suggest scheduling a phone screen to review missing qualifications.`;
        }
        else {
            explanation = `Low alignment score of ${overallScore}%. Candidate lacks key skills or experience requested for this role.`;
        }
        let richResult = {
            isRichAnalysis: true,
            semanticScore,
            technicalScore,
            experienceScore,
            educationScore,
            overallScore,
            strengths: matchedSkills.length > 0 ? matchedSkills.slice(0, 5).map(s => `Experienced in ${s}`) : ["Demonstrates technical foundational skills"],
            weaknesses: missingSkills.length > 0 ? missingSkills.slice(0, 3).map(s => `Lacks proven expertise in ${s}`) : ["None identified"],
            missingSkills: missingSkills.slice(0, 6),
            recommendation,
            explanation
        };
        // 6. Optional Gemini model query for richer SaaS explanation
        if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('dummy')) {
            try {
                const { GoogleGenAI } = await import('@google/genai');
                const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const prompt = `
You are an expert AI recruiter. Evaluate this candidate's resume against the job requirements.
Analyze:
1. Skills Match
2. Experience Fit
3. Education Alignment

Job Description:
${jobText.substring(0, 1500)}

Resume Text:
${resumeText.substring(0, 1500)}

Respond ONLY with a valid JSON block containing the following fields:
{
  "semanticScore": 0-100 score,
  "technicalScore": 0-100 score,
  "experienceScore": 0-100 score,
  "educationScore": 0-100 score,
  "overallScore": 0-100 score,
  "strengths": ["list of 2-3 strengths"],
  "weaknesses": ["list of 1-2 weaknesses"],
  "missingSkills": ["list of 3-4 missing skills from job description"],
  "recommendation": "Shortlist / Review / Reject",
  "explanation": "Summary of 3-4 sentences detailing the rationale"
}
Do not write markdown backticks. Return strictly valid JSON.
`;
                const response = await genai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                let resText = response.text || "{}";
                resText = resText.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(resText);
                if (parsed.overallScore) {
                    richResult = {
                        isRichAnalysis: true,
                        semanticScore: parsed.semanticScore || semanticScore,
                        technicalScore: parsed.technicalScore || technicalScore,
                        experienceScore: parsed.experienceScore || experienceScore,
                        educationScore: parsed.educationScore || educationScore,
                        overallScore: parsed.overallScore || overallScore,
                        strengths: parsed.strengths || richResult.strengths,
                        weaknesses: parsed.weaknesses || richResult.weaknesses,
                        missingSkills: parsed.missingSkills || richResult.missingSkills,
                        recommendation: parsed.recommendation || richResult.recommendation,
                        explanation: parsed.explanation || richResult.explanation
                    };
                }
            }
            catch (err) {
                console.warn("[AiRanking] Gemini API error, falling back to local calculation insights:", err?.message);
            }
        }
        return {
            score: richResult.overallScore,
            insights: JSON.stringify(richResult)
        };
    }
}
export default AiRankingService;
//# sourceMappingURL=aiRanking.service.js.map