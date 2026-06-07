import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
export declare const requireRole: (allowedRoles: Role[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=role.middleware.d.ts.map