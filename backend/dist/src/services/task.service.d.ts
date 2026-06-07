export declare class TaskService {
    assignTask(managerUserId: string, data: any): Promise<{
        assignedTo: {
            user: {
                fullName: string;
                email: string;
            };
        } & {
            id: string;
            userId: string;
            employeeId: string;
            departmentId: string | null;
            designationId: string | null;
            managerId: string | null;
            joinDate: Date;
            salary: number | null;
            phone: string | null;
            address: string | null;
            profilePhoto: string | null;
            onboardingProgress: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        status: import(".prisma/client").$Enums.TeamTaskStatus;
        description: string | null;
        title: string;
        progress: number;
        dueDate: Date;
        priority: string;
        assignedToEmployeeId: string;
        assignedByManagerId: string;
    }>;
    updateTaskProgress(userId: string, taskId: string, data: any): Promise<{
        assignedBy: {
            user: {
                fullName: string;
            };
        } & {
            id: string;
            userId: string;
            employeeId: string;
            departmentId: string | null;
            designationId: string | null;
            managerId: string | null;
            joinDate: Date;
            salary: number | null;
            phone: string | null;
            address: string | null;
            profilePhoto: string | null;
            onboardingProgress: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        status: import(".prisma/client").$Enums.TeamTaskStatus;
        description: string | null;
        title: string;
        progress: number;
        dueDate: Date;
        priority: string;
        assignedToEmployeeId: string;
        assignedByManagerId: string;
    }>;
    getMyTasks(userId: string): Promise<({
        assignedBy: {
            user: {
                fullName: string;
            };
        } & {
            id: string;
            userId: string;
            employeeId: string;
            departmentId: string | null;
            designationId: string | null;
            managerId: string | null;
            joinDate: Date;
            salary: number | null;
            phone: string | null;
            address: string | null;
            profilePhoto: string | null;
            onboardingProgress: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        status: import(".prisma/client").$Enums.TeamTaskStatus;
        description: string | null;
        title: string;
        progress: number;
        dueDate: Date;
        priority: string;
        assignedToEmployeeId: string;
        assignedByManagerId: string;
    })[]>;
    getTeamTasks(managerUserId: string): Promise<({
        assignedTo: {
            user: {
                fullName: string;
                email: string;
            };
        } & {
            id: string;
            userId: string;
            employeeId: string;
            departmentId: string | null;
            designationId: string | null;
            managerId: string | null;
            joinDate: Date;
            salary: number | null;
            phone: string | null;
            address: string | null;
            profilePhoto: string | null;
            onboardingProgress: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        status: import(".prisma/client").$Enums.TeamTaskStatus;
        description: string | null;
        title: string;
        progress: number;
        dueDate: Date;
        priority: string;
        assignedToEmployeeId: string;
        assignedByManagerId: string;
    })[]>;
}
declare const _default: TaskService;
export default _default;
//# sourceMappingURL=task.service.d.ts.map