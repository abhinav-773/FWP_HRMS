import { EventEmitter } from 'events';
declare class EventBus extends EventEmitter {
    constructor();
    emitNotification(userId: string, notification: any): void;
    emitAtsUpdate(jobId: string, activity: any): void;
    emitMessage(conversationId: string, message: any): void;
}
export declare const eventBus: EventBus;
export {};
//# sourceMappingURL=eventBus.d.ts.map