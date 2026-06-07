import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key_to_avoid_crash_if_not_set' });

export class ResumeParserService {
    /**
     * Extracts raw text from a PDF or DOCX file
     */
    static async extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        try {
            if (mimeType === 'application/pdf') {
                const dataBuffer = fs.readFileSync(filePath);
                // pdf-parse v1.1.1 exports the function directly
                const parseFn = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
                const data = await parseFn(dataBuffer);
                return data.text;
            } else if (
                mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                mimeType === 'application/msword'
            ) {
                const result = await mammoth.extractRawText({ path: filePath });
                return result.value;
            } else {
                // Attempt raw string read if txt
                if (mimeType === 'text/plain') {
                   return fs.readFileSync(filePath, 'utf-8');
                }
                throw new Error(`Unsupported file format for parsing: ${mimeType}`);
            }
        } catch (error: any) {
            console.error("Error extracting text from file:", error?.message || error);
            console.error("Full error:", error);
            console.error("File path:", filePath, "MIME:", mimeType);
            console.error("pdf-parse type:", typeof pdfParse);
            throw new Error(`Failed to extract text from file: ${error?.message}`);
        }
    }

    /**
     * Uses Gemini (or a fallback method) to extract structured JSON from raw resume text
     */
    static async extractStructuredData(rawText: string) {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is not set. Using basic regex fallback parsing (Not recommended for enterprise).");
            return this.basicRegexExtraction(rawText);
        }

        const prompt = `
        You are an expert AI recruiter. Extract the following information from the resume text below and return it as a strict JSON object. 
        Do not include markdown blocks like \`\`\`json. Return ONLY valid JSON.
        
        Required fields:
        {
          "fullName": "Full name of the candidate",
          "email": "Email address",
          "phone": "Phone number",
          "skills": ["Array", "of", "technical", "skills"],
          "education": "Degree name, institution, and graduation year (e.g. B.Tech Computer Science, XYZ University, 2024)",
          "experience": "Total years of professional experience as a number. Count internships as 0. Default to 0 if no work experience.",
          "projects": "Brief summary of notable projects (1-3 sentences)",
          "certifications": "List of certifications if any, otherwise empty string",
          "internships": "List of internships with company and role if any, otherwise empty string"
        }

        Resume Text:
        ${rawText.substring(0, 8000)}
        `;

        try {
            const response = await genai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            let responseText = response.text || "{}";
            
            // Clean up possible markdown
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            
            const parsed = JSON.parse(responseText);

            // Build a rich education string combining degree + internships
            let educationSummary = parsed.education || "";
            if (parsed.internships && parsed.internships.trim()) {
                educationSummary += educationSummary ? `\n\nInternships: ${parsed.internships}` : `Internships: ${parsed.internships}`;
            }
            if (parsed.certifications && parsed.certifications.trim()) {
                educationSummary += educationSummary ? `\n\nCertifications: ${parsed.certifications}` : `Certifications: ${parsed.certifications}`;
            }

            return {
                fullName: parsed.fullName || "Unknown",
                email: parsed.email || "no-email@example.com",
                phone: parsed.phone || null,
                skills: Array.isArray(parsed.skills) ? parsed.skills : [],
                education: educationSummary,
                experience: typeof parsed.experience === 'number' ? parsed.experience : parseInt(parsed.experience || '0', 10),
                projects: parsed.projects || "",
                certifications: parsed.certifications || "",
                internships: parsed.internships || ""
            };

        } catch (error) {
            console.error("LLM Extraction Error:", error);
            return this.basicRegexExtraction(rawText);
        }
    }

    private static basicRegexExtraction(text: string) {
        console.warn('[ResumeParser] Falling back to regex extraction (Gemini unavailable)');
        // Fallback if LLM fails or no API key
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

        // Try to extract name from top of resume (first non-empty line)
        const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 2 && l.length < 60 && !/^(resume|cv|curriculum)/i.test(l));
        
        // Extract known skills from full text
        const knownSkills = [
            'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift',
            'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask',
            'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
            'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'Linux',
            'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'GraphQL', 'REST',
            'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'
        ];
        const lowerText = text.toLowerCase();
        const extractedSkills = knownSkills.filter(skill => lowerText.includes(skill.toLowerCase()));

        // Try to extract education
        const eduMatch = text.match(/(?:B\.?Tech|B\.?E\.?|B\.?Sc|M\.?Tech|M\.?Sc|MBA|BCA|MCA|Bachelor|Master)[^\n]{0,100}/i);
        
        return {
            fullName: firstLine || "Unknown Candidate",
            email: emailMatch ? emailMatch[0] : "no-email@example.com",
            phone: phoneMatch ? phoneMatch[0] : null,
            skills: extractedSkills.length > 0 ? extractedSkills : [],
            education: eduMatch ? eduMatch[0].trim() : "",
            experience: 0,
            projects: "",
            certifications: "",
            internships: ""
        };
    }
}
