import { Request, Response, NextFunction } from 'express';
export declare const getTeamDashboard: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTeamTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTeamTasks: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getLeaveApprovals: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const approveLeave: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const submitPerformanceReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTeamAnalytics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTeamMembers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=manager.controller.d.ts.map