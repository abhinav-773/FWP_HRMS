import prisma from '../config/prisma';
export class AtsAnalyticsService {
    async getDashboardMetrics() {
        const activeJobs = await prisma.jobPosting.count({ where: { status: 'OPEN' } });
        const totalCandidates = await prisma.candidate.count();
        // Funnel
        const apps = await prisma.application.groupBy({
            by: ['stage'],
            _count: true
        });
        const funnel = {
            APPLIED: 0,
            SCREENING: 0,
            INTERVIEW: 0,
            SHORTLISTED: 0,
            HIRED: 0,
            REJECTED: 0
        };
        apps.forEach(a => {
            if (a.stage in funnel) {
                funnel[a.stage] = a._count;
            }
        });
        // Upcoming Interviews
        const upcomingInterviews = await prisma.interview.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledAt: { gte: new Date() }
            },
            include: {
                application: {
                    include: { candidate: { select: { fullName: true } } }
                },
                interviewer: { select: { fullName: true } }
            },
            orderBy: { scheduledAt: 'asc' },
            take: 5
        });
        // Leaderboard (Top 5 Candidates by AI Score)
        const leaderboard = await prisma.application.findMany({
            where: { aiScore: { not: null } },
            orderBy: { aiScore: 'desc' },
            take: 5,
            include: {
                candidate: { select: { fullName: true, email: true } },
                job: { select: { title: true } }
            }
        });
        // Score Distribution (mocked ranges based on actual data if available)
        const scoredApps = await prisma.application.findMany({
            where: { aiScore: { not: null } },
            select: { aiScore: true }
        });
        const scoreDistribution = [
            { range: '0-20', count: 0 },
            { range: '21-40', count: 0 },
            { range: '41-60', count: 0 },
            { range: '61-80', count: 0 },
            { range: '81-100', count: 0 }
        ];
        scoredApps.forEach(app => {
            const score = app.aiScore || 0;
            if (score <= 20)
                scoreDistribution[0].count++;
            else if (score <= 40)
                scoreDistribution[1].count++;
            else if (score <= 60)
                scoreDistribution[2].count++;
            else if (score <= 80)
                scoreDistribution[3].count++;
            else
                scoreDistribution[4].count++;
        });
        // Recent Activity Feed
        const activityFeed = await prisma.applicationActivity.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                application: {
                    include: {
                        candidate: { select: { fullName: true } },
                        job: { select: { title: true } }
                    }
                },
                performedBy: { select: { fullName: true } }
            }
        });
        return {
            activeJobs,
            totalCandidates,
            funnel,
            upcomingInterviews,
            leaderboard,
            scoreDistribution,
            activityFeed
        };
    }
}
export default new AtsAnalyticsService();
//# sourceMappingURL=ats-analytics.service.js.map