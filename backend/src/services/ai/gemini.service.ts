import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key_to_avoid_crash' });

/**
 * Generate raw text from Gemini API
 */
export async function geminiGenerate(prompt: string): Promise<string> {
  try {
    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || '';
  } catch (error: any) {
    console.error('[Gemini Service] Error:', error?.message || error);
    throw error;
  }
}

/**
 * Generate and parse JSON from Gemini API.
 * Strips markdown code fences and parses the result.
 */
export async function geminiGenerateJSON<T = any>(prompt: string): Promise<T> {
  const raw = await geminiGenerate(prompt);
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned) as T;
}
