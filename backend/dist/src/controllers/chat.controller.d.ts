import type { Request, Response } from 'express';
export declare const sendChatMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getChatHistory: (req: Request, res: Response) => Promise<void>;
export declare const getUserSessions: (req: Request, res: Response) => Promise<void>;
export declare const getChatHealth: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=chat.controller.d.ts.map