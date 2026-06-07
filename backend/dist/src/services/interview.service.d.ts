export declare class InterviewService {
    scheduleInterview(data: any): Promise<{
        application: ({
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
        }) | null;
        interviewer: {
            id: string;
            fullName: string;
            email: string;
        };
    } & {
        id: string;
        employeeId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InterviewStatus;
        type: import(".prisma/client").$Enums.InterviewType;
        title: string | null;
        date: string | null;
        location: string | null;
        notes: string | null;
        interviewStatus: string | null;
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
        time: string | null;
        applicationId: string | null;
        interviewerId: string;
    }>;
    getInterviews(query: any): Promise<({
        application: ({
            candidate: {
                id: string;
                fullName: string;
                email: string;
            };
            job: {
                id: string;
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
        }) | null;
        interviewer: {
            id: string;
            fullName: string;
        };
    } & {
        id: string;
        employeeId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InterviewStatus;
        type: import(".prisma/client").$Enums.InterviewType;
        title: string | null;
        date: string | null;
        location: string | null;
        notes: string | null;
        interviewStatus: string | null;
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
        time: string | null;
        applicationId: string | null;
        interviewerId: string;
    })[]>;
    updateInterview(id: string, data: any): Promise<{
        id: string;
        employeeId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InterviewStatus;
        type: import(".prisma/client").$Enums.InterviewType;
        title: string | null;
        date: string | null;
        location: string | null;
        notes: string | null;
        interviewStatus: string | null;
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
        time: string | null;
        applicationId: string | null;
        interviewerId: string;
    }>;
    deleteInterview(id: string): Promise<{
        id: string;
        employeeId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InterviewStatus;
        type: import(".prisma/client").$Enums.InterviewType;
        title: string | null;
        date: string | null;
        location: string | null;
        notes: string | null;
        interviewStatus: string | null;
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
        time: string | null;
        applicationId: string | null;
        interviewerId: string;
    }>;
    getInterviewByMeetingUrl(meetingUrl: string): Promise<({
        application: ({
            candidate: {
                fullName: string;
                email: string;
                skills: string[];
            };
            job: {
                title: string;
                requirements: string;
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
        }) | null;
    } & {
        id: string;
        employeeId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InterviewStatus;
        type: import(".prisma/client").$Enums.InterviewType;
        title: string | null;
        date: string | null;
        location: string | null;
        notes: string | null;
        interviewStatus: string | null;
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
        time: string | null;
        applicationId: string | null;
        interviewerId: string;
    }) | null>;
}
declare const _default: InterviewService;
export default _default;
//# sourceMappingURL=interview.service.d.ts.map