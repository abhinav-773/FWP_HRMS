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
    sendDemoRequestNotification(adminEmail: string, name: string, company: string, message: string): Promise<void>;
    sendCandidateOffer(email: string, name: string, jobTitle: string, offerUrl: string): Promise<void>;
    sendCandidateHired(email: string, name: string, jobTitle: string): Promise<void>;
    sendPasswordReset(email: string, name: string, resetToken: string): Promise<void>;
    sendLeaveApproval(email: string, name: string, leaveType: string, startDate: Date, endDate: Date): Promise<void>;
    sendLeaveRejection(email: string, name: string, leaveType: string, startDate: Date, endDate: Date, reason: string): Promise<void>;
    sendTaskAssignment(email: string, name: string, taskTitle: string, dueDate: Date): Promise<void>;
    sendCandidateInterviewReady(hrEmail: string, candidateName: string, jobTitle: string, analysisUrl: string): Promise<void>;
    sendCandidateHiredAlert(hrEmail: string, candidateName: string, jobTitle: string): Promise<void>;
    sendLeaveApprovalRequest(managerEmail: string, managerName: string, employeeName: string, leaveType: string, startDate: Date, endDate: Date): Promise<void>;
    sendTaskCompletionAlert(managerEmail: string, managerName: string, employeeName: string, taskTitle: string): Promise<void>;
    sendInterviewReminder(interviewerEmail: string, interviewerName: string, candidateName: string, scheduledAt: Date, meetingUrl: string): Promise<void>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=email.service.d.ts.map