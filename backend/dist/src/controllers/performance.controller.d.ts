import { Request, Response } from 'express';
export declare const createGoal: (req: Request, res: Response) => Promise<void>;
export declare const getMyGoals: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getEmployeeGoals: (req: Request, res: Response) => Promise<void>;
export declare const updateGoalProgress: (req: Request, res: Response) => Promise<void>;
export declare const createReview: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyReviews: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requestFeedback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyFeedback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const generateAISummary: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=performance.controller.d.ts.map