import { Request, Response } from 'express';
export declare const applyLeave: (req: Request, res: Response) => Promise<void>;
export declare const getMyLeaves: (req: Request, res: Response) => Promise<void>;
export declare const getTeamLeaves: (req: Request, res: Response) => Promise<void>;
export declare const getPendingTeamLeaves: (req: Request, res: Response) => Promise<void>;
export declare const processLeave: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const approveLeave: (req: Request, res: Response) => Promise<void>;
export declare const rejectLeave: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=leave.controller.d.ts.map