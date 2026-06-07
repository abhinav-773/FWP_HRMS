import { User } from '@prisma/client';
export declare class AuthService {
    private readonly ACCESS_TOKEN_SECRET;
    private readonly REFRESH_TOKEN_SECRET;
    private readonly ACCESS_TOKEN_EXPIRY;
    private readonly REFRESH_TOKEN_EXPIRY;
    generateTokens(user: Pick<User, 'id' | 'email' | 'role' | 'status'> & {
        EmployeeProfile?: {
            id: string;
            departmentId: string | null;
        } | null;
    }): {
        accessToken: string;
        refreshToken: string;
    };
    createSession(userId: string, refreshToken: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        refreshToken: string;
        expiresAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        device: string | null;
        browser: string | null;
        isValid: boolean;
        lastActiveAt: Date;
    }>;
    refreshSession(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            EmployeeProfile: {
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
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            clerkId: string | null;
            fullName: string;
            email: string;
            password: string | null;
            tempPassword: boolean;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
        };
    }>;
    logout(token: string): Promise<void>;
    generatePasswordResetToken(email: string): Promise<string | null>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map