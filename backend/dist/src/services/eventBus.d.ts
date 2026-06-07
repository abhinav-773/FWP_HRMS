import { EventEmitter } from 'events';
declare class EventBus extends EventEmitter {
    constructor();
    emitNotification(userId: string, notification: any): void;
    emitAtsUpdate(jobId: string, activity: any): void;
    emitMessage(conversationId: string, message: any): void;
    emitTaskAssigned(employeeId: string, task: any): void;
    emitTaskCompleted(managerId: string, task: any): void;
    emitLeaveRequested(managerId: string, request: any): void;
    emitLeaveApproved(employeeId: string, request: any): void;
    emitPerformanceReview(employeeId: string, review: any): void;
    emitInterviewFeedback(interviewId: string, feedback: any): void;
}
export declare const eventBus: EventBus;
export {};
//# sourceMappingURL=eventBus.d.ts.map