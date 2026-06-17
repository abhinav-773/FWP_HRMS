import type { Request, Response } from 'express';
import applicationService from '../services/application.service';
import { ApplicationStage } from '@prisma/client';
import { eventBus } from '../services/eventBus';
import screeningQueueService from '../services/screeningQueue.service';
import emailService from '../services/email.service';
import prisma from '../config/prisma';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import employeeBootstrapService from '../services/employeeBootstrap.service.js';

export const applyForJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { jobId, candidateId, coverLetter, recruiterNotes } = req.body;
    const app = await applicationService.applyForJob(jobId, candidateId, { coverLetter, recruiterNotes, performedById: userId });
    res.status(201).json({ data: app, message: 'Application submitted successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Candidate has already applied for this job' });
    res.status(500).json({ error: error.message });
  }
};

export const getApplications = async (req: Request, res: Response) => {
  try {
    const apps = await applicationService.getAllApplications(req.query);
    res.json({ data: apps });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.userId;
    const { stage, note } = req.body;

    if (!Object.values(ApplicationStage).includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }

    const app = await applicationService.updateApplicationStage(id, stage, userId, note);
    
    // Employee Generation Automation
    if (stage === 'HIRED') {
      const appWithCandidate = await prisma.application.findUnique({
        where: { id },
        include: { candidate: true, job: true }
      });
      if (appWithCandidate) {
        await automateEmployeeCreation(appWithCandidate.candidate, appWithCandidate.job);
      }
    }

    // Broadcast real-time ATS update
    eventBus.emitAtsUpdate(app.jobId, { applicationId: app.id, stage: app.stage });

    res.json({ data: app, message: `Application moved to ${stage}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateNotes = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { notes } = req.body;
    const app = await applicationService.updateRecruiterNotes(id, notes);
    res.json({ data: app, message: 'Notes updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const retriggerAi = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const overrideDecision = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.userId;
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
      } else if (stage === 'REJECTED') {
        await emailService.sendCandidateRejection(candidate.email, candidate.fullName, job.title);
      } else if (stage === 'HIRED') {
        await automateEmployeeCreation(candidate, job);
      }
    }

    // Broadcast real-time ATS update
    eventBus.emitAtsUpdate(app.jobId, { applicationId: app.id, stage: app.stage });

    res.json({ data: app, message: `Application manually moved to ${stage}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

async function automateEmployeeCreation(candidate: any, job: any) {
  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email: candidate.email } });
    const tempPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: candidate.email,
          fullName: candidate.fullName,
          password: hashedPassword,
          tempPassword: true,
          role: 'EMPLOYEE'
        }
      });
    } else {
      // If user exists, just update their role to EMPLOYEE if they weren't
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'EMPLOYEE' }
      });
    }

    // Check if EmployeeProfile already exists
    let profile = await prisma.employeeProfile.findUnique({ where: { userId: user.id } });
    let employeeId = '';
    
    if (!profile) {
      employeeId = `EMP-${Math.floor(Math.random() * 90000) + 10000}`;
      profile = await prisma.employeeProfile.create({
        data: {
          userId: user.id,
          employeeId,
          departmentId: job.departmentId,
          salary: job.salaryMin || 60000,
        }
      });
    } else {
      employeeId = profile.employeeId;
    }

    // Initialize Payroll, Performance, and Onboarding Checklist using Bootstrap Service
    await employeeBootstrapService.initializeHRRecords(profile.id);

    // Send email with credentials
    await emailService.sendOnboardingCredentialsEmail(candidate.email, candidate.fullName, employeeId, tempPassword);
  } catch (error) {
    console.error('Error automating employee creation:', error);
  }
}
