import performanceService from '../services/performance.service';
import prisma from '../config/prisma';
export const createGoal = async (req, res) => {
    try {
        const { employeeId, title, description, targetDate } = req.body;
        const goal = await performanceService.createGoal(employeeId, title, description, targetDate);
        res.status(201).json({ data: goal, message: 'OKR Goal created successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getMyGoals = async (req, res) => {
    try {
        const userId = req.user.userId;
        const employee = await prisma.employeeProfile.findUnique({ where: { userId } });
        if (!employee)
            return res.status(404).json({ error: 'Employee profile not found' });
        const goals = await performanceService.getEmployeeGoals(employee.id);
        res.json({ data: goals });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getEmployeeGoals = async (req, res) => {
    try {
        const goals = await performanceService.getEmployeeGoals(req.params.employeeId);
        res.json({ data: goals });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateGoalProgress = async (req, res) => {
    try {
        const { progress, status } = req.body;
        const updated = await performanceService.updateGoalProgress(req.params.goalId, parseFloat(progress), status);
        res.json({ data: updated, message: 'OKR Goal progress updated' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const createReview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const manager = await prisma.employeeProfile.findUnique({ where: { userId } });
        if (!manager)
            return res.status(404).json({ error: 'Manager profile not found' });
        const { employeeId, reviewPeriod, rating, comments } = req.body;
        const review = await performanceService.createReview(employeeId, manager.id, reviewPeriod, parseFloat(rating), comments);
        res.status(201).json({ data: review, message: 'Manager Performance Review saved successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getMyReviews = async (req, res) => {
    try {
        const userId = req.user.userId;
        const employee = await prisma.employeeProfile.findUnique({ where: { userId } });
        if (!employee)
            return res.status(404).json({ error: 'Employee profile not found' });
        const reviews = await performanceService.getEmployeeReviews(employee.id);
        res.json({ data: reviews });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const requestFeedback = async (req, res) => {
    try {
        const userId = req.user.userId;
        const peer = await prisma.employeeProfile.findUnique({ where: { userId } });
        if (!peer)
            return res.status(404).json({ error: 'Peer profile not found' });
        const { employeeId, reviewPeriod, feedbackText, rating } = req.body;
        const feedback = await performanceService.requestFeedback(employeeId, peer.id, reviewPeriod, feedbackText, rating ? parseFloat(rating) : undefined);
        res.status(201).json({ data: feedback, message: 'Peer Feedback submitted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getMyFeedback = async (req, res) => {
    try {
        const userId = req.user.userId;
        const employee = await prisma.employeeProfile.findUnique({ where: { userId } });
        if (!employee)
            return res.status(404).json({ error: 'Employee profile not found' });
        const feedbacks = await performanceService.getEmployeeFeedback(employee.id);
        res.json({ data: feedbacks });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const generateAISummary = async (req, res) => {
    try {
        const { employeeId, reviewPeriod } = req.body;
        const summary = await performanceService.generateAISummary(employeeId, reviewPeriod);
        res.json({ data: summary });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=performance.controller.js.map