import { Request, Response } from 'express';
export declare const uploadDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyDocuments: (req: Request, res: Response) => Promise<void>;
export declare const verifyDocument: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=document.controller.d.ts.map