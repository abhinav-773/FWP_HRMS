/**
 * Generate raw text from Gemini API
 */
export declare function geminiGenerate(prompt: string): Promise<string>;
/**
 * Generate and parse JSON from Gemini API.
 * Strips markdown code fences and parses the result.
 */
export declare function geminiGenerateJSON<T = any>(prompt: string): Promise<T>;
//# sourceMappingURL=gemini.service.d.ts.map