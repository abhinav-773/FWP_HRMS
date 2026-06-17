/**
 * Generate an AI-powered employee performance summary
 */
export declare function generatePerformanceSummary(metrics: {
    technicalRating: number;
    communicationRating: number;
    productivityRating: number;
    teamworkRating: number;
    strengths: string[];
    weaknesses: string[];
}): Promise<string>;
/**
 * Generate an AI-powered team analytics summary
 */
export declare function generateTeamAnalyticsSummary(data: {
    department: string;
    averageAttendance: number;
    averageProductivity: number;
    overdueTasks: number;
    completedTasks: number;
    burnoutRiskScore: number;
}): Promise<string>;
//# sourceMappingURL=analyticsAI.service.d.ts.map