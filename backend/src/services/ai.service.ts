import prisma from '../config/prisma';
import { scoreResume } from './ai/resumeScoring.service';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * AI Integration Service — evaluates candidate applications using Gemini AI.
 * Replaces the old Python microservice proxy.
 */
export class AiIntegrationService {
  async evaluateApplication(applicationId: string, resumeUrl: string, jobDescription: string) {
    try {
      let dataBuffer: Buffer;

      // 1. Fetch resume buffer (support both Cloudinary HTTP URLs and Local files)
      if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
        const axios = (await import('axios')).default;
        const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
        dataBuffer = Buffer.from(response.data, 'binary');
      } else {
        const filename = path.basename(resumeUrl);
        const filePath = path.join(__dirname, '../../uploads', filename);
  
        if (!fs.existsSync(filePath)) {
          console.warn(`[AI Service] Resume file not found: ${filePath}`);
          return;
        }
        dataBuffer = fs.readFileSync(filePath);
      }

      // 2. Read resume text
      let resumeText = '';
      try {
        // Try basic text extraction for scoring
        resumeText = dataBuffer.toString('utf-8').substring(0, 3000);
      } catch (_) {
        resumeText = 'Unable to extract text from resume';
      }

      // 3. Score using Gemini AI (replaces Python microservice call)
      console.log(`[AI Service] Evaluating application ${applicationId} via Gemini...`);
      const { score, insights } = await scoreResume(applicationId, resumeText, jobDescription);

      // 4. Update Database
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          aiScore: score,
          aiInsights: insights
        }
      });
      
      console.log(`[AI Service] Evaluation completed for ${applicationId}. Score: ${score}`);
    } catch (error: any) {
      console.error(`[AI Service] Evaluation failed for application ${applicationId}:`, error.message);
    }
  }
}

export default new AiIntegrationService();
