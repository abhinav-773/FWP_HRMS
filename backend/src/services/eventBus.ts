import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
  constructor() {
    super();
    // Increase max listeners if needed
    this.setMaxListeners(50);
  }

  // Helper method for typed events (optional)
  emitNotification(userId: string, notification: any) {
    this.emit(`notification:${userId}`, notification);
  }

  emitAtsUpdate(jobId: string, activity: any) {
    this.emit(`ats:job:${jobId}`, activity);
    this.emit('ats:update', { jobId, activity });
  }

  emitMessage(conversationId: string, message: any) {
    this.emit(`chat:message:${conversationId}`, message);
  }

  // Manager Events
  emitTaskAssigned(employeeId: string, task: any) {
    this.emit('task:assigned', { employeeId, task });
  }
  emitTaskCompleted(managerId: string, task: any) {
    this.emit('task:completed', { managerId, task });
  }
  emitLeaveRequested(managerId: string, request: any) {
    this.emit('leave:requested', { managerId, request });
  }
  emitLeaveApproved(employeeId: string, request: any) {
    this.emit('leave:approved', { employeeId, request });
  }
  emitPerformanceReview(employeeId: string, review: any) {
    this.emit('performance:review_submitted', { employeeId, review });
  }
  emitInterviewFeedback(interviewId: string, feedback: any) {
    this.emit('interview:feedback_added', { interviewId, feedback });
  }
}

export const eventBus = new EventBus();
