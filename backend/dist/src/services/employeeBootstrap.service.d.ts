export declare class EmployeeBootstrapService {
    ensureEmployeeProfile(userId: string): Promise<{
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
    }>;
    initializeHRRecords(employeeProfileId: string): Promise<boolean>;
}
declare const _default: EmployeeBootstrapService;
export default _default;
//# sourceMappingURL=employeeBootstrap.service.d.ts.map