/**
 * Resolve or create a local Prisma user from a Clerk userId.
 * Returns { userId, role } matching the shape all controllers expect.
 */
export declare function resolveClerkUser(clerkUserId: string): Promise<{
    userId: string;
    role: import(".prisma/client").$Enums.Role;
}>;
/**
 * Verify Clerk JWT token from Authorization header.
 * Returns an object with `sub` (Clerk user ID) or null.
 */
export declare function verifyClerkToken(token: string): Promise<{
    sub: string;
} | null>;
//# sourceMappingURL=clerk.middleware.d.ts.map