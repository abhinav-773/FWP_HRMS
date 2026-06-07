import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import authService from '../services/auth.service';
import { env } from '../config/env';
// Helper to set HTTP-only cookie
const setRefreshCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};
export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be email or employeeId
        if (!identifier || !password) {
            return res.status(400).json({ error: 'Missing credentials' });
        }
        // Find User (either by email or matching employeeProfile.employeeId)
        let user = await prisma.user.findUnique({
            where: { email: identifier },
            include: { EmployeeProfile: true }
        });
        if (!user) {
            const profile = await prisma.employeeProfile.findUnique({
                where: { employeeId: identifier },
                include: { user: { include: { EmployeeProfile: true } } }
            });
            if (profile)
                user = profile.user;
        }
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.status !== 'ACTIVE' && user.status !== 'PENDING') {
            return res.status(403).json({ error: 'Account is inactive' });
        }
        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate Tokens
        const { accessToken, refreshToken } = authService.generateTokens(user);
        // Save session
        await authService.createSession(user.id, refreshToken, req.ip, req.headers['user-agent']);
        // Set secure cookie
        setRefreshCookie(res, refreshToken);
        res.json({
            message: 'Login successful',
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                status: user.status,
                tempPassword: user.tempPassword,
                employeeProfile: user.EmployeeProfile
            }
        });
    }
    catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const logout = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (token) {
            await authService.logout(token);
        }
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token)
            return res.status(401).json({ error: 'No refresh token' });
        const result = await authService.refreshSession(token);
        setRefreshCookie(res, result.refreshToken);
        res.json({
            accessToken: result.accessToken,
            user: {
                id: result.user.id,
                email: result.user.email,
                fullName: result.user.fullName,
                role: result.user.role,
                status: result.user.status,
                tempPassword: result.user.tempPassword
            }
        });
    }
    catch (error) {
        res.clearCookie('refreshToken');
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
};
export const changePassword = async (req, res) => {
    try {
        // Requires auth.middleware.ts to set req.user
        const userId = req.user?.sub;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { newPassword } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                tempPassword: false
            }
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
};
//# sourceMappingURL=auth.controller.js.map