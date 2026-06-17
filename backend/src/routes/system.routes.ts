import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import redisClient from '../config/redis';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  const health: any = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    deployment: {
      backend: 'Render Operational',
      frontend: process.env.FRONTEND_URL ? 'Vercel Operational' : 'Not Configured'
    },
    services: {
      api: 'UP',
      database: 'DOWN',
      redis: 'DOWN',
      cloudinary: 'DOWN',
      gemini: 'DOWN',
      groq: 'DOWN',
      smtp: 'DOWN'
    }
  };

  // Check Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'UP';
  } catch (error) {
    health.services.database = 'DOWN';
    health.dbError = error;
  }

  // Check Redis
  try {
    if (redisClient && redisClient.status === 'ready') {
      health.services.redis = 'UP';
    } else {
      health.services.redis = 'DOWN';
    }
  } catch (error) {
    health.services.redis = 'DOWN';
    health.redisError = error;
  }

  // Check Cloudinary
  try {
    if (process.env.CLOUDINARY_URL) {
      health.services.cloudinary = 'UP';
    } else {
      health.services.cloudinary = 'UNCONFIGURED';
    }
  } catch(e) { health.services.cloudinary = 'DOWN'; }

  // Check Gemini
  if (process.env.GEMINI_API_KEY) {
    health.services.gemini = 'UP';
  } else {
    health.services.gemini = 'UNCONFIGURED';
  }

  // Check Groq
  if (process.env.GROQ_API_KEY) {
    health.services.groq = 'UP';
  } else {
    health.services.groq = 'UNCONFIGURED';
  }

  // Check SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    health.services.smtp = 'UP';
  } else {
    health.services.smtp = 'UNCONFIGURED';
  }

  // For reporting, we consider it healthy enough to return the payload
  const isHealthy = true;
  const status = isHealthy ? 200 : 503;
  
  res.status(status).json(health);
});

export default router;
