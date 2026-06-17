type ActionResult = {
    type: 'data_table' | 'text' | 'confirmation' | 'generated_content';
    title: string;
    description?: string;
    columns?: string[];
    rows?: Record<string, any>[];
    content?: string;
    metadata?: Record<string, any>;
};
type CopilotResponse = {
    actionExecuted: boolean;
    actionId: string | null;
    result: ActionResult;
};
export declare class CopilotActionEngine {
    processMessage(userId: string, role: string, fullName: string, message: string, context: string): Promise<CopilotResponse>;
    private detectIntent;
    private generateConversationalResponse;
}
declare const _default: CopilotActionEngine;
export default _default;
//# sourceMappingURL=copilotActionEngine.d.ts.map