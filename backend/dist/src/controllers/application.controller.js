import applicationService from '../services/application.service';
import { ApplicationStage } from '@prisma/client';
import { eventBus } from '../services/eventBus';
import screeningQueueService from '../services/screeningQueue.service';
import emailService from '../services/email.service';
import prisma from '../config/prisma';
import { v4 as uuidv4 } from 'uuid';
export const applyForJob = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { jobId, candidateId, coverLetter, recruiterNotes } = req.body;
        const app = await applicationService.applyForJob(jobId, candidateId, { coverLetter, recruiterNotes, performedById: userId });
        res.status(201).json({ data: app, message: 'Application submitted successfully' });
    }
    catch (error) {
        if (error.code === 'P2002')
            return res.status(400).json({ error: 'Candidate has already applied for this job' });
        res.status(500).json({ error: error.message });
    }
};
export const getApplications = async (req, res) => {
    try {
        const apps = await applicationService.getAllApplications(req.query);
        res.json({ data: apps });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateStage = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        const { stage, note } = req.body;
        if (!Object.values(ApplicationStage).includes(stage)) {
            return res.status(400).json({ error: 'Invalid stage' });
        }
        const app = await applicationService.updateApplicationStage(id, stage, userId, note);
        // Broadcast real-time ATS update
        eventBus.emitAtsUpdate(app.jobId, { applicationId: app.id, stage: app.stage });
        res.json({ data: app, message: `Application moved to ${stage}` });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateNotes = async (req, res) => {
    try {
        const id = req.params.id;
        const { notes } = req.body;
        const app = await applicationService.updateRecruiterNotes(id, notes);
        res.json({ data: app, message: 'Notes updated' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const retriggerAi = async (req, res) => {
    try {
        const id = req.params.id;
        const app = await prisma.application.findUnique({
            where: { id },
            include: { candidate: true, job: true }
        });
        if (!app) {
            return res.status(404).json({ error: 'Application not found' });
        }
        // Retrigger screening in queue
        screeningQueueService.queueApplication(id);
        res.json({ message: 'AI Screening retriggered successfully in the background.' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const overrideDecision = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        const { stage, note } = req.body;
        if (!Object.values(ApplicationStage).includes(stage)) {
            return res.status(400).json({ error: 'Invalid stage' });
        }
        const app = await applicationService.updateApplicationStage(id, stage, userId, note || `Recruiter overrode and set stage to ${stage}`);
        // Fetch candidate details for email triggers
        const appWithCandidate = await prisma.application.findUnique({
            where: { id },
            include: { candidate: true, job: true }
        });
        if (appWithCandidate) {
            const { candidate, job } = appWithCandidate;
            if (stage === 'INTERVIEW') {
                // Create scheduled AI voice interview for candidate if not exists
                let interview = await prisma.interview.findFirst({
                    where: { applicationId: id, type: 'AI_VOICE' }
                });
                if (!interview) {
                    interview = await prisma.interview.create({
                        data: {
                            applicationId: id,
                            interviewerId: userId,
                            type: 'AI_VOICE',
                            scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
                            durationMins: 30,
                            location: 'Virtual AI Voice Portal',
                            meetingUrl: uuidv4(),
                            status: 'SCHEDULED'
                        }
                    });
                }
                await emailService.sendCandidateInterviewInvite(candidate.email, candidate.fullName, job.title, interview.meetingUrl || '');
            }
            else if (stage === 'REJECTED') {
                await emailService.sendCandidateRejection(candidate.email, candidate.fullName, job.title);
            }
        }
        // Broadcast real-time ATS update
        eventBus.emitAtsUpdate(app.jobId, { applicationId: app.id, stage: app.stage });
        res.json({ data: app, message: `Application manually moved to ${stage}` });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=application.controller.js.map