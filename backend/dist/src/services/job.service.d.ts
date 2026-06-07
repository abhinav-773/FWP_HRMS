export declare class JobService {
    createJob(data: any, userId: string): Promise<{
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        } | null;
        postedBy: {
            id: string;
            fullName: string;
        };
    } & {
        id: string;
        departmentId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobStatus;
        description: string;
        title: string;
        location: string | null;
        requirements: string;
        skills: string[];
        employmentType: import(".prisma/client").$Enums.EmploymentType;
        salaryMin: number | null;
        salaryMax: number | null;
        experienceRequired: number;
        aiSummary: string | null;
        openings: number;
        closingDate: Date | null;
        postedById: string;
    }>;
    getAllJobs(query: any): Promise<({
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        } | null;
        _count: {
            applications: number;
        };
        postedBy: {
            id: string;
            fullName: string;
        };
    } & {
        id: string;
        departmentId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobStatus;
        description: string;
        title: string;
        location: string | null;
        requirements: string;
        skills: string[];
        employmentType: import(".prisma/client").$Enums.EmploymentType;
        salaryMin: number | null;
        salaryMax: number | null;
        experienceRequired: number;
        aiSummary: string | null;
        openings: number;
        closingDate: Date | null;
        postedById: string;
    })[]>;
    getJobById(id: string): Promise<({
        department: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        } | null;
        _count: {
            applications: number;
        };
        postedBy: {
            id: string;
            fullName: string;
        };
        applications: ({
            candidate: {
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
    } & {
        id: string;
        departmentId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobStatus;
        description: string;
        title: string;
        location: string | null;
        requirements: string;
        skills: string[];
        employmentType: import(".prisma/client").$Enums.EmploymentType;
        salaryMin: number | null;
        salaryMax: number | null;
        experienceRequired: number;
        aiSummary: string | null;
        openings: number;
        closingDate: Date | null;
        postedById: string;
    }) | null>;
    updateJob(id: string, data: any): Promise<{
        id: string;
        departmentId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobStatus;
        description: string;
        title: string;
        location: string | null;
        requirements: string;
        skills: string[];
        employmentType: import(".prisma/client").$Enums.EmploymentType;
        salaryMin: number | null;
        salaryMax: number | null;
        experienceRequired: number;
        aiSummary: string | null;
        openings: number;
        closingDate: Date | null;
        postedById: string;
    }>;
    deleteJob(id: string): Promise<{
        id: string;
        departmentId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobStatus;
        description: string;
        title: string;
        location: string | null;
        requirements: string;
        skills: string[];
        employmentType: import(".prisma/client").$Enums.EmploymentType;
        salaryMin: number | null;
        salaryMax: number | null;
        experienceRequired: number;
        aiSummary: string | null;
        openings: number;
        closingDate: Date | null;
        postedById: string;
    }>;
}
declare const _default: JobService;
export default _default;
//# sourceMappingURL=job.service.d.ts.map