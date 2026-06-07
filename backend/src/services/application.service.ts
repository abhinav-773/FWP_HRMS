import prisma from '../config/prisma';
import { Prisma, ApplicationStage } from '@prisma/client';
import aiIntegrationService from './ai.service';
import bcrypt from 'bcryptjs';
import emailService from './email.service';

export class ApplicationService {
  async applyForJob(jobId: string, candidateId: string, data: any) {
    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId,
        coverLetter: data.coverLetter,
        recruiterNotes: data.recruiterNotes,
        stage: 'APPLIED',
        activities: {
          create: {
            toStage: 'APPLIED',
            note: 'Application created',
            performedById: data.performedById
          }
        }
      },
      include: {
        job: true,
        candidate: true
      }
    });

    // Trigger AI evaluation asynchronously
    if (application.candidate.resumeUrl) {
      aiIntegrationService.evaluateApplication(
        application.id, 
        application.candidate.resumeUrl, 
        application.job.description
      ).catch(err => console.error("AI Evaluation background task failed:", err));
    }

    return application;
  }

  async getAllApplications(query: any) {
    const where: Prisma.ApplicationWhereInput = {};
    if (query.jobId) where.jobId = query.jobId;
    if (query.stage) where.stage = query.stage as ApplicationStage;
    if (query.candidateId) where.candidateId = query.candidateId;

    return await prisma.application.findMany({
      where,
      include: {
        job: { select: { id: true, title: true, department: true, skills: true, description: true } },
        candidate: { select: { id: true, fullName: true, email: true, phone: true, location: true, resumeUrl: true, skills: true, education: true, experience: true } },
        interviews: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateApplicationStage(id: string, stage: ApplicationStage, performedById: string, note?: string) {
    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) throw new Error('Application not found');

    const fromStage = application.stage;

    return await prisma.$transaction(async (tx) => {
      const updatedApp = await tx.application.update({
        where: { id },
        data: { stage }
      });

      await tx.applicationActivity.create({
        data: {
          applicationId: id,
          fromStage,
          toStage: stage,
          note,
          performedById
        }
      });

      // Automate transition to employee onboarding
      if (stage === 'HIRED') {
        const candidate = await tx.candidate.findUnique({
          where: { id: application.candidateId }
        });

        if (candidate) {
          // Check if User already exists
          let user = await tx.user.findUnique({ where: { email: candidate.email } });
          let tempPassword = '';
          if (!user) {
            console.log(`[ATS Lifecycle Trigger] Auto-creating User for hired candidate: ${candidate.email}`);
            tempPassword = Math.random().toString(36).slice(-8); // Generate random 8-char password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(tempPassword, salt);

            user = await tx.user.create({
              data: {
                email: candidate.email,
                fullName: candidate.fullName,
                password: hashedPassword,
                tempPassword: true,
                role: 'EMPLOYEE',
                status: 'PENDING'
              }
            });
          }

          // Check if EmployeeProfile already exists
          let profile = await tx.employeeProfile.findUnique({ where: { userId: user.id } });
          if (!profile) {
            console.log(`[ATS Lifecycle Trigger] Auto-creating EmployeeProfile for: ${candidate.email}`);
            let employeeId = '';
            let isUnique = false;
            while (!isUnique) {
              employeeId = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;
              const existing = await tx.employeeProfile.findUnique({ where: { employeeId } });
              if (!existing) {
                isUnique = true;
              }
            }

            profile = await tx.employeeProfile.create({
              data: {
                userId: user.id,
                employeeId,
                joinDate: new Date(),
                phone: candidate.phone
              }
            });

            // Trigger onboarding welcome workflows
            try {
              const { default: workflowService } = await import('./workflow.service');
              await workflowService.executeEvent('ON_BOARDING_STARTED', {
                userId: user.id,
                employeeProfileId: profile.id
              });

              // Send credentials email
              if (tempPassword) {
                await emailService.sendOnboardingCredentialsEmail(
                  user.email,
                  user.fullName,
                  employeeId,
                  tempPassword
                );
              }
            } catch (err: any) {
              console.error('[ATS Lifecycle Trigger] Onboarding workflow execution failed:', err.message);
            }
          }
        }
      }

      return updatedApp;
    });
  }

  async updateRecruiterNotes(id: string, notes: string) {
    return await prisma.application.update({
      where: { id },
      data: { recruiterNotes: notes }
    });
  }
}

export default new ApplicationService();
