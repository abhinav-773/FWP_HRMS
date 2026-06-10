import { geminiGenerate } from './ai/gemini.service';

// Re-export for backward compatibility with existing imports
export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    return await geminiGenerate(prompt);
  } catch (error) {
    console.error('[Gemini Service] Error generating content:', error);
    return 'AI Summary could not be generated at this time.';
  }
};
