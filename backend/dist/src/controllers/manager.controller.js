import prisma from '../config/prisma';
import { calculateProductivity, generatePerformanceSummary } from '../services/productivity.service';
import { eventBus } from '../services/eventBus';
export const getTeamDashboard = async (req, res, next) => {
    try {
        const user = req.user;
        const profile = await prisma.employeeProfile.findUnique({
            where: { userId: user.userId },
            include: { department: true }
        });
        if (!profile || !profile.departmentId) {
            return res.status(400).json({ error: 'Manager profile or department not found.' });
        }
        const members = await prisma.employeeProfile.findMany({
            where: { departmentId: profile.departmentId }
        });
        const activeTasks = await prisma.teamTask.count({
            where: { department: profile.department?.name, status: { in: ['PENDING', 'IN_PROGRESS'] } }
        });
        const pendingLeaves = await prisma.leaveRequest.count({
            where: { managerId: profile.id, status: 'PENDING' }
        });
        res.json({
            totalMembers: members.length,
            activeTasks,
            pendingLeaves
        });
    }
    catch (error) {
        next(error);
    }
};
export const createTeamTask = async (req, res, next) => {
    try {
        const user = req.user;
        const { title, description, priority, assignedToEmployeeId, dueDate } = req.body;
        const managerProfile = await prisma.employeeProfile.findUnique({
            where: { userId: user.userId },
            include: { department: true }
        });
        if (!managerProfile || !managerProfile.department)
            throw new Error('Manager profile or department missing.');
        const task = await prisma.teamTask.create({
            data: {
                title,
                description,
                priority,
                assignedToEmployeeId,
                assignedByManagerId: managerProfile.id,
                department: managerProfile.department.name,
                dueDate: new Date(dueDate)
            }
        });
        eventBus.emitTaskAssigned(assignedToEmployeeId, task);
        res.status(201).json({ success: true, data: task });
    }
    catch (error) {
        next(error);
    }
};
export const getTeamTasks = async (req, res, next) => {
    try {
        const user = req.user;
        const managerProfile = await prisma.employeeProfile.findUnique({
            where: { userId: user.userId },
            include: { department: true }
        });
        if (!managerProfile || !managerProfile.department)
            throw new Error('Manager profile or department missing.');
        const tasks = await prisma.teamTask.findMany({
            where: { department: managerProfile.department.name },
            include: { assignedTo: { include: { user: true } } }
        });
        res.json({ success: true, data: tasks });
    }
    catch (error) {
        next(error);
    }
};
export const getLeaveApprovals = async (req, res, next) => {
    try {
        const user = req.user;
        const managerProfile = await prisma.employeeProfile.findUnique({ where: { userId: user.userId } });
        if (!managerProfile)
            throw new Error('Manager profile missing');
        const requests = await prisma.leaveRequest.findMany({
            where: { managerId: managerProfile.id },
            include: { employee: { include: { user: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: requests });
    }
    catch (error) {
        next(error);
    }
};
export const approveLeave = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { status, managerRemarks } = req.body; // status: APPROVED or REJECTED
        const request = await prisma.leaveRequest.update({
            where: { id },
            data: { status, managerRemarks }
        });
        eventBus.emitLeaveApproved(request.employeeId, request);
        res.json({ success: true, data: request });
    }
    catch (error) {
        next(error);
    }
};
export const submitPerformanceReview = async (req, res, next) => {
    try {
        const user = req.user;
        const { employeeId, technicalRating, communicationRating, productivityRating, teamworkRating, strengths, weaknesses, managerRemarks, reviewPeriod } = req.body;
        const managerProfile = await prisma.employeeProfile.findUnique({ where: { userId: user.userId } });
        if (!managerProfile)
            throw new Error('Manager profile missing');
        const overallRating = (technicalRating + communicationRating + productivityRating + teamworkRating) / 4;
        const aiSummary = await generatePerformanceSummary({
            technicalRating, communicationRating, productivityRating, teamworkRating, strengths, weaknesses
        });
        const review = await prisma.performanceReview.create({
            data: {
                employeeId,
                reviewerId: managerProfile.id,
                reviewPeriod,
                technicalRating,
                communicationRating,
                productivityRating,
                teamworkRating,
                overallRating,
                strengths,
                weaknesses,
                managerRemarks,
                aiSummary
            }
        });
        eventBus.emitPerformanceReview(employeeId, review);
        res.status(201).json({ success: true, data: review });
    }
    catch (error) {
        next(error);
    }
};
export const getTeamAnalytics = async (req, res, next) => {
    try {
        const user = req.user;
        const managerProfile = await prisma.employeeProfile.findUnique({
            where: { userId: user.userId },
            include: { department: true }
        });
        if (!managerProfile || !managerProfile.department)
            throw new Error('Manager profile or department missing.');
        const analytics = await calculateProductivity(managerProfile.department.name);
        res.json({ success: true, data: analytics });
    }
    catch (error) {
        next(error);
    }
};
export const getTeamMembers = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user.employeeProfileId)
            throw new Error('Manager profile ID missing in request');
        const members = await prisma.employeeProfile.findMany({
            where: { managerId: user.employeeProfileId },
            include: { user: true, designation: true }
        });
        res.json({ success: true, data: members });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=manager.controller.js.map