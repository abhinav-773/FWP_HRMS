import prisma from '../config/prisma';
import { v4 as uuidv4 } from 'uuid';
import emailService from './email.service';
export class InterviewService {
    async scheduleInterview(data) {
        const isAiInterview = data.interviewType === 'AI' || data.type === 'AI_VOICE';
        const meetingUrlUuid = uuidv4();
        const interview = await prisma.interview.create({
            data: {
                applicationId: data.applicationId,
                interviewerId: data.interviewerId,
                type: isAiInterview ? 'AI_VOICE' : (data.type || 'TECHNICAL'),
                scheduledAt: new Date(data.scheduledAt),
                durationMins: data.durationMins ? parseInt(data.durationMins, 10) : 60,
                location: isAiInterview ? 'Virtual AI Room' : data.location || 'Google Meet',
                meetingUrl: meetingUrlUuid, // Unique meeting link acting as candidate portal UUID
                status: 'SCHEDULED',
                interviewType: isAiInterview ? 'AI' : 'FACE_TO_FACE',
                meetingProvider: isAiInterview ? 'AI_ROOM' : data.meetingProvider || 'GOOGLE_MEET',
                interviewRounds: data.interviewRounds || (isAiInterview ? ['AI Voice Evaluation'] : ['Technical Round']),
                interviewerName: data.interviewerName || (isAiInterview ? 'HireMind AI Agent' : 'Recruiter'),
                interviewNotes: data.interviewNotes || '',
                interviewStatus: 'INTERVIEW_SCHEDULED'
            },
            include: {
                interviewer: { select: { id: true, fullName: true, email: true } },
                application: {
                    include: {
                        candidate: { select: { fullName: true, email: true } },
                        job: { select: { title: true } }
                    }
                }
            }
        });
        // Update application stage to INTERVIEW and interviewStatus to INTERVIEW_SCHEDULED
        await prisma.application.update({
            where: { id: data.applicationId },
            data: {
                stage: 'INTERVIEW',
                interviewStatus: 'INTERVIEW_SCHEDULED'
            }
        });
        // Send transactional invitation email
        try {
            if (isAiInterview) {
                await emailService.sendCandidateInterviewInvite(interview.application.candidate.email, interview.application.candidate.fullName, interview.application.job.title, interview.meetingUrl);
            }
            else {
                await emailService.sendCandidateF2FInvite(interview.application.candidate.email, interview.application.candidate.fullName, interview.application.job.title, interview.meetingUrl, interview.interviewRounds, interview.scheduledAt, interview.durationMins, interview.meetingProvider || 'GOOGLE_MEET', interview.interviewerName || 'Recruiter', interview.interviewNotes || '');
            }
        }
        catch (emailErr) {
            console.error('Failed to send interview invitation email:', emailErr);
        }
        return interview;
    }
    async getInterviews(query) {
        const where = {};
        if (query.interviewerId)
            where.interviewerId = query.interviewerId;
        if (query.applicationId)
            where.applicationId = query.applicationId;
        if (query.status)
            where.status = query.status;
        return await prisma.interview.findMany({
            where,
            include: {
                interviewer: { select: { id: true, fullName: true } },
                application: {
                    include: {
                        candidate: { select: { id: true, fullName: true, email: true } },
                        job: { select: { id: true, title: true } }
                    }
                }
            },
            orderBy: { scheduledAt: 'asc' }
        });
    }
    async updateInterview(id, data) {
        return await prisma.interview.update({
            where: { id },
            data: {
                type: data.type,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
                durationMins: data.durationMins ? parseInt(data.durationMins, 10) : undefined,
                location: data.location,
                status: data.status,
                feedback: data.feedback,
                rating: data.rating ? parseInt(data.rating, 10) : undefined
            }
        });
    }
    async deleteInterview(id) {
        return await prisma.interview.delete({ where: { id } });
    }
    async getInterviewByMeetingUrl(meetingUrl) {
        return await prisma.interview.findUnique({
            where: { meetingUrl },
            include: {
                application: {
                    include: {
                        candidate: { select: { fullName: true, email: true, skills: true } },
                        job: { select: { title: true, requirements: true } }
                    }
                }
            }
        });
    }
}
export default new InterviewService();
//# sourceMappingURL=interview.service.js.map