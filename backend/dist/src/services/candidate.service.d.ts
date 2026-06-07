import { Prisma } from '@prisma/client';
export declare class CandidateService {
    createCandidate(data: any): Promise<{
        assignedTo: {
            id: string;
            fullName: string;
        } | null;
    } & {
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        email: string;
        location: string | null;
        skills: string[];
        resumeUrl: string | null;
        linkedinUrl: string | null;
        source: import(".prisma/client").$Enums.CandidateSource;
        experience: number;
        education: string | null;
        notes: string | null;
        assignedToId: string | null;
    }>;
    getAllCandidates(query: any): Promise<({
        _count: {
            applications: number;
        };
        assignedTo: {
            id: string;
            fullName: string;
        } | null;
    } & {
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        email: string;
        location: string | null;
        skills: string[];
        resumeUrl: string | null;
        linkedinUrl: string | null;
        source: import(".prisma/client").$Enums.CandidateSource;
        experience: number;
        education: string | null;
        notes: string | null;
        assignedToId: string | null;
    })[]>;
    getCandidateById(id: string): Promise<({
        applications: ({
            interviews: {
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
                transcript: Prisma.JsonValue | null;
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
            }[];
            job: {
                id: string;
                title: string;
            };
            activities: ({
                performedBy: {
                    fullName: string;
                };
            } & {
                id: string;
                createdAt: Date;
                applicationId: string;
                fromStage: import(".prisma/client").$Enums.ApplicationStage | null;
                toStage: import(".prisma/client").$Enums.ApplicationStage;
                note: string | null;
                performedById: string;
            })[];
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
        assignedTo: {
            id: string;
            fullName: string;
        } | null;
    } & {
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        email: string;
        location: string | null;
        skills: string[];
        resumeUrl: string | null;
        linkedinUrl: string | null;
        source: import(".prisma/client").$Enums.CandidateSource;
        experience: number;
        education: string | null;
        notes: string | null;
        assignedToId: string | null;
    }) | null>;
    updateCandidate(id: string, data: any): Promise<{
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        email: string;
        location: string | null;
        skills: string[];
        resumeUrl: string | null;
        linkedinUrl: string | null;
        source: import(".prisma/client").$Enums.CandidateSource;
        experience: number;
        education: string | null;
        notes: string | null;
        assignedToId: string | null;
    }>;
    deleteCandidate(id: string): Promise<{
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        fullName: string;
        email: string;
        location: string | null;
        skills: string[];
        resumeUrl: string | null;
        linkedinUrl: string | null;
        source: import(".prisma/client").$Enums.CandidateSource;
        experience: number;
        education: string | null;
        notes: string | null;
        assignedToId: string | null;
    }>;
}
declare const _default: CandidateService;
export default _default;
//# sourceMappingURL=candidate.service.d.ts.map