import prisma from '../../config/prisma';
import { geminiGenerate, geminiGenerateJSON } from './gemini.service';
import { transcribeAudio } from './groq.service';
/**
 * Generates a dynamic interview question based on the candidate's resume and job description.
 */
export async function generateNextQuestion(interviewId, candidateId, jobId, previousContext = []) {
    try {
        const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
        const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
        if (!candidate || !job) {
            return "Could you please tell me about your background and experience?";
        }
        const prompt = `
You are an expert AI technical interviewer. 
Job Role: ${job.title}
Job Requirements: ${job.requirements}

Candidate Name: ${candidate.fullName}
Candidate Skills: ${candidate.skills.join(', ')}
Candidate Experience: ${candidate.experience} years

Previous questions asked: ${previousContext.join(' | ')}

Based on the candidate's profile and the job description, generate ONE highly relevant interview question.
Keep it natural, conversational, and direct. Do not include any prefix like "Question:".
`;
        return await geminiGenerate(prompt) || "Could you share an example of a challenging project you've worked on?";
    }
    catch (error) {
        console.error('Error generating AI question:', error);
        return "What is your greatest professional achievement?";
    }
}
/**
 * Analyzes the full transcript of the interview to generate behavioral metrics.
 */
export async function analyzeInterviewPerformance(interviewId, transcriptText) {
    try {
        const prompt = `
You are an expert behavioral psychologist and technical recruiter.
Analyze the following interview transcript of a candidate.

Transcript:
${transcriptText.substring(0, 15000)}

Provide a JSON output containing the following scores (0-100) and analysis:
{
    "confidenceScore": 85,
    "communicationScore": 90,
    "technicalScore": 75,
    "fillerWordsCount": 12,
    "speakingPace": "Appropriate",
    "sentiment": "Positive and enthusiastic",
    "strengths": ["Clear articulation", "Strong system design knowledge"],
    "weaknesses": ["Rambled slightly on the second question"],
    "overallRecommendation": "Strong Hire. The candidate communicated complex ideas effectively..."
}
Return strictly valid JSON without markdown formatting.
`;
        const parsed = await geminiGenerateJSON(prompt);
        // Save analysis to database
        await prisma.aIInterviewAnalysis.create({
            data: {
                interviewId,
                confidenceScore: parsed.confidenceScore || 0,
                communicationScore: parsed.communicationScore || 0,
                technicalScore: parsed.technicalScore || 0,
                fillerWordsCount: parsed.fillerWordsCount || 0,
                speakingPace: parsed.speakingPace || "Average",
                sentiment: parsed.sentiment || "Neutral",
                strengths: parsed.strengths || [],
                weaknesses: parsed.weaknesses || [],
                overallRecommendation: parsed.overallRecommendation || "Pending"
            }
        });
        return parsed;
    }
    catch (error) {
        console.error('Error analyzing interview performance:', error);
        return null;
    }
}
/**
 * Transcribe interview audio using Groq Whisper API
 */
export async function transcribeInterviewAudio(audioBuffer, filename = 'interview.webm') {
    return transcribeAudio(audioBuffer, filename);
}
//# sourceMappingURL=interviewAI.service.js.map