import { Request, Response } from 'express';
export declare const getOnboardingStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const changePassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllOnboardingEmployees: (req: Request, res: Response) => Promise<void>;
export declare const verifyDocument: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=onboarding.controller.d.ts.map