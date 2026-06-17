import { Router } from 'express';
import prisma from '../config/prisma';
import redisClient from '../config/redis';
const router = Router();
router.get('/health', async (req, res) => {
    const health = {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
            api: 'UP',
            database: 'DOWN',
            redis: 'DOWN'
        }
    };
    // Check Database
    try {
        await prisma.$queryRaw `SELECT 1`;
        health.services.database = 'UP';
    }
    catch (error) {
        health.services.database = 'DOWN';
        health.dbError = error;
    }
    // Check Redis
    try {
        if (redisClient && redisClient.status === 'ready') {
            health.services.redis = 'UP';
        }
        else {
            health.services.redis = 'DOWN';
        }
    }
    catch (error) {
        health.services.redis = 'DOWN';
        health.redisError = error;
    }
    const status = (health.services.database === 'UP' && health.services.redis === 'UP') ? 200 : 503;
    res.status(status).json(health);
});
export default router;
//# sourceMappingURL=system.routes.js.map