import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY || 'dummy_key' });

export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || 'Unable to generate summary.';
  } catch (error) {
    console.error('[Gemini Service] Error generating content:', error);
    return 'AI Summary could not be generated at this time.';
  }
};
