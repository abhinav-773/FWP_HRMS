import { requireAuth } from './auth.middleware';
// Re-export requireAuth for convenience
export { requireAuth };
export const requireRole = (role) => {
    return [
        requireAuth,
        (req, res, next) => {
            const user = req.user;
            if (!user || user.role !== role) {
                return res.status(403).json({ error: `Forbidden: Requires ${role} role` });
            }
            next();
        }
    ];
};
export const requireAnyRole = (roles) => {
    return [
        requireAuth,
        (req, res, next) => {
            const user = req.user;
            if (!user || !roles.includes(user.role)) {
                return res.status(403).json({ error: `Forbidden: Requires one of [${roles.join(', ')}] roles` });
            }
            next();
        }
    ];
};
//# sourceMappingURL=role.middleware.js.map