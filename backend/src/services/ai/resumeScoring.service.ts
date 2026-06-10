import prisma from '../../config/prisma';
import { geminiGenerateJSON } from './gemini.service';

export interface ResumeScoreResult {
  score: number;
  insights: string;
}

interface ScoringData {
  isRichAnalysis: boolean;
  semanticScore: number;
  technicalScore: number;
  experienceScore: number;
  educationScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendation: string;
  explanation: string;
}

/**
 * Common skill dictionary for keyword matching
 */
const COMMON_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'react', 'node', 'nodejs',
  'express', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'linux', 'css',
  'html', 'vue', 'angular', 'graphql', 'rest', 'api', 'flask', 'django',
  'c++', 'c#', 'go', 'rust', 'swift', 'kotlin', 'flutter', 'firebase',
  'tailwind', 'bootstrap', 'figma', 'agile', 'scrum', 'machine learning',
  'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'devops',
  'ci/cd', 'microservices', 'kafka', 'rabbitmq', 'elasticsearch'
];

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return COMMON_SKILLS.filter(skill => lower.includes(skill));
}

function computeKeywordScore(resumeText: string, jobText: string): number {
  const normalize = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  const resumeWords = new Set(normalize(resumeText));
  const jobWords = normalize(jobText);

  if (jobWords.length === 0) return 50;

  const uniqueJobWords = [...new Set(jobWords)];
  const matched = uniqueJobWords.filter(w => w.length > 3 && resumeWords.has(w));
  return Math.round((matched.length / uniqueJobWords.length) * 100);
}

/**
 * Score a candidate's resume against a job description.
 * Uses Gemini API when available, falls back to keyword heuristics.
 * Returns same shape as old AiRankingService for backward compatibility.
 */
export async function scoreResume(
  candidateId: string,
  resumeText: string,
  jobText: string,
  candidateSkills: string[] = []
): Promise<ResumeScoreResult> {

  // ── Local heuristic scoring (always computed as baseline/fallback) ──
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobText);
  const matchedSkills = resumeSkills.filter(s => jobSkills.includes(s));
  const missingSkills = jobSkills.filter(s => !resumeSkills.includes(s));

  // Keyword-based semantic proxy
  const keywordScore = computeKeywordScore(resumeText, jobText);

  // Technical score
  let technicalScore = 50;
  if (jobSkills.length > 0) {
    technicalScore = Math.round((matchedSkills.length / jobSkills.length) * 100);
  } else {
    technicalScore = Math.min(100, (candidateSkills.length || resumeSkills.length) * 8);
  }
  technicalScore = Math.max(10, Math.min(100, technicalScore));

  // Experience score
  let expRequired = 2;
  const expMatch = jobText.match(/(\d+)\+?\s*years?/i);
  if (expMatch) expRequired = parseInt(expMatch[1] || '2', 10);

  let candidateExp = 0;
  try {
    const cand = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (cand) candidateExp = cand.experience;
  } catch (_) { /* fallback */ }

  let experienceScore = 50;
  if (candidateExp >= expRequired) {
    experienceScore = 90 + Math.min(10, (candidateExp - expRequired) * 2);
  } else {
    experienceScore = Math.max(20, Math.round((candidateExp / expRequired) * 80));
  }

  // Education score
  const candidateEduText = resumeText.toLowerCase();
  const jobEduText = jobText.toLowerCase();
  let educationScore = 70;
  const jobRequiresHigher = jobEduText.includes('master') || jobEduText.includes('phd') || jobEduText.includes('mtech');
  const candidateHasHigher = candidateEduText.includes('master') || candidateEduText.includes('phd') || candidateEduText.includes('mtech') || candidateEduText.includes('msc');
  const candidateHasBachelor = candidateEduText.includes('bachelor') || candidateEduText.includes('btech') || candidateEduText.includes('b.e') || candidateEduText.includes('bsc') || candidateEduText.includes('degree');

  if (jobRequiresHigher) {
    educationScore = candidateHasHigher ? 95 : (candidateHasBachelor ? 65 : 40);
  } else if (candidateHasHigher || candidateHasBachelor) {
    educationScore = 90;
  }

  // Blended score
  let overallScore = Math.round((keywordScore * 0.4) + (technicalScore * 0.3) + (experienceScore * 0.15) + (educationScore * 0.15));
  overallScore = Math.max(1, Math.min(99, overallScore));

  const recommendation = overallScore >= 80 ? 'Shortlist for Interview' : (overallScore >= 60 ? 'Schedule Screening' : 'Reject / Keep on Hold');
  let explanation = '';
  if (overallScore >= 80) {
    explanation = `Candidate shows strong alignment with ${overallScore}% match. High skill overlap and solid experience match.`;
  } else if (overallScore >= 60) {
    explanation = `Candidate is a moderate fit with ${overallScore}% match. Suggest scheduling a phone screen to review missing qualifications.`;
  } else {
    explanation = `Low alignment score of ${overallScore}%. Candidate lacks key skills or experience requested for this role.`;
  }

  let richResult: ScoringData = {
    isRichAnalysis: true,
    semanticScore: keywordScore,
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

  // ── Gemini-powered rich analysis (enhances heuristic scores) ──
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('dummy')) {
    try {
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
      const parsed = await geminiGenerateJSON<ScoringData>(prompt);

      if (parsed.overallScore) {
        richResult = {
          isRichAnalysis: true,
          semanticScore: parsed.semanticScore || richResult.semanticScore,
          technicalScore: parsed.technicalScore || richResult.technicalScore,
          experienceScore: parsed.experienceScore || richResult.experienceScore,
          educationScore: parsed.educationScore || richResult.educationScore,
          overallScore: parsed.overallScore || richResult.overallScore,
          strengths: parsed.strengths || richResult.strengths,
          weaknesses: parsed.weaknesses || richResult.weaknesses,
          missingSkills: parsed.missingSkills || richResult.missingSkills,
          recommendation: parsed.recommendation || richResult.recommendation,
          explanation: parsed.explanation || richResult.explanation
        };
      }
    } catch (err: any) {
      console.warn("[ResumeScoring] Gemini API error, using heuristic scores:", err?.message);
    }
  }

  return {
    score: richResult.overallScore,
    insights: JSON.stringify(richResult)
  };
}
