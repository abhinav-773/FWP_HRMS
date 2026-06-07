export declare class AtsAnalyticsService {
    getDashboardMetrics(): Promise<{
        activeJobs: number;
        totalCandidates: number;
        funnel: {
            APPLIED: number;
            SCREENING: number;
            INTERVIEW: number;
            SHORTLISTED: number;
            HIRED: number;
            REJECTED: number;
        };
        upcomingInterviews: ({
            application: {
                candidate: {
                    fullName: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                stage: import(".prisma/client").$Enums.ApplicationStage;
                coverLetter: string | null;
                recruiterNotes: string | null;
                aiScore: number | null;
                aiInsights: string | null;
                semanticScore: number | null;
                technicalScore: number | null;
                experienceScore: number | null;
                educationScore: number | null;
                overallAIScore: number | null;
                aiStrengths: string[];
                aiWeaknesses: string[];
                aiRecommendation: string | null;
                rejectionReason: string | null;
                interviewStatus: string | null;
                jobId: string;
                candidateId: string;
            };
            interviewer: {
                fullName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.InterviewStatus;
            type: import(".prisma/client").$Enums.InterviewType;
            location: string | null;
            interviewStatus: string | null;
            applicationId: string;
            scheduledAt: Date;
            durationMins: number;
            feedback: string | null;
            meetingUrl: string | null;
            recordingUrl: string | null;
            transcript: import("@prisma/client/runtime/library").JsonValue | null;
            startedAt: Date | null;
            endedAt: Date | null;
            interviewType: string | null;
            meetingProvider: string | null;
            interviewRounds: string[];
            interviewerName: string | null;
            interviewNotes: string | null;
            interviewerId: string;
        })[];
        leaderboard: ({
            candidate: {
                fullName: string;
                email: string;
            };
            job: {
                title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            stage: import(".prisma/client").$Enums.ApplicationStage;
            coverLetter: string | null;
            recruiterNotes: string | null;
            aiScore: number | null;
            aiInsights: string | null;
            semanticScore: number | null;
            technicalScore: number | null;
            experienceScore: number | null;
            educationScore: number | null;
            overallAIScore: number | null;
            aiStrengths: string[];
            aiWeaknesses: string[];
            aiRecommendation: string | null;
            rejectionReason: string | null;
            interviewStatus: string | null;
            jobId: string;
            candidateId: string;
        })[];
        scoreDistribution: {
            range: string;
            count: number;
        }[];
        activityFeed: ({
            application: {
                candidate: {
                    fullName: string;
                };
                job: {
                    title: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                stage: import(".prisma/client").$Enums.ApplicationStage;
                coverLetter: string | null;
                recruiterNotes: string | null;
                aiScore: number | null;
                aiInsights: string | null;
                semanticScore: number | null;
                technicalScore: number | null;
                experienceScore: number | null;
                educationScore: number | null;
                overallAIScore: number | null;
                aiStrengths: string[];
                aiWeaknesses: string[];
                aiRecommendation: string | null;
                rejectionReason: string | null;
                interviewStatus: string | null;
                jobId: string;
                candidateId: string;
            };
            performedBy: {
                fullName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            fromStage: import(".prisma/client").$Enums.ApplicationStage | null;
            toStage: import(".prisma/client").$Enums.ApplicationStage;
            note: string | null;
            performedById: string;
            applicationId: string;
        })[];
    }>;
}
declare const _default: AtsAnalyticsService;
export default _default;
//# sourceMappingURL=ats-analytics.service.d.ts.map