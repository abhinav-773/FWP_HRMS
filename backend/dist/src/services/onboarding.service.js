import prisma from '../config/prisma';
import { OnboardingChecklistStatus, OnboardingTaskStatus, ITAssetStatus } from '@prisma/client';
export class OnboardingService {
    // Create / assign a new onboarding checklist with default tasks
    async createChecklist(employeeId, title, description, customTasks) {
        // Check if employee exists
        const employee = await prisma.employeeProfile.findUnique({
            where: { id: employeeId },
            include: { user: true }
        });
        if (!employee)
            throw new Error('Employee profile not found');
        return await prisma.$transaction(async (tx) => {
            const checklist = await tx.onboardingChecklist.create({
                data: {
                    employeeId,
                    title,
                    description,
                    status: OnboardingChecklistStatus.PENDING
                }
            });
            // Default task list if none provided
            const defaultTasks = [
                { title: 'Sign NDA Contract', description: 'Upload signed NDA file', documentRequired: true },
                { title: 'Identity Verification', description: 'Upload scan of ID/Passport', documentRequired: true },
                { title: 'IT Setup', description: 'Set up hardware and company emails', documentRequired: false },
                { title: 'Complete Welcome Orientation', description: 'Watch onboarding slides and video', documentRequired: false },
                { title: 'Meet with Manager', description: 'Schedule 1-on-1 intro sync', documentRequired: false }
            ];
            const tasksToCreate = customTasks && customTasks.length > 0 ? customTasks : defaultTasks;
            await tx.onboardingTask.createMany({
                data: tasksToCreate.map(t => ({
                    checklistId: checklist.id,
                    title: t.title,
                    description: t.description,
                    documentRequired: !!t.documentRequired,
                    status: OnboardingTaskStatus.PENDING
                }))
            });
            // Trigger automatic notification
            await tx.notification.create({
                data: {
                    userId: employee.userId,
                    title: 'Welcome to HRGPT! Onboarding Checklist Assigned',
                    message: `Your onboarding checklist "${title}" has been assigned. Please complete your tasks.`,
                    type: 'SYSTEM',
                    link: '/onboarding'
                }
            });
            return await tx.onboardingChecklist.findUnique({
                where: { id: checklist.id },
                include: { tasks: true }
            });
        });
    }
    // Get checklist for a specific employee
    async getEmployeeChecklist(employeeId) {
        return await prisma.onboardingChecklist.findFirst({
            where: { employeeId },
            include: {
                tasks: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
    }
    // Get all onboarding checklists for HR dashboard
    async getAllChecklists() {
        return await prisma.onboardingChecklist.findMany({
            include: {
                employee: {
                    include: {
                        user: { select: { fullName: true, email: true } },
                        department: true,
                        designation: true
                    }
                },
                tasks: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    // Update a single task (check off / upload document)
    async updateTaskStatus(taskId, status, documentUrl) {
        return await prisma.$transaction(async (tx) => {
            const task = await tx.onboardingTask.findUnique({
                where: { id: taskId },
                include: { checklist: { include: { employee: true } } }
            });
            if (!task)
                throw new Error('Onboarding task not found');
            const updatedTask = await tx.onboardingTask.update({
                where: { id: taskId },
                data: {
                    status,
                    ...(documentUrl && { documentUrl }),
                    completedAt: status === OnboardingTaskStatus.COMPLETED ? new Date() : null
                }
            });
            // Recalculate checklist status
            const checklistTasks = await tx.onboardingTask.findMany({
                where: { checklistId: task.checklistId }
            });
            const allCompleted = checklistTasks.every(t => t.status === OnboardingTaskStatus.COMPLETED);
            const anyCompleted = checklistTasks.some(t => t.status === OnboardingTaskStatus.COMPLETED);
            let newChecklistStatus = OnboardingChecklistStatus.PENDING;
            if (allCompleted) {
                newChecklistStatus = OnboardingChecklistStatus.COMPLETED;
            }
            else if (anyCompleted) {
                newChecklistStatus = OnboardingChecklistStatus.IN_PROGRESS;
            }
            await tx.onboardingChecklist.update({
                where: { id: task.checklistId },
                data: { status: newChecklistStatus }
            });
            return updatedTask;
        });
    }
    // Assign IT Asset
    async assignAsset(employeeId, assetName, assetType, serialNumber) {
        const employee = await prisma.employeeProfile.findUnique({
            where: { id: employeeId },
            include: { user: true }
        });
        if (!employee)
            throw new Error('Employee profile not found');
        return await prisma.$transaction(async (tx) => {
            const asset = await tx.iTAsset.create({
                data: {
                    employeeId,
                    assetName,
                    assetType,
                    serialNumber,
                    status: ITAssetStatus.ASSIGNED,
                    assignedDate: new Date()
                }
            });
            await tx.notification.create({
                data: {
                    userId: employee.userId,
                    title: 'IT Asset Assigned',
                    message: `A new ${assetType} (${assetName}) has been assigned to you.`,
                    type: 'SYSTEM'
                }
            });
            return asset;
        });
    }
    // Get assets for an employee
    async getEmployeeAssets(employeeId) {
        return await prisma.iTAsset.findMany({
            where: { employeeId }
        });
    }
    // Get all IT assets
    async getAllAssets() {
        return await prisma.iTAsset.findMany({
            include: {
                employee: {
                    include: {
                        user: { select: { fullName: true } }
                    }
                }
            }
        });
    }
    // Delete/release asset
    async releaseAsset(assetId) {
        return await prisma.iTAsset.update({
            where: { id: assetId },
            data: {
                status: ITAssetStatus.RETRIEVED,
                employeeId: null,
                assignedDate: null
            }
        });
    }
}
export default new OnboardingService();
//# sourceMappingURL=onboarding.service.js.map