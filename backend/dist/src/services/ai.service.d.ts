/**
 * AI Integration Service — evaluates candidate applications using Gemini AI.
 * Replaces the old Python microservice proxy.
 */
export declare class AiIntegrationService {
    evaluateApplication(applicationId: string, resumeUrl: string, jobDescription: string): Promise<void>;
}
declare const _default: AiIntegrationService;
export default _default;
//# sourceMappingURL=ai.service.d.ts.map