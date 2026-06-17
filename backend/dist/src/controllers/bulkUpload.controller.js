import { PrismaClient } from '@prisma/client';
import { ResumeParserService } from '../services/resumeParser.service';
import { AiRankingService } from '../services/aiRanking.service';
import * as fs from 'fs';
const prisma = new PrismaClient();
export const bulkUploadResumes = async (req, res) => {
    const jobId = req.params.jobId;
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files provided for upload.' });
    }
    try {
        const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
        if (!job) {
            return res.status(404).json({ error: 'Job not found.' });
        }
        // We return the response immediately so the client doesn't time out,
        // and we process the files in the background.
        res.status(202).json({
            message: 'Bulk upload started in the background.',
            jobId,
            fileCount: files.length
        });
        const jobText = `${job.title} ${job.description || ''} ${job.requirements || ''} ${job.skills ? job.skills.join(', ') : ''}`;
        // Process resumes in background (no VectorDB embedding needed — cloud AI scoring)
        processResumes(files, job, jobText).catch(err => {
            console.error('Error during background processing of resumes:', err);
            fs.appendFileSync('bulk_upload_error.log', new Date().toISOString() + ' - Background Process Error: ' + (err.stack || err) + '\n');
        });
    }
    catch (error) {
        console.error("Bulk upload error:", error);
        fs.appendFileSync('bulk_upload_error.log', new Date().toISOString() + ' - Bulk Upload Route Error: ' + (error.stack || error) + '\n');
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process bulk upload request.' });
        }
    }
};
async function processResumes(files, job, jobText) {
    for (const file of files) {
        try {
            console.log(`Processing file: ${file.originalname}`);
            // 1. Extract raw text
            const rawText = await ResumeParserService.extractTextFromFile(file.path, file.mimetype);
            // 2. Extract structured data
            const extractedData = await ResumeParserService.extractStructuredData(rawText);
            console.log(`[Extract] ${file.originalname} → name: ${extractedData.fullName}, skills: ${extractedData.skills.length}, education: "${extractedData.education}", exp: ${extractedData.experience}`);
            // 3. Create or Update Candidate
            // Using email as unique identifier
            let candidate = await prisma.candidate.findUnique({
                where: { email: extractedData.email }
            });
            if (!candidate) {
                candidate = await prisma.candidate.create({
                    data: {
                        fullName: extractedData.fullName,
                        email: extractedData.email,
                        phone: extractedData.phone,
                        skills: extractedData.skills,
                        education: extractedData.education,
                        experience: extractedData.experience,
                        resumeUrl: file.path, // Assuming local storage for now
                        source: 'DIRECT',
                    }
                });
            }
            else {
                // Update all fields from the freshly parsed resume, not just skills
                candidate = await prisma.candidate.update({
                    where: { email: extractedData.email },
                    data: {
                        fullName: extractedData.fullName || candidate.fullName,
                        phone: extractedData.phone || candidate.phone,
                        skills: Array.from(new Set([...candidate.skills, ...extractedData.skills])),
                        education: extractedData.education || candidate.education,
                        experience: extractedData.experience > 0 ? extractedData.experience : candidate.experience,
                        resumeUrl: file.path,
                    }
                });
            }
            // 4. Embedding step removed — cloud AI scoring via Gemini
            // 5. Rank Candidate — pass skills for better scoring when job description is generic
            const ranking = await AiRankingService.rankCandidate(candidate.id, rawText, jobText, candidate.skills);
            // 6. Create Application
            // Check if application already exists
            const existingApp = await prisma.application.findUnique({
                where: {
                    jobId_candidateId: {
                        jobId: job.id,
                        candidateId: candidate.id
                    }
                }
            });
            if (!existingApp) {
                await prisma.application.create({
                    data: {
                        jobId: job.id,
                        candidateId: candidate.id,
                        stage: 'SCREENING',
                        aiScore: ranking.score,
                        aiInsights: ranking.insights
                    }
                });
            }
            else {
                await prisma.application.update({
                    where: { id: existingApp.id },
                    data: {
                        aiScore: ranking.score,
                        aiInsights: ranking.insights,
                        stage: 'SCREENING' // Reset to screening if they re-apply via bulk upload? Optional.
                    }
                });
            }
            console.log(`Successfully processed ${file.originalname} for ${candidate.fullName} (Score: ${ranking.score})`);
        }
        catch (error) {
            console.error(`Failed to process resume ${file.originalname}:`, error);
            fs.appendFileSync('bulk_upload_error.log', new Date().toISOString() + ` - Failed to process resume ${file.originalname}: ` + (error.stack || error) + '\n');
        }
    }
}
//# sourceMappingURL=bulkUpload.controller.js.map