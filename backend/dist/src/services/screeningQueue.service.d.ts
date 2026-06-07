export declare class ScreeningQueueService {
    private queue;
    private isProcessing;
    private auditLogPath;
    constructor();
    private writeAuditLog;
    /**
     * Add a new application to the background processing queue
     */
    queueApplication(applicationId: string): void;
    /**
     * Start processing items in the queue
     */
    private processQueue;
    private processApplication;
}
declare const _default: ScreeningQueueService;
export default _default;
//# sourceMappingURL=screeningQueue.service.d.ts.map