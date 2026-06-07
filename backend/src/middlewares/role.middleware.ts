import { Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth.middleware';

// Re-export requireAuth for convenience
export { requireAuth };

export const requireRole = (role: string) => {
  return [
    requireAuth,
    (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      if (!user || user.role !== role) {
        return res.status(403).json({ error: `Forbidden: Requires ${role} role` });
      }
      next();
    }
  ];
};

export const requireAnyRole = (roles: string[]) => {
  return [
    requireAuth,
    (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: `Forbidden: Requires one of [${roles.join(', ')}] roles` });
      }
      next();
    }
  ];
};
