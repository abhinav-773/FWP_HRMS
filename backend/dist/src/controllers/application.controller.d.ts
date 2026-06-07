import type { Request, Response } from 'express';
export declare const applyForJob: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getApplications: (req: Request, res: Response) => Promise<void>;
export declare const updateStage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateNotes: (req: Request, res: Response) => Promise<void>;
export declare const retriggerAi: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const overrideDecision: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=application.controller.d.ts.map