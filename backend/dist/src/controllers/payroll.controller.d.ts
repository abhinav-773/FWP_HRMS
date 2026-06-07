import { Request, Response } from 'express';
export declare const generatePayroll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyPayslips: (req: Request, res: Response) => Promise<void>;
export declare const markAsPaid: (req: Request, res: Response) => Promise<void>;
export declare const downloadPayslip: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=payroll.controller.d.ts.map