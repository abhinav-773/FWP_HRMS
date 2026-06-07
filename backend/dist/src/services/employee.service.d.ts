export declare class EmployeeService {
    getAllEmployees(filters: any): Promise<{
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
    }[]>;
    getEmployeeById(id: string): Promise<({
        user: {
            fullName: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
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
        manager: ({
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
        subordinates: ({
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
        })[];
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
    }) | null>;
    createEmployee(data: any): Promise<{
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
    }>;
    updateEmployee(id: string, data: any): Promise<{
        user: {
            fullName: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
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
    }>;
}
declare const _default: EmployeeService;
export default _default;
//# sourceMappingURL=employee.service.d.ts.map