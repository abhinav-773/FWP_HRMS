import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../config/prisma';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/api/v1';
export class AiIntegrationService {
    async evaluateApplication(applicationId, resumeUrl, jobDescription) {
        try {
            // 1. Resolve local path of the resume
            const filename = path.basename(resumeUrl);
            const filePath = path.join(__dirname, '../../uploads', filename);
            if (!fs.existsSync(filePath)) {
                console.warn(`[AI Service] Resume file not found: ${filePath}`);
                return;
            }
            // 2. Prepare Form Data
            const formData = new FormData();
            formData.append('resume', fs.createReadStream(filePath));
            formData.append('job_description', jobDescription);
            // 3. Call AI Microservice
            console.log(`[AI Service] Sending application ${applicationId} for evaluation...`);
            const response = await axios.post(`${AI_SERVICE_URL}/resume/evaluate`, formData, {
                headers: {
                    ...formData.getHeaders()
                }
            });
            const { score, insights } = response.data;
            // 4. Update Database
            await prisma.application.update({
                where: { id: applicationId },
                data: {
                    aiScore: score,
                    aiInsights: insights
                }
            });
            console.log(`[AI Service] Evaluation completed for ${applicationId}. Score: ${score}`);
        }
        catch (error) {
            console.error(`[AI Service] Evaluation failed for application ${applicationId}:`, error.message);
        }
    }
}
export default new AiIntegrationService();
//# sourceMappingURL=ai.service.js.map