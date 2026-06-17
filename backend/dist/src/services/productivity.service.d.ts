export declare const calculateProductivity: (department: string) => Promise<{
    id: string;
    department: string;
    completedTasks: number;
    averageAttendance: number;
    averageProductivity: number;
    overdueTasks: number;
    burnoutRiskScore: number;
    generatedAt: Date;
}>;
export declare const generatePerformanceSummary: (metrics: any) => Promise<string>;
//# sourceMappingURL=productivity.service.d.ts.map