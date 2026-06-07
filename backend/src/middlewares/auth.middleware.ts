import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Check for internal service-to-service key first (AI service bypass)
  const serviceKey = req.headers['x-service-key'];
  if (serviceKey === (process.env.SERVICE_KEY || 'internal_hrgpt_service_key_2026')) {
    const userId = req.headers['x-user-id'] as string;
    const role = req.headers['x-user-role'] as string;
    if (userId) {
      (req as any).user = { sub: userId, userId: userId, role: role || 'EMPLOYEE' };
    }
    return next();
  }

  try {
    // 2. Custom JWT Token Auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token is empty' });
    }

    const decoded = jwt.verify(token, (env.JWT_SECRET as string) || 'fallback-secret-key-123') as jwt.JwtPayload;
    (req as any).user = { 
      sub: decoded.sub, 
      userId: decoded.sub, 
      role: decoded.role,
      employeeProfileId: decoded.employeeProfileId,
      departmentId: decoded.departmentId 
    };
    
    next();
  } catch (error) {
    console.error('requireAuth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized: Token validation failed' });
  }
};
