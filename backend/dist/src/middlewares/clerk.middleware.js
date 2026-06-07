import { createClerkClient } from '@clerk/express';
import { verifyToken } from '@clerk/backend';
import prisma from '../config/prisma';
import { env } from '../config/env';
const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
/**
 * Resolve or create a local Prisma user from a Clerk userId.
 * Returns { userId, role } matching the shape all controllers expect.
 */
export async function resolveClerkUser(clerkUserId) {
    try {
        // Check if user already exists by clerkId
        let user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
        if (!user) {
            // Fetch full user data from Clerk to create local record
            const clerkUser = await clerkClient.users.getUser(clerkUserId);
            const email = clerkUser.emailAddresses[0]?.emailAddress || `${clerkUserId}@clerk.user`;
            const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'Clerk User';
            const clerkRole = clerkUser.publicMetadata?.role || 'EMPLOYEE';
            // Safely map Clerk roles to Prisma enum values
            let role = 'EMPLOYEE';
            if (clerkRole === 'ADMIN' || clerkRole === 'SUPER_ADMIN')
                role = 'SUPER_ADMIN';
            if (clerkRole === 'RECRUITER' || clerkRole === 'HR_RECRUITER')
                role = 'HR_RECRUITER';
            if (clerkRole === 'MANAGER' || clerkRole === 'SENIOR_MANAGER')
                role = 'SENIOR_MANAGER';
            console.log(`[resolveClerkUser] Attempting to sync user: email=${email}, clerkRole=${clerkRole}, mappedRole=${role}`);
            // Try to find existing user by email first (migration scenario)
            user = await prisma.user.findUnique({ where: { email } });
            if (user) {
                // Link existing user to Clerk
                console.log(`[resolveClerkUser] Linking existing user: ${user.id} to Clerk ID: ${clerkUserId}`);
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { clerkId: clerkUserId },
                });
            }
            else {
                // Create new user
                console.log(`[resolveClerkUser] Creating new user for Clerk ID: ${clerkUserId}`);
                user = await prisma.user.create({
                    data: {
                        clerkId: clerkUserId,
                        email,
                        fullName,
                        role: role,
                    },
                });
            }
        }
        // Ensure EmployeeProfile exists for the user so employee pages function correctly
        const profile = await prisma.employeeProfile.findUnique({ where: { userId: user.id } });
        if (!profile) {
            console.log(`[resolveClerkUser] Auto-creating EmployeeProfile for user: ${user.id}`);
            let employeeId = '';
            let isUnique = false;
            while (!isUnique) {
                employeeId = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;
                const existing = await prisma.employeeProfile.findUnique({ where: { employeeId } });
                if (!existing) {
                    isUnique = true;
                }
            }
            const newProfile = await prisma.employeeProfile.create({
                data: {
                    userId: user.id,
                    employeeId,
                    joinDate: new Date(),
                }
            });
            try {
                const { default: workflowService } = await import('../services/workflow.service');
                await workflowService.executeEvent('ON_BOARDING_STARTED', { userId: user.id, employeeProfileId: newProfile.id });
            }
            catch (err) {
                console.error('[resolveClerkUser] Failed to trigger workflow:', err.message);
            }
        }
        return { userId: user.id, role: user.role };
    }
    catch (error) {
        console.error(`[resolveClerkUser] Critical Error while resolving user ${clerkUserId}:`, error);
        throw error;
    }
}
/**
 * Verify Clerk JWT token from Authorization header.
 * Returns an object with `sub` (Clerk user ID) or null.
 */
export async function verifyClerkToken(token) {
    try {
        const result = await verifyToken(token, {
            secretKey: env.CLERK_SECRET_KEY,
        });
        const payload = result.data || result; // Handle both wrapper and raw payload types
        if (payload && typeof payload === 'object' && 'sub' in payload && typeof payload.sub === 'string') {
            return { sub: payload.sub };
        }
        console.error('Clerk verifyToken payload missing sub:', payload);
        return null;
    }
    catch (err) {
        console.error('Clerk verifyToken threw exception:', err);
        return null;
    }
}
//# sourceMappingURL=clerk.middleware.js.map