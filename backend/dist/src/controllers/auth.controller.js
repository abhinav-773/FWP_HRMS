import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import authService from '../services/auth.service.js';
import employeeBootstrapService from '../services/employeeBootstrap.service.js';
import { env } from '../config/env.js';
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
        const { emailOrEmployeeId, password, role } = req.body;
        console.log('[Auth] Login request received:', emailOrEmployeeId, role);
        if (!emailOrEmployeeId || !password) {
            console.log('[Auth] Missing email or password');
            return res.status(400).json({ error: 'Please provide all required fields' });
        }
        // Find User by Email OR through EmployeeProfile's employeeId
        let user = await prisma.user.findUnique({
            where: { email: emailOrEmployeeId },
            include: { EmployeeProfile: true }
        });
        if (!user) {
            const profile = await prisma.employeeProfile.findUnique({
                where: { employeeId: emailOrEmployeeId },
                include: { user: { include: { EmployeeProfile: true } } }
            });
            if (profile)
                user = profile.user;
        }
        if (user && role && user.role !== role) {
            await prisma.auditLog.create({
                data: { action: 'LOGIN_FAILED', entityType: 'User', entityId: user.id, ipAddress: req.ip, details: { reason: `Role mismatch: expected ${role}, got ${user.role}` } }
            });
            return res.status(403).json({ error: 'Unauthorized role. Please use the correct login portal.' });
        }
        console.log('[Auth] User found:', !!user);
        if (!user || !user.password) {
            console.log('[Auth] Invalid credentials or missing password');
            if (user) {
                await prisma.auditLog.create({
                    data: { action: 'LOGIN_FAILED', entityType: 'User', entityId: user.id, ipAddress: req.ip, details: { reason: 'No password' } }
                });
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.status !== 'ACTIVE' && user.status !== 'PENDING') {
            return res.status(403).json({ error: 'Account is inactive' });
        }
        console.log('[Auth] Starting password comparison');
        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('[Auth] Password compare result:', isMatch);
        if (!isMatch) {
            console.log('[Auth] Password mismatch');
            await prisma.auditLog.create({
                data: { action: 'LOGIN_FAILED', entityType: 'User', entityId: user.id, ipAddress: req.ip, details: { reason: 'Wrong password' } }
            });
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        console.log('[Auth] Generating JWTs...');
        // Ensure Employee Profile & HR Records Exist
        const profile = await employeeBootstrapService.ensureEmployeeProfile(user.id);
        if (!user.EmployeeProfile) {
            user.EmployeeProfile = profile;
        }
        // Generate Tokens
        const { accessToken, refreshToken } = authService.generateTokens(user);
        console.log('[Auth] JWTs generated successfully');
        // Save session
        await authService.createSession(user.id, refreshToken);
        await prisma.auditLog.create({
            data: {
                action: 'LOGIN_SUCCESS',
                entityType: 'User',
                entityId: user.id,
                actorId: user.id,
                ipAddress: req.ip,
                details: { role: user.role }
            }
        });
        // Set secure cookie
        setRefreshCookie(res, refreshToken);
        console.log('[Auth] Sending success response');
        return res.status(200).json({
            message: 'Login successful',
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                employeeId: user.EmployeeProfile?.employeeId || null,
                employeeProfileId: user.EmployeeProfile?.id || null,
                departmentId: user.EmployeeProfile?.departmentId || null
            }
        });
    }
    catch (error) {
        console.error('[Auth] Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
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
        const profile = await employeeBootstrapService.ensureEmployeeProfile(result.user.id);
        setRefreshCookie(res, result.refreshToken);
        res.json({
            accessToken: result.accessToken,
            user: {
                id: result.user.id,
                email: result.user.email,
                fullName: result.user.fullName,
                role: result.user.role,
                status: result.user.status,
                tempPassword: result.user.tempPassword,
                employeeProfileId: profile.id,
                departmentId: profile.departmentId
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