import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { eventBus } from './eventBus';
import { setupInterviewGateway } from './interview.gateway';
export const setupSocketService = (io) => {
    // Authentication Middleware — verify JWT OR candidate meetingUrl
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        const meetingUrl = socket.handshake.auth?.meetingUrl || socket.handshake.query?.meetingUrl;
        if (meetingUrl) {
            // Candidate joining via unique link
            socket.isCandidate = true;
            socket.meetingUrl = meetingUrl;
            return next();
        }
        if (!token) {
            return next(new Error('Authentication error: Missing token or meetingUrl'));
        }
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            socket.user = {
                userId: decoded.sub,
                role: decoded.role,
            };
            next();
        }
        catch (err) {
            return next(new Error('Authentication error: Invalid Token'));
        }
    });
    io.on('connection', (socket) => {
        const user = socket.user;
        const isCandidate = socket.isCandidate;
        if (user) {
            console.log(`User connected: ${user.userId} (Socket: ${socket.id})`);
            // 1. Join Personal Room for targeted notifications
            const userRoom = `user_${user.userId}`;
            socket.join(userRoom);
            // Join general company room
            socket.join('company_general');
        }
        else if (isCandidate) {
            console.log(`Candidate connected (Socket: ${socket.id})`);
        }
        // 2. Client joining a specific ATS Job Room to watch Kanban updates
        socket.on('join_job_room', (jobId) => {
            socket.join(`job_${jobId}`);
        });
        socket.on('leave_job_room', (jobId) => {
            socket.leave(`job_${jobId}`);
        });
        // 3. Client joining a Conversation Room for Team Chat
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conversation_${conversationId}`);
        });
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
        });
        // 4. AI Video Interview Socket Gateway
        setupInterviewGateway(io, socket);
        socket.on('disconnect', () => {
            if (user) {
                console.log(`User disconnected: ${user.userId}`);
            }
            else {
                console.log(`Candidate disconnected: ${socket.id}`);
            }
        });
    });
    // ─────────────────────────────────────────────
    // Event Bus Listeners -> Socket Broadcasters
    // ─────────────────────────────────────────────
    // Broadcast new notifications to specific user
    eventBus.on('notification:new', ({ userId, notification }) => {
        io.to(`user_${userId}`).emit('notification', notification);
    });
    // Broadcast ATS candidate moves to anyone viewing that job board
    eventBus.on('ats:update', ({ jobId, activity }) => {
        io.to(`job_${jobId}`).emit('ats_update', activity);
    });
    // Broadcast new chat messages to participants in the conversation room
    eventBus.on('chat:message', ({ conversationId, message }) => {
        io.to(`conversation_${conversationId}`).emit('new_message', message);
    });
    // Optional: Global Activity Feed broadcast
    eventBus.on('activity:global', (activity) => {
        io.to('company_general').emit('global_activity', activity);
    });
    // Manager & Team Events
    eventBus.on('task:assigned', ({ employeeId, task }) => {
        io.to(`user_${employeeId}`).emit('TASK_ASSIGNED', task);
    });
    eventBus.on('task:completed', ({ managerId, task }) => {
        if (managerId)
            io.to(`user_${managerId}`).emit('TASK_COMPLETED', task);
    });
    eventBus.on('leave:requested', ({ managerId, request }) => {
        if (managerId)
            io.to(`user_${managerId}`).emit('LEAVE_REQUESTED', request);
    });
    eventBus.on('leave:approved', ({ employeeId, request }) => {
        io.to(`user_${employeeId}`).emit('LEAVE_APPROVED', request);
    });
    eventBus.on('performance:review_submitted', ({ employeeId, review }) => {
        io.to(`user_${employeeId}`).emit('PERFORMANCE_REVIEW_SUBMITTED', review);
    });
    eventBus.on('interview:feedback_added', ({ interviewId, feedback }) => {
        // broadcast to anyone watching the interview details
        io.emit('INTERVIEW_FEEDBACK_ADDED', { interviewId, feedback });
    });
};
//# sourceMappingURL=socket.service.js.map