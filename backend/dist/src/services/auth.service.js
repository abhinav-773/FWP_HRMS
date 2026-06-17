import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma';
export class AuthService {
    ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
    REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
    ACCESS_TOKEN_EXPIRY = '15m';
    REFRESH_TOKEN_EXPIRY = '7d';
    // Generate tokens for a user
    generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            employeeProfileId: user.EmployeeProfile?.id || null,
            departmentId: user.EmployeeProfile?.departmentId || null
        };
        const accessToken = jwt.sign(payload, this.ACCESS_TOKEN_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRY });
        const refreshToken = jwt.sign(payload, this.REFRESH_TOKEN_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRY });
        return { accessToken, refreshToken };
    }
    // Create a session in DB
    async createSession(userId, refreshToken) {
        // Expiry matches 7d
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        return await prisma.authSession.create({
            data: {
                userId,
                refreshToken: hashedToken,
                expiresAt,
                lastActiveAt: new Date()
            }
        });
    }
    // Verify and Refresh Tokens
    async refreshSession(token) {
        try {
            const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET);
            // Verify session exists and is valid in DB using hashed token
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            const session = await prisma.authSession.findUnique({ where: { refreshToken: hashedToken } });
            if (!session || !session.isValid || session.expiresAt < new Date()) {
                throw new Error('Invalid or expired refresh session');
            }
            // Find user
            const user = await prisma.user.findUnique({
                where: { id: decoded.sub },
                include: { EmployeeProfile: true }
            });
            if (!user || user.status !== 'ACTIVE') {
                throw new Error('User is inactive or not found');
            }
            // Generate new tokens
            const newTokens = this.generateTokens(user);
            // Simplify: Reuse the existing session record but update the token hash
            const newHashedToken = crypto.createHash('sha256').update(newTokens.refreshToken).digest('hex');
            await prisma.authSession.update({
                where: { id: session.id },
                data: {
                    refreshToken: newHashedToken,
                    lastActiveAt: new Date()
                }
            });
            return { user, ...newTokens };
        }
        catch (error) {
            throw new Error('Unauthorized');
        }
    }
    async logout(token) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        await prisma.authSession.deleteMany({ where: { refreshToken: hashedToken } });
    }
    async generatePasswordResetToken(email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return null; // Prevent enumeration
        // Clear old tokens
        await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
        // Generate short-lived simple token (e.g. 32 char hex or similar)
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry
        const resetToken = await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt
            }
        });
        return resetToken.token;
    }
}
export default new AuthService();
//# sourceMappingURL=auth.service.js.map