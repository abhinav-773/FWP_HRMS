import { User } from '@prisma/client';
export declare class AuthService {
    private readonly ACCESS_TOKEN_SECRET;
    private readonly REFRESH_TOKEN_SECRET;
    private readonly ACCESS_TOKEN_EXPIRY;
    private readonly REFRESH_TOKEN_EXPIRY;
    generateTokens(user: Pick<User, 'id' | 'email' | 'role' | 'status'>): {
        accessToken: string;
        refreshToken: string;
    };
    createSession(userId: string, refreshToken: string, ipAddress?: string, userAgent?: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        refreshToken: string;
        expiresAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        isValid: boolean;
    }>;
    refreshSession(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
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