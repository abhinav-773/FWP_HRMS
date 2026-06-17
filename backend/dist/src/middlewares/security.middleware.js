import xss from 'xss';
const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
        return xss(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    if (typeof obj === 'object' && obj !== null) {
        const sanitizedObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                sanitizedObj[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitizedObj;
    }
    return obj;
};
export const xssSanitize = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }
    next();
};
//# sourceMappingURL=security.middleware.js.map