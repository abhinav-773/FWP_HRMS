import type { Request, Response } from 'express';
export declare const createCandidate: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCandidates: (req: Request, res: Response) => Promise<void>;
export declare const getCandidateById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCandidate: (req: Request, res: Response) => Promise<void>;
export declare const deleteCandidate: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=candidate.controller.d.ts.map