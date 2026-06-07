import type { Request, Response } from 'express';
export declare const scheduleInterview: (req: Request, res: Response) => Promise<void>;
export declare const getInterviews: (req: Request, res: Response) => Promise<void>;
export declare const updateInterview: (req: Request, res: Response) => Promise<void>;
export declare const deleteInterview: (req: Request, res: Response) => Promise<void>;
export declare const getPublicInterview: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getManagerInterviews: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createManagerInterview: (req: Request, res: Response) => Promise<void>;
export declare const sendInterviewLink: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=interview.controller.d.ts.map