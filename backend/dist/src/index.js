import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { v4 as uuidv4 } from 'uuid';
import { env } from './config/env';
import { logger } from './config/logger';
import redisClient from './config/redis';
import { globalLimiter, authLimiter } from './middlewares/rateLimiter';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import prisma from './config/prisma';
import { xssSanitize } from './middlewares/security.middleware';
import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import attendanceRoutes from './routes/attendance.routes';
import leaveRoutes from './routes/leave.routes';
import payrollRoutes from './routes/payroll.routes';
import notificationRoutes from './routes/notification.routes';
import documentRoutes from './routes/document.routes';
import jobRoutes from './routes/job.routes';
import candidateRoutes from './routes/candidate.routes';
import applicationRoutes from './routes/application.routes';
import interviewRoutes from './routes/interview.routes';
import atsAnalyticsRoutes from './routes/ats-analytics.routes';
import chatRoutes from './routes/chat.routes';
import systemRoutes from './routes/system.routes';
import searchRoutes from './routes/search.routes';
import copilotRoutes from './routes/copilot.routes';
import teamChatRoutes from './routes/team-chat.routes';
import sharedNotesRoutes from './routes/shared-notes.routes';
import bulkUploadRoutes from './routes/bulkUpload.routes';
import onboardingRoutes from './routes/onboarding.routes';
import performanceRoutes from './routes/performance.routes';
import workflowRoutes from './routes/workflow.routes';
import publicRoutes from './routes/public.routes';
import managerRoutes from './routes/manager.routes';
import taskRoutes from './routes/task.routes';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { setupSocketService } from './services/socket.service';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const server = http.createServer(app);
// Request Tracing Middleware
app.use((req, res, next) => {
    const id = uuidv4();
    req.id = id;
    res.setHeader('X-Request-Id', id);
    next();
});
// Configure Morgan to use Winston
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));
// Security Middlewares
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(cors({
    origin: env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL || 'https://fwp-hrms.vercel.app']
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(xssSanitize);
// Apply Global Rate Limiting
app.use('/api/', globalLimiter);
export const io = new Server(server, {
    cors: {
        origin: env.NODE_ENV === 'production'
            ? [process.env.FRONTEND_URL || 'https://fwp-hrms.vercel.app']
            : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
        credentials: true,
    }
});
// Setup Socket Architecture
setupSocketService(io);
// Routes
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/auth', authLimiter, authRoutes); // Stricter limits for auth
app.use('/api/v1/custom-auth', authLimiter, authRoutes); // Same routes, dual mount for compatibility
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/ats', atsAnalyticsRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/copilot', copilotRoutes);
app.use('/api/v1/team-chat', teamChatRoutes);
app.use('/api/v1/shared-notes', sharedNotesRoutes);
app.use('/api/v1/bulk-upload', bulkUploadRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/performance', performanceRoutes);
app.use('/api/v1/workflows', workflowRoutes);
app.use('/api/v1/manager', managerRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/system', systemRoutes);
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Advanced Health Check
app.get('/api/health', async (req, res) => {
    let dbStatus = 'ok';
    let redisStatus = 'ok';
    try {
        await prisma.$queryRaw `SELECT 1`;
    }
    catch (error) {
        dbStatus = 'error';
        logger.error('DB Health Check Failed:', error);
    }
    if (redisClient) {
        try {
            await redisClient.ping();
        }
        catch (error) {
            redisStatus = 'error';
            logger.error('Redis Health Check Failed:', error);
        }
    }
    else {
        redisStatus = 'disabled';
    }
    res.status((dbStatus === 'ok' && (redisStatus === 'ok' || redisStatus === 'disabled')) ? 200 : 503).json({
        status: 'ok',
        service: 'HireMind Backend API',
        database: dbStatus,
        redis: redisStatus,
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});
// Global Error Handler
app.use(globalErrorHandler);
const PORT = env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`✅ Backend server running on port ${PORT} in ${env.NODE_ENV} mode`);
});
//# sourceMappingURL=index.js.map