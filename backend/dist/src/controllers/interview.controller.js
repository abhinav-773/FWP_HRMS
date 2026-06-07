import interviewService from '../services/interview.service';
import prisma from '../config/prisma';
export const scheduleInterview = async (req, res) => {
    try {
        const data = { ...req.body };
        if (!data.interviewerId) {
            data.interviewerId = req.user.userId;
        }
        const interview = await interviewService.scheduleInterview(data);
        res.status(201).json({ data: interview, message: 'Interview scheduled successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getInterviews = async (req, res) => {
    try {
        const interviews = await interviewService.getInterviews(req.query);
        res.json({ data: interviews });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateInterview = async (req, res) => {
    try {
        const id = req.params.id;
        const interview = await interviewService.updateInterview(id, req.body);
        res.json({ data: interview, message: 'Interview updated' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const deleteInterview = async (req, res) => {
    try {
        const id = req.params.id;
        await interviewService.deleteInterview(id);
        res.json({ message: 'Interview deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getPublicInterview = async (req, res) => {
    try {
        const meetingUrl = req.params.meetingUrl;
        const interview = await interviewService.getInterviewByMeetingUrl(meetingUrl);
        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }
        res.json({ data: interview });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getManagerInterviews = async (req, res) => {
    try {
        const managerId = req.user.employeeProfileId;
        if (!managerId)
            return res.status(401).json({ error: 'Unauthorized' });
        const interviews = await prisma.interview.findMany({
            where: {
                interviewerId: req.user.userId,
                employeeId: { not: null }
            },
            include: {
                employee: {
                    include: {
                        user: {
                            select: { fullName: true, email: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: interviews });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const createManagerInterview = async (req, res) => {
    try {
        const { employeeId, title, type, meetingMode, date, time, notes } = req.body;
        const interviewerId = req.user.userId;
        const interview = await prisma.interview.create({
            data: {
                employeeId,
                interviewerId,
                title,
                interviewType: type,
                meetingProvider: meetingMode,
                date,
                time,
                notes,
                status: 'SCHEDULED',
                scheduledAt: new Date(`${date}T${time || '00:00'}:00Z`)
            }
        });
        res.status(201).json({ success: true, data: interview });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const sendInterviewLink = async (req, res) => {
    try {
        const { interviewId, employeeId, meetingLink } = req.body;
        const interview = await prisma.interview.update({
            where: { id: interviewId },
            data: { meetingUrl: meetingLink }
        });
        // Also send a notification to the employee
        const employee = await prisma.employeeProfile.findUnique({
            where: { id: employeeId },
            select: { userId: true }
        });
        if (employee) {
            await prisma.notification.create({
                data: {
                    userId: employee.userId,
                    title: 'Interview Link Received',
                    message: `You have an upcoming interview. Please join using this link: ${meetingLink}`,
                    type: 'SYSTEM',
                    link: meetingLink
                }
            });
        }
        res.json({ success: true, data: interview });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=interview.controller.js.map