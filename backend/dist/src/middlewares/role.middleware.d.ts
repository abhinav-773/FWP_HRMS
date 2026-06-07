import { Request, Response, NextFunction } from 'express';
import { requireAuth } from './auth.middleware';
export { requireAuth };
export declare const requireRole: (role: string) => (((req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>) | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
export declare const requireAnyRole: (roles: string[]) => (((req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>) | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
//# sourceMappingURL=role.middleware.d.ts.map