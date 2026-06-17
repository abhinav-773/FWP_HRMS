import { GoogleGenAI } from '@google/genai';
import prisma from '../../config/prisma';
import { geminiGenerateJSON } from './gemini.service';
// ─────────────────────────────────────────────────────────
// HR / RECRUITER ACTIONS
// ─────────────────────────────────────────────────────────
async function hrShowTopCandidates(params) {
    const skill = params.skill || null;
    const limit = params.limit || 10;
    let whereClause = { stage: { not: 'REJECTED' } };
    const applications = await prisma.application.findMany({
        where: whereClause,
        include: {
            candidate: { select: { fullName: true, email: true, skills: true, experience: true, source: true } },
            job: { select: { title: true } }
        },
        orderBy: { overallAIScore: 'desc' },
        take: limit
    });
    // Filter by skill if provided
    let filtered = applications;
    if (skill) {
        const skillLower = skill.toLowerCase();
        filtered = applications.filter(app => app.candidate.skills.some((s) => s.toLowerCase().includes(skillLower)) ||
            app.job.title.toLowerCase().includes(skillLower));
    }
    const rows = filtered.map((app, i) => ({
        '#': i + 1,
        'Candidate': app.candidate.fullName,
        'Job': app.job.title,
        'AI Score': app.overallAIScore ?? app.aiScore ?? 'N/A',
        'Experience': `${app.candidate.experience} yrs`,
        'Skills': app.candidate.skills.slice(0, 3).join(', ') || '—',
        'Stage': app.stage,
        'Source': app.candidate.source,
    }));
    return {
        type: 'data_table',
        title: skill ? `Top ${rows.length} Candidates — ${skill}` : `Top ${rows.length} Candidates by AI Score`,
        description: `Ranked by AI evaluation score. ${rows.length} candidates found.`,
        columns: ['#', 'Candidate', 'Job', 'AI Score', 'Experience', 'Skills', 'Stage', 'Source'],
        rows,
        metadata: { total: rows.length }
    };
}
async function hrGenerateJD(params) {
    const { role: jobRole } = params;
    const prompt = `Generate a professional, modern Job Description for the role: "${jobRole}".

Return valid JSON with:
{
  "title": "...",
  "about": "2-3 sentence company overview intro",
  "responsibilities": ["..."],
  "requirements": ["..."],
  "niceToHave": ["..."],
  "benefits": ["..."]
}

Make it enterprise-grade, compelling, and specific. Do NOT wrap in markdown code fences.`;
    try {
        const jd = await geminiGenerateJSON(prompt);
        let md = `## ${jd.title}\n\n`;
        md += `${jd.about}\n\n`;
        md += `### Responsibilities\n${(jd.responsibilities || []).map((r) => `- ${r}`).join('\n')}\n\n`;
        md += `### Requirements\n${(jd.requirements || []).map((r) => `- ${r}`).join('\n')}\n\n`;
        md += `### Nice to Have\n${(jd.niceToHave || []).map((r) => `- ${r}`).join('\n')}\n\n`;
        md += `### Benefits\n${(jd.benefits || []).map((r) => `- ${r}`).join('\n')}`;
        return {
            type: 'generated_content',
            title: `Generated JD: ${jd.title}`,
            description: 'AI-generated job description ready for publishing.',
            content: md,
            metadata: { rawJD: jd }
        };
    }
    catch (error) {
        return {
            type: 'text',
            title: 'JD Generation Failed',
            content: 'Could not generate the job description. The AI service may be temporarily unavailable.'
        };
    }
}
async function hrMoveShortlistedToInterview(_params) {
    const shortlisted = await prisma.application.findMany({
        where: { stage: 'SHORTLISTED' },
        include: { candidate: { select: { fullName: true } }, job: { select: { title: true } } }
    });
    if (shortlisted.length === 0) {
        return {
            type: 'text',
            title: 'No Shortlisted Candidates',
            content: 'There are currently no candidates in the **SHORTLISTED** stage to move.'
        };
    }
    await prisma.application.updateMany({
        where: { stage: 'SHORTLISTED' },
        data: { stage: 'INTERVIEW' }
    });
    const rows = shortlisted.map((app, i) => ({
        '#': i + 1,
        'Candidate': app.candidate.fullName,
        'Job': app.job.title,
        'Previous Stage': 'SHORTLISTED',
        'New Stage': 'INTERVIEW'
    }));
    return {
        type: 'confirmation',
        title: `✅ Moved ${shortlisted.length} Candidate(s) to Interview`,
        description: 'The following candidates have been advanced in the pipeline.',
        columns: ['#', 'Candidate', 'Job', 'Previous Stage', 'New Stage'],
        rows,
        metadata: { moved: shortlisted.length }
    };
}
async function hrSummarizeATS(_params) {
    const [totalJobs, openJobs, totalCandidates, totalApps] = await Promise.all([
        prisma.jobPosting.count(),
        prisma.jobPosting.count({ where: { status: 'OPEN' } }),
        prisma.candidate.count(),
        prisma.application.count()
    ]);
    const stages = await prisma.application.groupBy({
        by: ['stage'],
        _count: true
    });
    const funnel = {};
    stages.forEach(s => { funnel[s.stage] = s._count; });
    const scheduledInterviews = await prisma.interview.count({ where: { status: 'SCHEDULED' } });
    const topScored = await prisma.application.findMany({
        where: { overallAIScore: { not: null } },
        orderBy: { overallAIScore: 'desc' },
        take: 3,
        include: { candidate: { select: { fullName: true } }, job: { select: { title: true } } }
    });
    let md = `### ATS Pipeline Summary\n\n`;
    md += `| Metric | Value |\n|---|---|\n`;
    md += `| Total Job Postings | ${totalJobs} |\n`;
    md += `| Open Positions | ${openJobs} |\n`;
    md += `| Total Candidates | ${totalCandidates} |\n`;
    md += `| Total Applications | ${totalApps} |\n`;
    md += `| Scheduled Interviews | ${scheduledInterviews} |\n\n`;
    md += `### Pipeline Funnel\n`;
    md += Object.entries(funnel).map(([stage, count]) => `- **${stage}**: ${count}`).join('\n');
    md += `\n\n`;
    if (topScored.length > 0) {
        md += `### Top AI-Scored Candidates\n`;
        topScored.forEach((app, i) => {
            md += `${i + 1}. **${app.candidate.fullName}** — ${app.job.title} (Score: ${app.overallAIScore})\n`;
        });
    }
    return {
        type: 'generated_content',
        title: 'ATS Pipeline Summary',
        description: `${openJobs} open positions, ${totalCandidates} candidates tracked.`,
        content: md,
        metadata: { totalJobs, openJobs, totalCandidates, totalApps, funnel }
    };
}
// ─────────────────────────────────────────────────────────
// MANAGER ACTIONS
// ─────────────────────────────────────────────────────────
async function mgrShowLowProductivity(params) {
    // Use TeamAnalytics or Attendance data to find low-performing employees
    const employees = await prisma.employeeProfile.findMany({
        include: {
            user: { select: { fullName: true, email: true } },
            department: { select: { name: true } },
            designation: { select: { title: true } }
        },
        take: 20
    });
    // Get attendance stats for each employee
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const attendanceAgg = await prisma.attendance.groupBy({
        by: ['employeeId'],
        where: { date: { gte: thirtyDaysAgo } },
        _count: { id: true },
        _avg: { workHours: true }
    });
    const attendanceMap = new Map(attendanceAgg.map(a => [a.employeeId, { days: a._count.id, avgHours: a._avg.workHours || 0 }]));
    const rows = employees
        .map((emp, i) => {
        const att = attendanceMap.get(emp.id) || { days: 0, avgHours: 0 };
        return {
            '#': i + 1,
            'Employee': emp.user.fullName,
            'Department': emp.department?.name || 'N/A',
            'Role': emp.designation?.title || 'N/A',
            'Days Present (30d)': att.days,
            'Avg Hours/Day': att.avgHours ? Number(att.avgHours).toFixed(1) : '0.0',
            '_score': att.days // for sorting
        };
    })
        .sort((a, b) => a._score - b._score)
        .slice(0, 10)
        .map(({ _score, ...rest }, i) => ({ ...rest, '#': i + 1 }));
    return {
        type: 'data_table',
        title: 'Employees with Low Activity (Last 30 Days)',
        description: 'Sorted by least attendance days. Consider following up on engagement.',
        columns: ['#', 'Employee', 'Department', 'Role', 'Days Present (30d)', 'Avg Hours/Day'],
        rows
    };
}
async function mgrWeeklyPerformanceReport(params) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [totalAttendance, pendingLeaves, completedTasks, pendingTasks] = await Promise.all([
        prisma.attendance.count({ where: { date: { gte: sevenDaysAgo } } }),
        prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
        prisma.teamTask.count({ where: { status: 'COMPLETED', updatedAt: { gte: sevenDaysAgo } } }),
        prisma.teamTask.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } })
    ]);
    let md = `### Weekly Team Performance Report\n`;
    md += `*Period: ${sevenDaysAgo.toLocaleDateString()} — ${new Date().toLocaleDateString()}*\n\n`;
    md += `| Metric | Value |\n|---|---|\n`;
    md += `| Total Check-ins | ${totalAttendance} |\n`;
    md += `| Pending Leave Requests | ${pendingLeaves} |\n`;
    md += `| Tasks Completed This Week | ${completedTasks} |\n`;
    md += `| Tasks Still Pending | ${pendingTasks} |\n\n`;
    if (pendingLeaves > 0) {
        md += `> ⚠️ **${pendingLeaves} leave request(s)** require your attention.\n\n`;
    }
    if (pendingTasks > 5) {
        md += `> 📊 Task backlog is growing. Consider redistributing workload.\n`;
    }
    return {
        type: 'generated_content',
        title: 'Weekly Performance Report',
        description: `Week of ${sevenDaysAgo.toLocaleDateString()}`,
        content: md,
        metadata: { totalAttendance, pendingLeaves, completedTasks, pendingTasks }
    };
}
// ─────────────────────────────────────────────────────────
// EMPLOYEE ACTIONS
// ─────────────────────────────────────────────────────────
async function empShowPendingTasks(params) {
    const { userId } = params;
    // Find the employee profile for this user
    const profile = await prisma.employeeProfile.findUnique({
        where: { userId }
    });
    if (!profile) {
        return {
            type: 'text',
            title: 'No Employee Profile',
            content: 'Your employee profile has not been set up yet. Please contact HR.'
        };
    }
    const tasks = await prisma.teamTask.findMany({
        where: {
            assignedToEmployeeId: profile.id,
            status: { in: ['PENDING', 'IN_PROGRESS'] }
        },
        orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
        take: 15
    });
    if (tasks.length === 0) {
        return {
            type: 'text',
            title: '🎉 No Pending Tasks',
            content: 'You have no pending tasks right now. Great job staying on top of your work!'
        };
    }
    const rows = tasks.map((t, i) => ({
        '#': i + 1,
        'Task': t.title,
        'Priority': t.priority,
        'Status': t.status,
        'Progress': `${t.progress}%`,
        'Due Date': t.dueDate.toLocaleDateString(),
    }));
    return {
        type: 'data_table',
        title: `Your Pending Tasks (${tasks.length})`,
        description: 'Sorted by priority and due date.',
        columns: ['#', 'Task', 'Priority', 'Status', 'Progress', 'Due Date'],
        rows
    };
}
async function empSummarizePerformance(params) {
    const { userId } = params;
    const profile = await prisma.employeeProfile.findUnique({
        where: { userId }
    });
    if (!profile) {
        return { type: 'text', title: 'No Profile', content: 'Employee profile not found.' };
    }
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [attendanceCount, leavesThisMonth, completedTasks, totalTasks] = await Promise.all([
        prisma.attendance.count({
            where: { employeeId: profile.id, date: { gte: thirtyDaysAgo } }
        }),
        prisma.leaveRequest.count({
            where: { employeeId: profile.id, createdAt: { gte: thirtyDaysAgo } }
        }),
        prisma.teamTask.count({
            where: { assignedToEmployeeId: profile.id, status: 'COMPLETED', updatedAt: { gte: thirtyDaysAgo } }
        }),
        prisma.teamTask.count({
            where: { assignedToEmployeeId: profile.id }
        })
    ]);
    // Check for performance reviews
    const latestReview = await prisma.performanceReview.findFirst({
        where: { employeeId: profile.id },
        orderBy: { createdAt: 'desc' }
    });
    let md = `### Your Monthly Performance Summary\n`;
    md += `*Last 30 Days*\n\n`;
    md += `| Metric | Value |\n|---|---|\n`;
    md += `| Days Present | ${attendanceCount} |\n`;
    md += `| Leave Requests | ${leavesThisMonth} |\n`;
    md += `| Tasks Completed | ${completedTasks} |\n`;
    md += `| Total Tasks Assigned | ${totalTasks} |\n`;
    if (latestReview) {
        md += `| Latest Review Score | ${latestReview.overallRating}/5 |\n`;
        md += `| Review Period | ${latestReview.reviewPeriod} |\n`;
    }
    md += `\n`;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    if (completionRate >= 80) {
        md += `> 🌟 **Excellent!** Your task completion rate is ${completionRate}%. Keep it up!\n`;
    }
    else if (completionRate >= 50) {
        md += `> 📊 Your task completion rate is ${completionRate}%. Good progress — stay focused!\n`;
    }
    else {
        md += `> ⚠️ Your task completion rate is ${completionRate}%. Consider prioritizing overdue items.\n`;
    }
    return {
        type: 'generated_content',
        title: 'Monthly Performance Summary',
        description: `${attendanceCount} days present, ${completedTasks} tasks completed.`,
        content: md,
        metadata: { attendanceCount, leavesThisMonth, completedTasks, totalTasks, completionRate }
    };
}
// ─────────────────────────────────────────────────────────
// INTENT DETECTION — Uses Gemini to classify user query
// ─────────────────────────────────────────────────────────
const ACTION_REGISTRY = {
    // HR Actions
    HR_SHOW_TOP_CANDIDATES: { fn: hrShowTopCandidates, roles: ['HR_RECRUITER', 'SUPER_ADMIN'] },
    HR_GENERATE_JD: { fn: hrGenerateJD, roles: ['HR_RECRUITER', 'SUPER_ADMIN'] },
    HR_MOVE_SHORTLISTED: { fn: hrMoveShortlistedToInterview, roles: ['HR_RECRUITER', 'SUPER_ADMIN'] },
    HR_SUMMARIZE_ATS: { fn: hrSummarizeATS, roles: ['HR_RECRUITER', 'SUPER_ADMIN'] },
    // Manager Actions
    MGR_LOW_PRODUCTIVITY: { fn: mgrShowLowProductivity, roles: ['SENIOR_MANAGER', 'SUPER_ADMIN'] },
    MGR_WEEKLY_REPORT: { fn: mgrWeeklyPerformanceReport, roles: ['SENIOR_MANAGER', 'SUPER_ADMIN'] },
    // Employee Actions
    EMP_PENDING_TASKS: { fn: empShowPendingTasks, roles: ['EMPLOYEE', 'SENIOR_MANAGER', 'SUPER_ADMIN'] },
    EMP_PERFORMANCE_SUMMARY: { fn: empSummarizePerformance, roles: ['EMPLOYEE', 'SENIOR_MANAGER', 'SUPER_ADMIN'] },
};
const INTENT_DETECTION_PROMPT = `You are an intent classifier for an HRMS AI Copilot. Given a user's message, classify it into one of these actions OR return NONE if it's a general conversational query.

Available Actions:
- HR_SHOW_TOP_CANDIDATES: User wants to see top-ranked candidates. Extract "skill" if mentioned (e.g., "React", "Python"). Extract "limit" if mentioned.
- HR_GENERATE_JD: User wants to generate a job description. Extract "role" (the job title).
- HR_MOVE_SHORTLISTED: User wants to move shortlisted candidates to interview stage.
- HR_SUMMARIZE_ATS: User wants ATS pipeline summary/analytics/stats.
- MGR_LOW_PRODUCTIVITY: User wants to see employees with low productivity/attendance.
- MGR_WEEKLY_REPORT: User wants a weekly team performance report.
- EMP_PENDING_TASKS: User wants to see their pending/active tasks.
- EMP_PERFORMANCE_SUMMARY: User wants a summary of their own performance this month.
- NONE: General question, policy question, or conversation that doesn't map to a specific action.

Return ONLY valid JSON (no markdown, no code fences):
{"action": "ACTION_ID_OR_NONE", "params": {"key": "value"}, "confidence": 0.0-1.0}

Examples:
- "Show top 10 React candidates" → {"action": "HR_SHOW_TOP_CANDIDATES", "params": {"skill": "React", "limit": 10}, "confidence": 0.95}
- "Generate JD for AI Engineer" → {"action": "HR_GENERATE_JD", "params": {"role": "AI Engineer"}, "confidence": 0.95}
- "What is the WFH policy?" → {"action": "NONE", "params": {}, "confidence": 0.9}
`;
export class CopilotActionEngine {
    async processMessage(userId, role, fullName, message, context) {
        // Step 1: Detect intent
        const intent = await this.detectIntent(message);
        // Step 2: If an action was detected with high confidence, execute it
        if (intent.action !== 'NONE' &&
            intent.confidence >= 0.7 &&
            intent.action in ACTION_REGISTRY) {
            const actionDef = ACTION_REGISTRY[intent.action];
            // Role-based access check
            if (!actionDef.roles.includes(role)) {
                return {
                    actionExecuted: false,
                    actionId: intent.action,
                    result: {
                        type: 'text',
                        title: '🔒 Access Denied',
                        content: `You don't have permission to execute this action. Required roles: ${actionDef.roles.join(', ')}.`
                    }
                };
            }
            // Execute the action
            const result = await actionDef.fn({ ...intent.params, userId });
            return {
                actionExecuted: true,
                actionId: intent.action,
                result
            };
        }
        // Step 3: Fall back to conversational AI
        const conversationalResponse = await this.generateConversationalResponse(userId, role, fullName, message, context);
        return {
            actionExecuted: false,
            actionId: null,
            result: {
                type: 'text',
                title: '',
                content: conversationalResponse
            }
        };
    }
    async detectIntent(message) {
        try {
            const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
            const response = await genai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${INTENT_DETECTION_PROMPT}\n\nUser message: "${message}"`
            });
            const raw = (response.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(raw);
        }
        catch (error) {
            console.error('[CopilotActionEngine] Intent detection failed:', error);
            return { action: 'NONE', params: {}, confidence: 0 };
        }
    }
    async generateConversationalResponse(userId, role, fullName, message, context) {
        try {
            let roleContext = '';
            let dbData = '';
            if (role === 'EMPLOYEE') {
                roleContext = 'You are the HireMind Employee Copilot. Guide the employee through company policies (WFH, Leaves, Payroll) and help them navigate the portal.';
                const userStats = await prisma.user.findUnique({
                    where: { id: userId },
                    include: { EmployeeProfile: { select: { department: true } } }
                });
                if (userStats?.EmployeeProfile) {
                    dbData = `Employee Department: ${userStats.EmployeeProfile.department?.name || 'N/A'}.`;
                }
            }
            else if (role === 'HR_RECRUITER' || role === 'SUPER_ADMIN') {
                roleContext = 'You are the HireMind HR & Admin Copilot. Assist with drafting Job Descriptions, creating interview questions, and summarizing ATS pipeline metrics.';
                const activeJobs = await prisma.jobPosting.count({ where: { status: 'OPEN' } });
                const pendingInterviews = await prisma.interview.count({ where: { status: 'SCHEDULED' } });
                dbData = `Live ATS Metrics: ${activeJobs} Active Jobs, ${pendingInterviews} Scheduled Interviews.`;
            }
            else if (role === 'SENIOR_MANAGER') {
                roleContext = 'You are the HireMind Manager Copilot. Assist the manager with team performance insights, leave approvals, and task management.';
            }
            const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
            const response = await genai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${roleContext}\n\nSystem Data: ${dbData}\n\nUser: ${fullName} (${role})\nCurrent Page: ${context}\n\nUser Query: "${message}"\n\nRespond professionally and concisely in Markdown format. If you provide navigation advice, use HireMind platform pages (e.g., /leaves, /attendance, /hr/ats).`
            });
            return response.text || 'I was unable to generate a response. Please try again.';
        }
        catch (error) {
            console.error('[CopilotActionEngine] Conversational fallback error:', error);
            return "I'm having trouble connecting to the AI service right now. Please try again shortly.";
        }
    }
}
export default new CopilotActionEngine();
//# sourceMappingURL=copilotActionEngine.js.map