import { Request, Response } from 'express';
export declare const clockIn: (req: Request, res: Response) => Promise<void>;
export declare const clockOut: (req: Request, res: Response) => Promise<void>;
export declare const toggleBreak: (req: Request, res: Response) => Promise<void>;
export declare const getBreakStatus: (req: Request, res: Response) => Promise<void>;
export declare const getBurnoutCheck: (req: Request, res: Response) => Promise<void>;
export declare const getMyStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=attendance.controller.d.ts.map