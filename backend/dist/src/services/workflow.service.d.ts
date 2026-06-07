export declare class WorkflowService {
    /**
     * Seed default rules if the database has none.
     */
    seedDefaultRules(): Promise<void>;
    getRules(): Promise<({
        actions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            actionType: string;
            parameters: import("@prisma/client/runtime/library").JsonValue | null;
            ruleId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        triggerEvent: string;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
    })[]>;
    toggleRule(ruleId: string, isActive: boolean): Promise<{
        actions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            actionType: string;
            parameters: import("@prisma/client/runtime/library").JsonValue | null;
            ruleId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        triggerEvent: string;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
    }>;
    /**
     * Trigger and execute actions for a specific event
     */
    executeEvent(event: string, context: {
        userId: string;
        employeeProfileId?: string;
    }): Promise<void>;
    private runAction;
}
declare const _default: WorkflowService;
export default _default;
//# sourceMappingURL=workflow.service.d.ts.map