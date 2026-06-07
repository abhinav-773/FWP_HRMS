export declare class LeaveService {
    applyLeave(userId: string, data: any): Promise<{
        id: string;
        employeeId: string;
        managerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.LeaveStatus;
        type: import(".prisma/client").$Enums.LeaveType;
        startDate: Date;
        endDate: Date;
        reason: string;
        managerRemarks: string | null;
    }>;
    getMyLeaves(userId: string): Promise<{
        id: string;
        employeeId: string;
        managerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.LeaveStatus;
        type: import(".prisma/client").$Enums.LeaveType;
        startDate: Date;
        endDate: Date;
        reason: string;
        managerRemarks: string | null;
    }[]>;
    getTeamLeaves(userId: string): Promise<({
        employee: {
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
        employeeId: string;
        managerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.LeaveStatus;
        type: import(".prisma/client").$Enums.LeaveType;
        startDate: Date;
        endDate: Date;
        reason: string;
        managerRemarks: string | null;
    })[]>;
    getPendingTeamLeaves(userId: string): Promise<({
        employee: {
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
        employeeId: string;
        managerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.LeaveStatus;
        type: import(".prisma/client").$Enums.LeaveType;
        startDate: Date;
        endDate: Date;
        reason: string;
        managerRemarks: string | null;
    })[]>;
    processLeave(userId: string, leaveId: string, status: 'APPROVED' | 'REJECTED'): Promise<{
        id: string;
        employeeId: string;
        managerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.LeaveStatus;
        type: import(".prisma/client").$Enums.LeaveType;
        startDate: Date;
        endDate: Date;
        reason: string;
        managerRemarks: string | null;
    }>;
}
declare const _default: LeaveService;
export default _default;
//# sourceMappingURL=leave.service.d.ts.map