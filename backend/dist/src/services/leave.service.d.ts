export declare class LeaveService {
    applyLeave(userId: string, data: any): Promise<{
        id: string;
        employeeId: string;
        managerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.LeaveStatus;
        type: import(".prisma/client").$Enums.LeaveType;
        reason: string;
        startDate: Date;
        endDate: Date;
    }>;
    getMyLeaves(userId: string): Promise<{
        id: string;
        employeeId: string;
        managerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.LeaveStatus;
        type: import(".prisma/client").$Enums.LeaveType;
        reason: string;
        startDate: Date;
        endDate: Date;
    }[]>;
    getTeamLeaves(userId: string): Promise<({
        employee: {
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
        employeeId: string;
        managerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.LeaveStatus;
        type: import(".prisma/client").$Enums.LeaveType;
        reason: string;
        startDate: Date;
        endDate: Date;
    })[]>;
    processLeave(userId: string, leaveId: string, status: 'APPROVED' | 'REJECTED'): Promise<{
        id: string;
        employeeId: string;
        managerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.LeaveStatus;
        type: import(".prisma/client").$Enums.LeaveType;
        reason: string;
        startDate: Date;
        endDate: Date;
    }>;
}
declare const _default: LeaveService;
export default _default;
//# sourceMappingURL=leave.service.d.ts.map