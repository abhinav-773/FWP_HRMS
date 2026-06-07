import prisma from '../config/prisma';
import { eventBus } from './eventBus';
export class TaskService {
    async assignTask(managerUserId, data) {
        const managerProfile = await prisma.employeeProfile.findUnique({ where: { userId: managerUserId } });
        if (!managerProfile)
            throw new Error('Manager profile not found');
        const { title, description, priority, assignedToEmployeeId, dueDate, department } = data;
        const task = await prisma.teamTask.create({
            data: {
                title,
                description,
                priority: priority || 'MEDIUM',
                assignedToEmployeeId,
                assignedByManagerId: managerProfile.id,
                department: department || 'General',
                dueDate: new Date(dueDate),
                status: 'PENDING',
                progress: 0
            },
            include: {
                assignedTo: { include: { user: { select: { fullName: true, email: true } } } }
            }
        });
        // Real-time Event
        eventBus.emit('task:assigned', {
            employeeId: task.assignedTo.userId,
            task
        });
        return task;
    }
    async updateTaskProgress(userId, taskId, data) {
        const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
        if (!profile)
            throw new Error('Employee profile not found');
        const { status, progress } = data;
        const task = await prisma.teamTask.update({
            where: { id: taskId },
            data: {
                status: status || undefined,
                progress: progress !== undefined ? parseInt(progress, 10) : undefined
            },
            include: {
                assignedBy: { include: { user: { select: { fullName: true } } } }
            }
        });
        // If completed or updated, notify manager
        if (status === 'COMPLETED' || progress === 100) {
            eventBus.emit('task:completed', {
                managerId: task.assignedBy.userId,
                task
            });
        }
        return task;
    }
    async getMyTasks(userId) {
        const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
        if (!profile)
            throw new Error('Employee profile not found');
        return await prisma.teamTask.findMany({
            where: { assignedToEmployeeId: profile.id },
            include: {
                assignedBy: { include: { user: { select: { fullName: true } } } }
            },
            orderBy: { dueDate: 'asc' }
        });
    }
    async getTeamTasks(managerUserId) {
        const managerProfile = await prisma.employeeProfile.findUnique({ where: { userId: managerUserId } });
        if (!managerProfile)
            throw new Error('Manager profile not found');
        return await prisma.teamTask.findMany({
            where: { assignedByManagerId: managerProfile.id },
            include: {
                assignedTo: { include: { user: { select: { fullName: true, email: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
export default new TaskService();
//# sourceMappingURL=task.service.js.map