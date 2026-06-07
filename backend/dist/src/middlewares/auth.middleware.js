import { getAuth } from '@clerk/express';
import { resolveClerkUser } from './clerk.middleware';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
export const requireAuth = async (req, res, next) => {
    // 1. Check for internal service-to-service key first (AI service bypass)
    const serviceKey = req.headers['x-service-key'];
    if (serviceKey === (process.env.SERVICE_KEY || 'internal_hrgpt_service_key_2026')) {
        const userId = req.headers['x-user-id'];
        const role = req.headers['x-user-role'];
        if (userId) {
            req.user = { sub: userId, role: role || 'EMPLOYEE' };
        }
        return next();
    }
    try {
        // 2. Try Custom JWT Token First
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, env.JWT_SECRET || 'fallback-secret-key-123');
                req.user = { sub: decoded.sub, role: decoded.role };
                return next();
            }
            catch (err) {
                // If JWT fails, we could fallback or reject. 
                // For migration safety, if it's explicitly a Bearer token that isn't Clerk, we reject.
                console.warn('JWT verification failed, falling back to Clerk check.');
            }
        }
        // 2. Try Clerk fallback
        const auth = getAuth(req);
        if (!auth?.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const userData = await resolveClerkUser(auth.userId);
        req.user = { sub: userData.id, role: userData.role };
        next();
    }
    catch (error) {
        console.error('requireAuth middleware error:', error);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};
//# sourceMappingURL=auth.middleware.js.map