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
}
export const eventBus = new EventBus();
//# sourceMappingURL=eventBus.js.map