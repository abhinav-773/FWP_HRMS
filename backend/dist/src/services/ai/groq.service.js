import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
/**
 * Transcribe audio using Groq's Whisper API.
 * Accepts a Buffer of audio data and returns the transcript text.
 */
export async function transcribeAudio(audioBuffer, filename = 'audio.webm') {
    if (!process.env.GROQ_API_KEY) {
        console.warn('[Groq Service] GROQ_API_KEY not set. Returning empty transcript.');
        return '[Transcription unavailable — GROQ_API_KEY not configured]';
    }
    try {
        // Write buffer to a temporary file (Groq SDK requires a file path)
        const tmpDir = path.join(__dirname, '../../../uploads/tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        const tmpPath = path.join(tmpDir, `groq_${Date.now()}_${filename}`);
        fs.writeFileSync(tmpPath, audioBuffer);
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(tmpPath),
            model: 'whisper-large-v3-turbo',
            language: 'en',
            response_format: 'text',
        });
        // Clean up temp file
        try {
            fs.unlinkSync(tmpPath);
        }
        catch (_) { /* ignore cleanup errors */ }
        return typeof transcription === 'string' ? transcription : transcription.text || '';
    }
    catch (error) {
        console.error('[Groq Service] Transcription error:', error?.message || error);
        return '[Transcription failed]';
    }
}
/**
 * Fast LLM inference via Groq (Llama 3) for quick responses
 */
export async function groqChat(prompt) {
    if (!process.env.GROQ_API_KEY) {
        return '';
    }
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.6,
            max_tokens: 1024,
        });
        return completion.choices[0]?.message?.content || '';
    }
    catch (error) {
        console.error('[Groq Service] Chat error:', error?.message || error);
        return '';
    }
}
//# sourceMappingURL=groq.service.js.map