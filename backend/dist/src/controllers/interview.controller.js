import interviewService from '../services/interview.service';
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
//# sourceMappingURL=interview.controller.js.map