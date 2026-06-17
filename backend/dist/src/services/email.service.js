import nodemailer from 'nodemailer';
import { logger } from '../config/logger';
// Use FRONTEND_URL for email links, fallback to localhost for dev
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
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
                const from = process.env.SMTP_FROM || `"HireMind Recruitment" <${process.env.SMTP_USER}>`;
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
        const subject = `Application Received: ${jobTitle} at HireMind`;
        const text = `Hi ${name},

Thank you for applying for the ${jobTitle} position at HireMind! 
We have received your application and resume. Our autonomous AI recruitment engine is currently reviewing your qualifications against the job description.

We will get back to you shortly with the next steps.

Best regards,
HireMind Recruitment Team`;
        await this.sendMail(email, subject, text);
    }
    async sendCandidateShortlist(email, name, jobTitle) {
        const subject = `Next Steps: Your application for ${jobTitle} at HireMind`;
        const text = `Hi ${name},

Great news! Your profile has been shortlisted for the ${jobTitle} position at HireMind. 
Our recruitment team is currently reviewing the AI insights from your resume and will reach out shortly to schedule the next evaluation steps.

Best regards,
HireMind Recruitment Team`;
        await this.sendMail(email, subject, text);
    }
    async sendCandidateInterviewInvite(email, name, jobTitle, meetingUrl) {
        const subject = `Invitation: AI Voice Interview for ${jobTitle} at HireMind`;
        const text = `Hi ${name},

Congratulations! You have been selected to move forward to the AI Interview stage for the ${jobTitle} position.

You can complete your automated AI Voice Interview at any time by clicking the link below:
${FRONTEND_URL}/ai-interview/${meetingUrl}

Please ensure you are in a quiet room with a stable microphone connection before starting.

Best of luck!

Best regards,
HireMind AI Recruitment Engine`;
        await this.sendMail(email, subject, text);
    }
    async sendCandidateF2FInvite(email, name, jobTitle, meetingUrl, rounds, scheduledAt, durationMins, provider, interviewerName, notes) {
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
${FRONTEND_URL}/ai-interview/${meetingUrl}

Alternatively, you can join the meeting directly at the scheduled time:
${meetingUrl}

We wish you the best of luck with your interview!

Best regards,
HireMind Recruitment Team`;
        await this.sendMail(email, subject, text);
    }
    async sendCandidateRejection(email, name, jobTitle) {
        const subject = `Update on your application for ${jobTitle} at HireMind`;
        const text = `Hi ${name},

Thank you for your interest in the ${jobTitle} role and for taking the time to apply.

After reviewing your resume against our current requirements, we regret to inform you that we will not be moving forward with your application at this time. We will keep your resume in our talent pool for future openings that match your skills.

We wish you all the best in your job search.

Best regards,
HireMind Recruitment Team`;
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
${FRONTEND_URL}/hr/pipeline

Best regards,
HireMind Auto-Recruit Daemon`;
        await this.sendMail(recruiterEmail, subject, text);
    }
    async sendOnboardingCredentialsEmail(email, name, employeeId, tempPassword) {
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

Employer Portal Link: ${FRONTEND_URL}/login

Please note: You will be required to change this temporary password upon your first login.

If you have any questions, please reach out to HR.

Best regards,
HireMind Onboarding Team`;
        await this.sendMail(email, subject, text);
    }
    async sendDemoRequestNotification(adminEmail, name, company, message) {
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
    // --- NEW CANDIDATE EMAILS ---
    async sendCandidateOffer(email, name, jobTitle, offerUrl) {
        const subject = `Congratulations! Offer Extended for ${jobTitle}`;
        const text = `Hi ${name},

We are thrilled to extend you an offer for the ${jobTitle} position at HireMind!

You can view your offer details and accept the offer here:
${FRONTEND_URL}/offer/${offerUrl}

We are excited to welcome you to the team.

Best regards,
HireMind Recruitment Team`;
        await this.sendMail(email, subject, text);
    }
    async sendCandidateHired(email, name, jobTitle) {
        const subject = `Welcome to HireMind, ${name}!`;
        const text = `Hi ${name},

Congratulations on accepting the offer for ${jobTitle}! We are excited to have you onboard.

You will soon receive an email with your onboarding portal credentials.

Best regards,
HireMind Recruitment Team`;
        await this.sendMail(email, subject, text);
    }
    // --- NEW EMPLOYEE EMAILS ---
    async sendPasswordReset(email, name, resetToken) {
        const subject = `Password Reset Request`;
        const text = `Hi ${name},

You requested to reset your password. Please click the link below to set a new password:
${FRONTEND_URL}/reset-password?token=${resetToken}

If you did not request this, please ignore this email.

Best regards,
HireMind IT Support`;
        await this.sendMail(email, subject, text);
    }
    async sendLeaveApproval(email, name, leaveType, startDate, endDate) {
        const subject = `Leave Request Approved: ${leaveType}`;
        const text = `Hi ${name},

Your leave request for ${leaveType} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} has been APPROVED.

Enjoy your time off!

Best regards,
HireMind Automated System`;
        await this.sendMail(email, subject, text);
    }
    async sendLeaveRejection(email, name, leaveType, startDate, endDate, reason) {
        const subject = `Leave Request Update: ${leaveType}`;
        const text = `Hi ${name},

Your leave request for ${leaveType} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} has been REJECTED.

Manager Remarks: ${reason || 'No remarks provided.'}

Best regards,
HireMind Automated System`;
        await this.sendMail(email, subject, text);
    }
    async sendTaskAssignment(email, name, taskTitle, dueDate) {
        const subject = `New Task Assigned: ${taskTitle}`;
        const text = `Hi ${name},

A new task has been assigned to you:
Task: ${taskTitle}
Due Date: ${new Date(dueDate).toLocaleDateString()}

Please log in to your employee portal to view details.
${FRONTEND_URL}/dashboard

Best regards,
HireMind Automated System`;
        await this.sendMail(email, subject, text);
    }
    // --- NEW HR EMAILS ---
    async sendCandidateInterviewReady(hrEmail, candidateName, jobTitle, analysisUrl) {
        const subject = `AI Interview Completed: ${candidateName} for ${jobTitle}`;
        const text = `Hello Recruiter,

Candidate ${candidateName} has completed their AI Voice Interview for the ${jobTitle} role.

The AI transcription and analysis report is ready for your review:
${FRONTEND_URL}/hr/interviews/${analysisUrl}

Best regards,
HireMind Auto-Recruit Daemon`;
        await this.sendMail(hrEmail, subject, text);
    }
    async sendCandidateHiredAlert(hrEmail, candidateName, jobTitle) {
        const subject = `Candidate Hired: ${candidateName}`;
        const text = `Hello Recruiter,

Candidate ${candidateName} has officially accepted the offer for the ${jobTitle} position.

The candidate has been moved to the HIRED stage. You can now initiate the onboarding process.

Best regards,
HireMind Auto-Recruit Daemon`;
        await this.sendMail(hrEmail, subject, text);
    }
    // --- NEW MANAGER EMAILS ---
    async sendLeaveApprovalRequest(managerEmail, managerName, employeeName, leaveType, startDate, endDate) {
        const subject = `Leave Approval Required: ${employeeName}`;
        const text = `Hi ${managerName},

${employeeName} has requested ${leaveType} leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.

Please log in to your manager portal to approve or reject the request:
${FRONTEND_URL}/manager/dashboard

Best regards,
HireMind Automated System`;
        await this.sendMail(managerEmail, subject, text);
    }
    async sendTaskCompletionAlert(managerEmail, managerName, employeeName, taskTitle) {
        const subject = `Task Completed by ${employeeName}: ${taskTitle}`;
        const text = `Hi ${managerName},

${employeeName} has marked the following task as COMPLETED:
${taskTitle}

You can review the task details in your dashboard:
${FRONTEND_URL}/manager/dashboard

Best regards,
HireMind Automated System`;
        await this.sendMail(managerEmail, subject, text);
    }
    async sendInterviewReminder(interviewerEmail, interviewerName, candidateName, scheduledAt, meetingUrl) {
        const subject = `Interview Reminder: ${candidateName}`;
        const text = `Hi ${interviewerName},

This is a reminder for your upcoming interview with ${candidateName}.

Scheduled Time: ${new Date(scheduledAt).toLocaleString()}
Meeting Link: ${meetingUrl}

Please be on time.

Best regards,
HireMind Automated System`;
        await this.sendMail(interviewerEmail, subject, text);
    }
}
export default new EmailService();
//# sourceMappingURL=email.service.js.map