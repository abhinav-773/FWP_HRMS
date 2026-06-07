import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

export class EmailService {
  private transporter: any = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10),
        secure: parseInt(port, 10) === 465, // true for 465, false for 587
        auth: {
          user,
          pass,
        },
      });
      logger.info('✅ Email Service: Real SMTP mailer initialized successfully.');
    } else {
      logger.warn('⚠️ Email Service: SMTP credentials not fully configured in .env. Real emails will NOT be sent. Falling back to simulation mode.');
    }
  }

  private async sendMail(to: string, subject: string, text: string) {
    if (this.transporter) {
      try {
        const from = process.env.SMTP_FROM || `"HireMind Recruitment" <${process.env.SMTP_USER}>`;
        await this.transporter.sendMail({
          from,
          to,
          subject,
          text,
        });
        logger.info(`[EMAIL SERVICE] Real email sent to ${to} with subject "${subject}"`);
      } catch (err: any) {
        logger.error(`[EMAIL SERVICE] Failed to send real email to ${to}:`, err);
      }
    } else {
      logger.info(`
[EMAIL OUTBOX - SIMULATION] (SMTP not configured in .env)
-----------------------------------------
To: ${to}
Subject: ${subject}
-----------------------------------------
${text}
-----------------------------------------
`);
    }
  }

  async sendCandidateConfirmation(email: string, name: string, jobTitle: string) {
    const subject = `Application Received: ${jobTitle} at HireMind`;
    const text = `Hi ${name},

Thank you for applying for the ${jobTitle} position at HireMind! 
We have received your application and resume. Our autonomous AI recruitment engine is currently reviewing your qualifications against the job description.

We will get back to you shortly with the next steps.

Best regards,
HireMind Recruitment Team`;

    await this.sendMail(email, subject, text);
  }

  async sendCandidateShortlist(email: string, name: string, jobTitle: string) {
    const subject = `Next Steps: Your application for ${jobTitle} at HireMind`;
    const text = `Hi ${name},

Great news! Your profile has been shortlisted for the ${jobTitle} position at HireMind. 
Our recruitment team is currently reviewing the AI insights from your resume and will reach out shortly to schedule the next evaluation steps.

Best regards,
HireMind Recruitment Team`;

    await this.sendMail(email, subject, text);
  }

  async sendCandidateInterviewInvite(email: string, name: string, jobTitle: string, meetingUrl: string) {
    const subject = `Invitation: AI Voice Interview for ${jobTitle} at HireMind`;
    const text = `Hi ${name},

Congratulations! You have been selected to move forward to the AI Interview stage for the ${jobTitle} position.

You can complete your automated AI Voice Interview at any time by clicking the link below:
http://localhost:5173/ai-interview/${meetingUrl}

Please ensure you are in a quiet room with a stable microphone connection before starting.

Best of luck!

Best regards,
HireMind AI Recruitment Engine`;

    await this.sendMail(email, subject, text);
  }

  async sendCandidateF2FInvite(
    email: string,
    name: string,
    jobTitle: string,
    meetingUrl: string,
    rounds: string[],
    scheduledAt: string | Date,
    durationMins: number,
    provider: string,
    interviewerName: string,
    notes?: string
  ) {
    const formattedDate = new Date(scheduledAt).toLocaleString();
    const subject = `Interview Scheduled: ${jobTitle} at HireMind`;
    const text = `Hi ${name},

We are excited to invite you to a Face-to-Face Interview for the ${jobTitle} position at HireMind!

Details of your upcoming interview session:
- Rounds: ${rounds.join(', ')}
- Date & Time: ${formattedDate}
- Duration: ${durationMins} minutes
- Mode: Face-to-Face via ${provider}
- Interviewer: ${interviewerName}
${notes ? `- Instructions: ${notes}` : ''}

You can access your Candidate Interview Dashboard containing the schedule and join link here:
http://localhost:5173/ai-interview/${meetingUrl}

Alternatively, you can join the meeting directly at the scheduled time:
${meetingUrl}

We wish you the best of luck with your interview!

Best regards,
HireMind Recruitment Team`;

    await this.sendMail(email, subject, text);
  }

  async sendCandidateRejection(email: string, name: string, jobTitle: string) {
    const subject = `Update on your application for ${jobTitle} at HireMind`;
    const text = `Hi ${name},

Thank you for your interest in the ${jobTitle} role and for taking the time to apply.

After reviewing your resume against our current requirements, we regret to inform you that we will not be moving forward with your application at this time. We will keep your resume in our talent pool for future openings that match your skills.

We wish you all the best in your job search.

Best regards,
HireMind Recruitment Team`;

    await this.sendMail(email, subject, text);
  }

  async sendRecruiterAlert(recruiterEmail: string, candidateName: string, jobTitle: string, score: number, stages: string) {
    const subject = `🚨 HIGH-QUALITY CANDIDATE ALERT: ${candidateName} (${score}% AI Match)`;
    const text = `Hello Recruiter,

A new candidate has applied directly through the Careers Portal and scored exceptionally well:

Candidate: ${candidateName}
Role: ${jobTitle}
AI Match Score: ${score}%
Stage Auto-Assignment: ${stages}

The candidate has been automatically moved to the ${stages} stage and is ready for your review or scheduling.

Check the ATS Pipeline board to view candidate insights:
http://localhost:5173/hr/pipeline

Best regards,
HireMind Auto-Recruit Daemon`;

    await this.sendMail(recruiterEmail, subject, text);
  }

  async sendOnboardingCredentialsEmail(email: string, name: string, employeeId: string, tempPassword: string) {
    const subject = `Welcome to HireMind — Your Employee Portal Credentials`;
    const text = `Hi ${name},

Congratulations on joining HireMind! We are thrilled to welcome you to the team.

Your Employee Onboarding Portal account has been created. Please log in to complete your onboarding tasks and upload the required documents.

Login Credentials:
-----------------------------------------
Employee ID: ${employeeId}
Username (Email): ${email}
Temporary Password: ${tempPassword}
-----------------------------------------

Employer Portal Link: http://localhost:5173/employee/onboarding

Please note: You will be required to change this temporary password upon your first login.

If you have any questions, please reach out to HR.

Best regards,
HireMind Onboarding Team`;

    await this.sendMail(email, subject, text);
  }

  async sendDemoRequestNotification(adminEmail: string, name: string, company: string, message: string) {
    const subject = `New Enterprise Demo Request: ${company}`;
    const text = `Hello Admin,

A new Enterprise Demo Request has been submitted via the HireMind Landing Page:

Name: ${name}
Company: ${company}
Message: ${message || 'No message provided'}

Please log in to the admin dashboard or contact them directly to schedule the demo.

Best regards,
HireMind Automated System`;

    await this.sendMail(adminEmail, subject, text);
  }
}

export default new EmailService();
