import express from 'express';
import prisma from '../config/prisma';
import { upload } from '../middlewares/upload.middleware';
import screeningQueueService from '../services/screeningQueue.service';
import { logger } from '../config/logger';
import emailService from '../services/email.service';
import { eventBus } from '../services/eventBus';
const router = express.Router();
// 1. Get all public open job postings
router.get('/jobs', async (req, res) => {
    try {
        const { search, departmentId, location, experienceRequired, remote } = req.query;
        const where = { status: 'OPEN' };
        if (departmentId) {
            where.departmentId = departmentId;
        }
        if (location) {
            where.location = { contains: location, mode: 'insensitive' };
        }
        if (remote !== undefined) {
            if (remote === 'true') {
                where.location = { contains: 'remote', mode: 'insensitive' };
            }
            else if (remote === 'false') {
                where.NOT = { location: { contains: 'remote', mode: 'insensitive' } };
            }
        }
        if (experienceRequired) {
            where.experienceRequired = { lte: parseInt(experienceRequired, 10) };
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        const jobs = await prisma.jobPosting.findMany({
            where,
            include: {
                department: true,
                postedBy: { select: { fullName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ data: jobs });
    }
    catch (error) {
        logger.error('Public jobs fetch failed:', error);
        res.status(500).json({ error: error.message });
    }
});
// 2. Get specific public open job posting detail
router.get('/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const job = await prisma.jobPosting.findFirst({
            where: { id, status: 'OPEN' },
            include: {
                department: true,
                postedBy: { select: { fullName: true } }
            }
        });
        if (!job) {
            return res.status(404).json({ error: 'Job opening not found or has been closed.' });
        }
        res.json({ data: job });
    }
    catch (error) {
        logger.error('Public job detail fetch failed:', error);
        res.status(500).json({ error: error.message });
    }
});
// 3. Submit application directly from careers page
router.post('/apply', upload.single('resume'), async (req, res) => {
    try {
        const { jobId, fullName, email, phone, location, coverLetter } = req.body;
        if (!jobId || !fullName || !email) {
            return res.status(400).json({ error: 'Job ID, Full Name, and Email are required fields.' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Resume PDF or DOCX file upload is required.' });
        }
        // Check if the job posting is open
        const job = await prisma.jobPosting.findUnique({
            where: { id: jobId }
        });
        if (!job || job.status !== 'OPEN') {
            return res.status(400).json({ error: 'This job posting is no longer active.' });
        }
        // Relative resume URL path to store in candidate entry
        const resumeUrl = `/uploads/${req.file.filename}`;
        // Create or update Candidate record
        let candidate = await prisma.candidate.findUnique({
            where: { email }
        });
        if (!candidate) {
            candidate = await prisma.candidate.create({
                data: {
                    fullName,
                    email,
                    phone: phone || null,
                    location: location || null,
                    resumeUrl,
                    source: 'DIRECT'
                }
            });
        }
        else {
            candidate = await prisma.candidate.update({
                where: { email },
                data: {
                    fullName,
                    phone: phone || candidate.phone,
                    location: location || candidate.location,
                    resumeUrl
                }
            });
        }
        // Check if application already exists for this job
        const existingApp = await prisma.application.findUnique({
            where: {
                jobId_candidateId: {
                    jobId,
                    candidateId: candidate.id
                }
            }
        });
        if (existingApp) {
            return res.status(400).json({ error: 'You have already applied for this job opening.' });
        }
        // Create Application
        const application = await prisma.application.create({
            data: {
                jobId,
                candidateId: candidate.id,
                coverLetter: coverLetter || null,
                stage: 'APPLIED',
                aiScore: null,
                aiInsights: 'Screening in progress...'
            }
        });
        // Add activity log
        await prisma.applicationActivity.create({
            data: {
                applicationId: application.id,
                toStage: 'APPLIED',
                note: 'Direct applicant applied via Careers portal',
                performedById: job.postedById
            }
        });
        // Queue application for AI screening asynchronously
        screeningQueueService.queueApplication(application.id);
        // Emit socket event for real-time ATS update via eventBus
        eventBus.emit('ats:update', {
            jobId,
            activity: { applicationId: application.id }
        });
        res.status(201).json({
            message: 'Your application has been submitted successfully and is being screened.',
            data: application
        });
    }
    catch (error) {
        logger.error('Public job application submission failed:', error);
        res.status(500).json({ error: error.message });
    }
});
// 4. Submit an Enterprise Demo Request
router.post('/demo-request', async (req, res) => {
    try {
        const { name, company, email, companySize, message } = req.body;
        if (!name || !company || !email) {
            return res.status(400).json({ error: 'Name, Company, and Email are required fields.' });
        }
        // Save to DB
        const demoRequest = await prisma.demoRequest.create({
            data: {
                name,
                company,
                email,
                companySize,
                message,
            }
        });
        // Notify Admin via SMTP
        // Assuming admin email is configured or defaulting to SMTP_USER
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@hrgpt.com';
        await emailService.sendDemoRequestNotification(adminEmail, name, company, message);
        res.status(201).json({
            message: 'Demo request submitted successfully. Our enterprise team will contact you shortly.',
            data: demoRequest
        });
    }
    catch (error) {
        logger.error('Enterprise Demo request submission failed:', error);
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=public.routes.js.map