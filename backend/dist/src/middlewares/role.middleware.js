export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.role) {
            return res.status(403).json({ error: 'Forbidden: No role assigned' });
        }
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
//# sourceMappingURL=role.middleware.js.map