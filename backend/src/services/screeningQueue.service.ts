import prisma from '../config/prisma';
import { ResumeParserService } from './resumeParser.service';
import { AiRankingService } from './aiRanking.service';
import { eventBus } from './eventBus';
import emailService from './email.service';
import notificationService from './notification.service';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ApplicationStage, InterviewType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface QueueItem {
  applicationId: string;
  retries: number;
}

export class ScreeningQueueService {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private auditLogPath = path.join(__dirname, '../../uploads/logs/ai_recruitment_audit.log');

  constructor() {
    // Ensure logs folder exists
    const logsDir = path.dirname(this.auditLogPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  private writeAuditLog(message: string) {
    const logMessage = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(this.auditLogPath, logMessage);
  }

  /**
   * Add a new application to the background processing queue
   */
  queueApplication(applicationId: string) {
    this.writeAuditLog(`Queueing application: ${applicationId}`);
    this.queue.push({ applicationId, retries: 0 });
    this.processQueue();
  }

  /**
   * Start processing items in the queue
   */
  private async processQueue() {
    if (this.isProcessing) return;
    if (this.queue.length === 0) return;

    this.isProcessing = true;
    const item = this.queue.shift()!;

    try {
      this.writeAuditLog(`Starting processing for application ID: ${item.applicationId}`);
      await this.processApplication(item.applicationId);
      this.writeAuditLog(`Successfully completed processing for application ID: ${item.applicationId}`);
    } catch (err: any) {
      console.error(`[Screening Queue] Processing failed for application ${item.applicationId}:`, err);
      this.writeAuditLog(`ERROR for ${item.applicationId}: ${err.message || err}`);
      
      if (item.retries < 3) {
        item.retries += 1;
        this.writeAuditLog(`Re-queueing ${item.applicationId} (Attempt ${item.retries + 1}/4)`);
        this.queue.push(item);
      } else {
        this.writeAuditLog(`Max retries reached. Marking application ${item.applicationId} as failed.`);
        try {
          await prisma.application.update({
            where: { id: item.applicationId },
            data: { 
              aiScore: 0,
              overallAIScore: 0,
              aiInsights: `AI Evaluation failed: ${err.stack || err.message || 'Unknown processing error'}` 
            }
          });
        } catch (dbErr) {
          console.error("Failed to update status of failed application in DB:", dbErr);
        }
      }
    } finally {
      this.isProcessing = false;
      // Loop to next item
      setTimeout(() => this.processQueue(), 500);
    }
  }

  private async processApplication(applicationId: string) {
    // 1. Fetch Application from DB
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        job: {
          include: {
            postedBy: { select: { id: true, email: true, fullName: true } }
          }
        }
      }
    });

    if (!application) {
      throw new Error(`Application ${applicationId} not found in database.`);
    }

    const { candidate, job } = application;
    if (!candidate.resumeUrl) {
      throw new Error(`Candidate ${candidate.fullName} has no uploaded resume.`);
    }

    let resumePath = candidate.resumeUrl;
    const isRemote = resumePath.startsWith('http://') || resumePath.startsWith('https://');

    if (!isRemote) {
      // The DB stores local paths as '/uploads/resumes/file.pdf'.
      // We must strip the leading slash and resolve relative to process.cwd() or __dirname
      const cleanUrl = candidate.resumeUrl.replace(/^[\/\\]+/, '');
      resumePath = path.resolve(__dirname, '../../', cleanUrl);
      if (!fs.existsSync(resumePath)) {
        throw new Error(`Resume file not found at path: ${resumePath}`);
      }
    }

    // Determine mimeType
    const cleanResumePath = resumePath.split('?')[0] || resumePath;
    const ext = path.extname(cleanResumePath).toLowerCase();
    const mimeType = ext === '.pdf' ? 'application/pdf' : (ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain');

    // 2. Resume Parsing (skills, experience, education, certifications, projects)
    this.writeAuditLog(`Extracting text from resume file for candidate: ${candidate.fullName}`);
    const rawText = await ResumeParserService.extractTextFromFile(resumePath, mimeType);

    this.writeAuditLog(`Extracting structured details via LLM/Regex...`);
    const structuredData = await ResumeParserService.extractStructuredData(rawText);

    // 3. Update candidate profile with extracted skills, experience, education, etc.
    const mergedSkills = Array.from(new Set([...(candidate.skills || []), ...(structuredData.skills || [])]));
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        skills: mergedSkills,
        experience: structuredData.experience || candidate.experience || 0,
        education: structuredData.education || candidate.education || null,
        notes: structuredData.projects || candidate.notes || null
      }
    });

    // 4. VectorDB embedding step removed — AI scoring is now cloud-based via Gemini
    this.writeAuditLog(`Skipping local embedding — using cloud AI scoring...`);

    // 5. Run Match & Scores via AiRankingService
    this.writeAuditLog(`Evaluating matching scores against job posting...`);
    const jobText = `${job.title} ${job.description || ''} ${job.requirements || ''} ${job.skills ? job.skills.join(', ') : ''}`;
    const evaluation = await AiRankingService.rankCandidate(candidate.id, rawText, jobText, mergedSkills, job.id);

    // 6. Automatically transition stages based on Overall Match Score
    const score = evaluation.score;
    let nextStage: ApplicationStage = 'APPLIED';
    
    if (score >= 80) {
      nextStage = 'INTERVIEW';
    } else if (score >= 60) {
      nextStage = 'SCREENING';
    } else {
      nextStage = 'REJECTED';
    }

    this.writeAuditLog(`AI Evaluated Candidate: ${candidate.fullName}. Score: ${score}%. Promoting stage to: ${nextStage}.`);

    // Parse subscores and detailed insights from evaluation
    let semanticScore = null;
    let technicalScore = null;
    let experienceScore = null;
    let educationScore = null;
    let overallAIScore = score;
    let aiStrengths: string[] = [];
    let aiWeaknesses: string[] = [];
    let aiRecommendation = null;

    try {
      const evalData = JSON.parse(evaluation.insights);
      semanticScore = evalData.semanticScore ?? null;
      technicalScore = evalData.technicalScore ?? null;
      experienceScore = evalData.experienceScore ?? null;
      educationScore = evalData.educationScore ?? null;
      overallAIScore = evalData.overallScore ?? score;
      aiStrengths = evalData.strengths ?? [];
      aiWeaknesses = evalData.weaknesses ?? [];
      aiRecommendation = evalData.recommendation ?? null;
    } catch (parseErr) {
      console.error("[Screening Queue] Failed to parse evaluation insights JSON:", parseErr);
    }

    // Perform database transaction to update Application and log ApplicationActivity
    const fromStage = application.stage;
    const updatedApp = await prisma.$transaction(async (tx) => {
      const appUpdate = await tx.application.update({
        where: { id: applicationId },
        data: {
          aiScore: score,
          aiInsights: evaluation.insights,
          stage: nextStage,
          semanticScore,
          technicalScore,
          experienceScore,
          educationScore,
          overallAIScore,
          aiStrengths,
          aiWeaknesses,
          aiRecommendation
        }
      });

      await tx.applicationActivity.create({
        data: {
          applicationId,
          fromStage,
          toStage: nextStage,
          note: `AI Autonomous Screening Completed. Score: ${score}%. Recommendation: ${nextStage}`,
          performedById: job.postedById // perform on behalf of job creator
        }
      });

      return appUpdate;
    });

    // 7. Handle Interview eligibility & scheduling invite
    let meetingUrl = '';
    if (nextStage === 'INTERVIEW') {
      this.writeAuditLog(`Generating AI Voice Interview eligibility link for candidate...`);
      
      // Auto-create a scheduled AI voice interview record in the database
      const interview = await prisma.interview.create({
        data: {
          applicationId,
          interviewerId: job.postedById,
          type: 'AI_VOICE',
          scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // default to 48 hours out
          durationMins: 30,
          location: 'Virtual AI Voice Portal',
          meetingUrl: uuidv4(),
          status: 'SCHEDULED'
        }
      });

      meetingUrl = interview.meetingUrl || '';
      
      // Notification for recruiter dashboard
      await notificationService.sendNotification(
        job.postedById,
        'High-Quality Candidate Alert 🚀',
        `${candidate.fullName} matched with ${score}% overall match. Automatically moved to INTERVIEW stage.`,
        'SYSTEM',
        `/hr/pipeline`
      );

      // Email notifications to recruiter & candidate
      await emailService.sendRecruiterAlert(job.postedBy.email, candidate.fullName, job.title, score, 'INTERVIEW');
      await emailService.sendCandidateInterviewInvite(candidate.email, candidate.fullName, job.title, meetingUrl);
    } else if (nextStage === 'SCREENING') {
      // Send candidate shortlist alert & email
      await emailService.sendCandidateShortlist(candidate.email, candidate.fullName, job.title);
      await notificationService.sendNotification(
        job.postedById,
        'Candidate Screen Ready 📋',
        `${candidate.fullName} applied and scored ${score}%. Moved to SCREENING.`,
        'SYSTEM',
        `/hr/pipeline`
      );
    } else if (nextStage === 'REJECTED') {
      // Send candidate rejection email
      await emailService.sendCandidateRejection(candidate.email, candidate.fullName, job.title);
    }

    // Always send candidate confirmation email immediately when process starts/finishes
    await emailService.sendCandidateConfirmation(candidate.email, candidate.fullName, job.title);

    // 8. Broadcast real-time update to the frontend board via socket/eventBus
    eventBus.emitAtsUpdate(job.id, {
      applicationId: updatedApp.id,
      stage: updatedApp.stage,
      aiScore: updatedApp.aiScore,
      aiInsights: updatedApp.aiInsights
    });

    this.writeAuditLog(`Fired real-time websocket sync for job: ${job.id}`);
  }
}

export default new ScreeningQueueService();
