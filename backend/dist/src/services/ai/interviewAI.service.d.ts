/**
 * Generates a dynamic interview question based on the candidate's resume and job description.
 */
export declare function generateNextQuestion(interviewId: string, candidateId: string, jobId: string, previousContext?: string[]): Promise<string>;
/**
 * Analyzes the full transcript of the interview to generate behavioral metrics.
 */
export declare function analyzeInterviewPerformance(interviewId: string, transcriptText: string): Promise<any>;
/**
 * Transcribe interview audio using Groq Whisper API
 */
export declare function transcribeInterviewAudio(audioBuffer: Buffer, filename?: string): Promise<string>;
//# sourceMappingURL=interviewAI.service.d.ts.map