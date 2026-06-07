export declare class ResumeParserService {
    /**
     * Extracts raw text from a PDF or DOCX file
     */
    static extractTextFromFile(filePath: string, mimeType: string): Promise<string>;
    /**
     * Uses Gemini (or a fallback method) to extract structured JSON from raw resume text
     */
    static extractStructuredData(rawText: string): Promise<{
        fullName: any;
        email: any;
        phone: any;
        skills: any;
        education: any;
        experience: any;
        projects: any;
        certifications: any;
        internships: any;
    }>;
    private static basicRegexExtraction;
}
//# sourceMappingURL=resumeParser.service.d.ts.map