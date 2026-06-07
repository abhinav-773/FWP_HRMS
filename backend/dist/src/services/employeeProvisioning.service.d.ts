import { Role } from '@prisma/client';
export declare class EmployeeProvisioningService {
    /**
     * Generates a unique 6-digit employee ID.
     */
    generateEmployeeId(): string;
    /**
     * Generates a secure temporary password.
     */
    generateTempPassword(): string;
    /**
     * Full provisioning flow: Creates user, creates profile, bootstraps HR modules.
     */
    provisionEmployee(data: {
        fullName: string;
        email: string;
        departmentId?: string;
        designationId?: string;
        managerId?: string;
        joinDate?: string | Date;
        role: Role;
    }): Promise<{
        profile: {
            user: {
                fullName: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
            department: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            } | null;
            designation: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                level: number;
            } | null;
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
        tempPassword: string;
    }>;
    /**
     * Ensures all required modules are initialized for the new employee.
     */
    bootstrapEmployeeModules(employeeProfileId: string): Promise<void>;
}
declare const _default: EmployeeProvisioningService;
export default _default;
//# sourceMappingURL=employeeProvisioning.service.d.ts.map