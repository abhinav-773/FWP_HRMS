import { Request, Response, NextFunction } from 'express';
export declare const getOnboardingStatus: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const changePassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllOnboardingEmployees: (req: Request, res: Response) => Promise<void>;
export declare const verifyDocument: (req: Request, res: Response) => Promise<void>;
export declare const activateEmployee: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createChecklist: (req: Request, res: Response) => Promise<void>;
export declare const getMyChecklist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEmployeeChecklist: (req: Request, res: Response) => Promise<void>;
export declare const getAllChecklists: (req: Request, res: Response) => Promise<void>;
export declare const updateTask: (req: Request, res: Response) => Promise<void>;
export declare const assignAsset: (req: Request, res: Response) => Promise<void>;
export declare const getMyAssets: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllAssets: (req: Request, res: Response) => Promise<void>;
export declare const releaseAsset: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=onboarding.controller.d.ts.map