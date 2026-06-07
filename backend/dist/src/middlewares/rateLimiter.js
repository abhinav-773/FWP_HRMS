import rateLimit from 'express-rate-limit';
// Global API rate limiter
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        status: 429,
        error: 'Too many requests, please try again later.',
    },
});
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased for dev mode
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        error: 'Too many authentication attempts, please try again after 15 minutes.',
    },
});
//# sourceMappingURL=rateLimiter.js.map