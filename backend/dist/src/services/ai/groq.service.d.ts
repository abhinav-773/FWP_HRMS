/**
 * Transcribe audio using Groq's Whisper API.
 * Accepts a Buffer of audio data and returns the transcript text.
 */
export declare function transcribeAudio(audioBuffer: Buffer, filename?: string): Promise<string>;
/**
 * Fast LLM inference via Groq (Llama 3) for quick responses
 */
export declare function groqChat(prompt: string): Promise<string>;
//# sourceMappingURL=groq.service.d.ts.map