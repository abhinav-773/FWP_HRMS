import { Request, Response } from 'express';
export declare const getEmployees: (req: Request, res: Response) => Promise<void>;
export declare const getEmployeeById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createEmployee: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateEmployee: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=employee.controller.d.ts.map