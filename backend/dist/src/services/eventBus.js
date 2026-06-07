import { EventEmitter } from 'events';
class EventBus extends EventEmitter {
    constructor() {
        super();
        // Increase max listeners if needed
        this.setMaxListeners(50);
    }
    // Helper method for typed events (optional)
    emitNotification(userId, notification) {
        this.emit(`notification:${userId}`, notification);
    }
    emitAtsUpdate(jobId, activity) {
        this.emit(`ats:job:${jobId}`, activity);
        this.emit('ats:update', { jobId, activity });
    }
    emitMessage(conversationId, message) {
        this.emit(`chat:message:${conversationId}`, message);
    }
    // Manager Events
    emitTaskAssigned(employeeId, task) {
        this.emit('task:assigned', { employeeId, task });
    }
    emitTaskCompleted(managerId, task) {
        this.emit('task:completed', { managerId, task });
    }
    emitLeaveRequested(managerId, request) {
        this.emit('leave:requested', { managerId, request });
    }
    emitLeaveApproved(employeeId, request) {
        this.emit('leave:approved', { employeeId, request });
    }
    emitPerformanceReview(employeeId, review) {
        this.emit('performance:review_submitted', { employeeId, review });
    }
    emitInterviewFeedback(interviewId, feedback) {
        this.emit('interview:feedback_added', { interviewId, feedback });
    }
}
export const eventBus = new EventBus();
//# sourceMappingURL=eventBus.js.map