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
        funnel[a.stage as keyof typeof funnel] = a._count;
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
      if (score <= 20) scoreDistribution[0]!.count++;
      else if (score <= 40) scoreDistribution[1]!.count++;
      else if (score <= 60) scoreDistribution[2]!.count++;
      else if (score <= 80) scoreDistribution[3]!.count++;
      else scoreDistribution[4]!.count++;
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

    // AI Insights - Best Performing Sources
    const sources = await prisma.candidate.groupBy({
      by: ['source'],
      _count: true,
      orderBy: { _count: { source: 'desc' } }
    });

    const bestPerformingSources = sources.map(s => ({
      name: s.source,
      value: s._count
    }));

    // AI Insights - Top Skills
    // Note: In Postgres, aggregating array elements efficiently requires raw queries, 
    // but for simplicity in MVP we fetch recent candidates and aggregate in memory.
    const recentCandidates = await prisma.candidate.findMany({
      select: { skills: true },
      take: 1000,
      orderBy: { createdAt: 'desc' }
    });

    const skillCounts: Record<string, number> = {};
    recentCandidates.forEach(c => {
      c.skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // Hiring Trends (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const appsOverTime = await prisma.application.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    });

    const trendsMap: Record<string, number> = {};
    appsOverTime.forEach(app => {
      const month = app.createdAt.toLocaleString('default', { month: 'short' });
      trendsMap[month] = (trendsMap[month] || 0) + 1;
    });

    const hiringTrends = Object.entries(trendsMap).map(([month, count]) => ({
      month,
      applications: count
    }));

    return {
      activeJobs,
      totalCandidates,
      funnel,
      upcomingInterviews,
      leaderboard,
      scoreDistribution,
      activityFeed,
      aiInsights: {
        bestPerformingSources,
        topSkills,
        hiringTrends,
        missingSkills: [] // In a full implementation, compare Candidate Skills vs Job Requirements
      }
    };
  }
}

export default new AtsAnalyticsService();
