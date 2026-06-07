export declare class EmailService {
    private transporter;
    constructor();
    private sendMail;
    sendCandidateConfirmation(email: string, name: string, jobTitle: string): Promise<void>;
    sendCandidateShortlist(email: string, name: string, jobTitle: string): Promise<void>;
    sendCandidateInterviewInvite(email: string, name: string, jobTitle: string, meetingUrl: string): Promise<void>;
    sendCandidateF2FInvite(email: string, name: string, jobTitle: string, meetingUrl: string, rounds: string[], scheduledAt: string | Date, durationMins: number, provider: string, interviewerName: string, notes?: string): Promise<void>;
    sendCandidateRejection(email: string, name: string, jobTitle: string): Promise<void>;
    sendRecruiterAlert(recruiterEmail: string, candidateName: string, jobTitle: string, score: number, stages: string): Promise<void>;
    sendOnboardingCredentialsEmail(email: string, name: string, employeeId: string, tempPassword: string): Promise<void>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=email.service.d.ts.map