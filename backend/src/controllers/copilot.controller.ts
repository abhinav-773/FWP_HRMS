import { Request, Response } from 'express';
import prisma from '../config/prisma';

// ---------------------------------------------------------
// HR & Employee Queries
// ---------------------------------------------------------

export const getLowAttendance = async (req: Request, res: Response) => {
  try {
    // Mock logic for demo purposes: find users with attendance < 90%
    // In a real app, this would aggregate the Attendance table
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, fullName: true, email: true },
      take: 5
    });
    
    // Append mock attendance data
    const lowAttendance = employees.map((emp, index) => ({
      ...emp,
      attendanceRate: 85 - index,
      absencesThisMonth: 3 + index
    }));
    
    res.json(lowAttendance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPayrollSummary = async (req: Request, res: Response) => {
  try {
    // In a real app, aggregate Payroll table
    res.json({
      month: 'November 2026',
      totalExpenditure: 450000,
      departmentBreakdown: {
        Engineering: 200000,
        Sales: 150000,
        HR: 50000,
        Marketing: 50000
      },
      anomalies: [
        "Unusually high overtime in Engineering (+15%)"
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    // In a real app, query LeaveRequest where status = PENDING
    const requests = [
      { id: '1', employee: 'John Doe', type: 'SICK', days: 2, status: 'PENDING' },
      { id: '2', employee: 'Jane Smith', type: 'ANNUAL', days: 5, status: 'PENDING' }
    ];
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------------------------------------
// ATS Queries
// ---------------------------------------------------------

export const getTopCandidates = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.query;
    
    let whereClause: any = { stage: { not: 'REJECTED' } };
    if (jobId) whereClause.jobId = jobId;

    const topApps = await prisma.application.findMany({
      where: whereClause,
      include: {
        candidate: { select: { fullName: true, skills: true, experience: true } },
        job: { select: { title: true } }
      },
      orderBy: { aiScore: 'desc' },
      take: 5
    });

    const formatted = topApps.map(app => ({
      candidateName: app.candidate.fullName,
      jobTitle: app.job.title,
      aiScore: app.aiScore,
      skills: app.candidate.skills,
      experienceYears: app.candidate.experience
    }));
    
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOpenJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.jobPosting.findMany({
      where: { status: 'OPEN' },
      select: { id: true, title: true, department: { select: { name: true } }, openings: true }
    });
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createJobPosting = async (req: Request, res: Response) => {
  try {
    const { title, description, requirements, skills, departmentId } = req.body;
    const userId = (req as any).user.userId;

    const job = await prisma.jobPosting.create({
      data: {
        title,
        description,
        requirements,
        skills: skills || [],
        status: 'OPEN',
        postedById: userId,
        departmentId: departmentId || null
      }
    });
    
    res.json({ message: "Job created successfully", job });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
