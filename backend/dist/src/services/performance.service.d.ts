import { GoalStatus } from '@prisma/client';
export declare class PerformanceService {
    createGoal(employeeId: string, title: string, description?: string, targetDate?: string): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.GoalStatus;
        description: string | null;
        title: string;
        targetDate: Date | null;
        progress: number;
    }>;
    getEmployeeGoals(employeeId: string): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.GoalStatus;
        description: string | null;
        title: string;
        targetDate: Date | null;
        progress: number;
    }[]>;
    updateGoalProgress(goalId: string, progress: number, status?: GoalStatus): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.GoalStatus;
        description: string | null;
        title: string;
        targetDate: Date | null;
        progress: number;
    }>;
    createReview(employeeId: string, reviewerId: string, reviewPeriod: string, rating: number, comments: string): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        aiSummary: string | null;
        managerRemarks: string | null;
        reviewerId: string;
        reviewPeriod: string;
        technicalRating: number;
        communicationRating: number;
        productivityRating: number;
        teamworkRating: number;
        overallRating: number;
        strengths: string[];
        weaknesses: string[];
    }>;
    getEmployeeReviews(employeeId: string): Promise<({
        reviewer: {
            user: {
                fullName: string;
            };
        } & {
            id: string;
            userId: string;
            employeeId: string;
            departmentId: string | null;
            designationId: string | null;
            managerId: string | null;
            joinDate: Date;
            salary: number | null;
            phone: string | null;
            address: string | null;
            profilePhoto: string | null;
            onboardingProgress: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        aiSummary: string | null;
        managerRemarks: string | null;
        reviewerId: string;
        reviewPeriod: string;
        technicalRating: number;
        communicationRating: number;
        productivityRating: number;
        teamworkRating: number;
        overallRating: number;
        strengths: string[];
        weaknesses: string[];
    })[]>;
    requestFeedback(employeeId: string, peerId: string, reviewPeriod: string, feedbackText: string, rating?: number): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        rating: number | null;
        reviewPeriod: string;
        feedbackText: string;
        peerId: string;
    }>;
    getEmployeeFeedback(employeeId: string): Promise<({
        peer: {
            user: {
                fullName: string;
            };
        } & {
            id: string;
            userId: string;
            employeeId: string;
            departmentId: string | null;
            designationId: string | null;
            managerId: string | null;
            joinDate: Date;
            salary: number | null;
            phone: string | null;
            address: string | null;
            profilePhoto: string | null;
            onboardingProgress: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        rating: number | null;
        reviewPeriod: string;
        feedbackText: string;
        peerId: string;
    })[]>;
    generateAISummary(employeeId: string, reviewPeriod: string): Promise<string>;
}
declare const _default: PerformanceService;
export default _default;
//# sourceMappingURL=performance.service.d.ts.map