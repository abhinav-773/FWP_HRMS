import nodemailer from 'nodemailer';
import { logger } from '../config/logger';
export class EmailService {
    transporter = null;
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
        }
        else {
            logger.warn('⚠️ Email Service: SMTP credentials not fully configured in .env. Real emails will NOT be sent. Falling back to simulation mode.');
        }
    }
    async sendMail(to, subject, text) {
        if (this.transporter) {
            try {
                const from = process.env.SMTP_FROM || `"HRGPT Recruitment" <${process.env.SMTP_USER}>`;
                await this.transporter.sendMail({
                    from,
                    to,
                    subject,
                    text,
                });
                logger.info(`[EMAIL SERVICE] Real email sent to ${to} with subject "${subject}"`);
            }
            catch (err) {
                logger.error(`[EMAIL SERVICE] Failed to send real email to ${to}:`, err);
            }
        }
        else {
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
    async sendCandidateConfirmation(email, name, jobTitle) {
        const subject = `Application Received: ${jobTitle} at HRGPT`;
        const text = `Hi ${name},

Thank you for applying for the ${jobTitle} position at HRGPT! 
We have received your application and resume. Our autonomous AI recruitment engine is currently reviewing your qualifications against the job description.

We will get back to you shortly with the next steps.

Best regards,
HRGPT Recruitment Team`;
        await this.sendMail(email, subject, text);
    }
    async sendCandidateShortlist(email, name, jobTitle) {
        const subject = `Next Steps: Your application for ${jobTitle} at HRGPT`;
        const text = `Hi ${name},

Great news! Your profile has been shortlisted for the ${jobTitle} position at HRGPT. 
Our recruitment team is currently reviewing the AI insights from your resume and will reach out shortly to schedule the next evaluation steps.

Best regards,
HRGPT Recruitment Team`;
        await this.sendMail(email, subject, text);
    }
    async sendCandidateInterviewInvite(email, name, jobTitle, meetingUrl) {
        const subject = `Invitation: AI Voice Interview for ${jobTitle} at HRGPT`;
        const text = `Hi ${name},

Congratulations! You have been selected to move forward to the AI Interview stage for the ${jobTitle} position.

You can complete your automated AI Voice Interview at any time by clicking the link below:
http://localhost:5173/ai-interview/${meetingUrl}

Please ensure you are in a quiet room with a stable microphone connection before starting.

Best of luck!

Best regards,
HRGPT AI Recruitment Engine`;
        await this.sendMail(email, subject, text);
    }
    async sendCandidateF2FInvite(email, name, jobTitle, meetingUrl, rounds, scheduledAt, durationMins, provider, interviewerName, notes) {
        const formattedDate = new Date(scheduledAt).toLocaleString();
        const subject = `Interview Scheduled: ${jobTitle} at HRGPT`;
        const text = `Hi ${name},

We are excited to invite you to a Face-to-Face Interview for the ${jobTitle} position at HRGPT!

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
HRGPT Recruitment Team`;
        await this.sendMail(email, subject, text);
    }
    async sendCandidateRejection(email, name, jobTitle) {
        const subject = `Update on your application for ${jobTitle} at HRGPT`;
        const text = `Hi ${name},

Thank you for your interest in the ${jobTitle} role and for taking the time to apply.

After reviewing your resume against our current requirements, we regret to inform you that we will not be moving forward with your application at this time. We will keep your resume in our talent pool for future openings that match your skills.

We wish you all the best in your job search.

Best regards,
HRGPT Recruitment Team`;
        await this.sendMail(email, subject, text);
    }
    async sendRecruiterAlert(recruiterEmail, candidateName, jobTitle, score, stages) {
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
HRGPT Auto-Recruit Daemon`;
        await this.sendMail(recruiterEmail, subject, text);
    }
    async sendOnboardingCredentialsEmail(email, name, employeeId, tempPassword) {
        const subject = `Welcome to HRGPT — Your Employee Portal Credentials`;
        const text = `Hi ${name},

Congratulations on joining HRGPT! We are thrilled to welcome you to the team.

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
HRGPT Onboarding Team`;
        await this.sendMail(email, subject, text);
    }
}
export default new EmailService();
//# sourceMappingURL=email.service.js.map