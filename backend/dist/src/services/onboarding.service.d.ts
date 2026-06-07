import { OnboardingTaskStatus } from '@prisma/client';
export declare class OnboardingService {
    createChecklist(employeeId: string, title: string, description?: string, customTasks?: any[]): Promise<({
        tasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OnboardingTaskStatus;
            description: string | null;
            title: string;
            documentRequired: boolean;
            dueDate: Date | null;
            completedAt: Date | null;
            documentUrl: string | null;
            checklistId: string;
        }[];
    } & {
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OnboardingChecklistStatus;
        description: string | null;
        title: string;
    }) | null>;
    getEmployeeChecklist(employeeId: string): Promise<({
        tasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OnboardingTaskStatus;
            description: string | null;
            title: string;
            documentRequired: boolean;
            dueDate: Date | null;
            completedAt: Date | null;
            documentUrl: string | null;
            checklistId: string;
        }[];
    } & {
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OnboardingChecklistStatus;
        description: string | null;
        title: string;
    }) | null>;
    getAllChecklists(): Promise<({
        tasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OnboardingTaskStatus;
            description: string | null;
            title: string;
            documentRequired: boolean;
            dueDate: Date | null;
            completedAt: Date | null;
            documentUrl: string | null;
            checklistId: string;
        }[];
        employee: {
            user: {
                fullName: string;
                email: string;
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
    } & {
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OnboardingChecklistStatus;
        description: string | null;
        title: string;
    })[]>;
    updateTaskStatus(taskId: string, status: OnboardingTaskStatus, documentUrl?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OnboardingTaskStatus;
        description: string | null;
        title: string;
        documentRequired: boolean;
        dueDate: Date | null;
        completedAt: Date | null;
        documentUrl: string | null;
        checklistId: string;
    }>;
    assignAsset(employeeId: string, assetName: string, assetType: string, serialNumber?: string): Promise<{
        id: string;
        employeeId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ITAssetStatus;
        assetName: string;
        assetType: string;
        serialNumber: string | null;
        assignedDate: Date | null;
    }>;
    getEmployeeAssets(employeeId: string): Promise<{
        id: string;
        employeeId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ITAssetStatus;
        assetName: string;
        assetType: string;
        serialNumber: string | null;
        assignedDate: Date | null;
    }[]>;
    getAllAssets(): Promise<({
        employee: ({
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
        }) | null;
    } & {
        id: string;
        employeeId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ITAssetStatus;
        assetName: string;
        assetType: string;
        serialNumber: string | null;
        assignedDate: Date | null;
    })[]>;
    releaseAsset(assetId: string): Promise<{
        id: string;
        employeeId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ITAssetStatus;
        assetName: string;
        assetType: string;
        serialNumber: string | null;
        assignedDate: Date | null;
    }>;
}
declare const _default: OnboardingService;
export default _default;
//# sourceMappingURL=onboarding.service.d.ts.map