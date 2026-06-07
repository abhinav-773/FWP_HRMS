import { Request, Response } from 'express';
export declare const applyLeave: (req: Request, res: Response) => Promise<void>;
export declare const getMyLeaves: (req: Request, res: Response) => Promise<void>;
export declare const getTeamLeaves: (req: Request, res: Response) => Promise<void>;
export declare const processLeave: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=leave.controller.d.ts.map