import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return xss(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitizedObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitizedObj[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitizedObj;
  }
  
  return obj;
};

export const xssSanitize = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    for (const key in req.query) {
      req.query[key] = sanitizeObject(req.query[key]) as any;
    }
  }
  if (req.params) {
    for (const key in req.params) {
      req.params[key] = sanitizeObject(req.params[key]) as any;
    }
  }
  next();
};
