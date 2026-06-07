import type { Request, Response } from 'express';
import prisma from '../config/prisma';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q || q.length < 2) {
      return res.json({ results: [] });
    }

    const results: any[] = [];

    // Search Employees/Users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ]
      },
      take: 5,
      select: { id: true, fullName: true, email: true, role: true }
    });
    users.forEach(u => results.push({
      type: 'employee',
      title: u.fullName,
      subtitle: `${u.email} • ${u.role}`,
      id: u.id
    }));

    // Search Candidates
    const candidates = await prisma.candidate.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ]
      },
      take: 5,
      select: { id: true, fullName: true, email: true }
    });
    candidates.forEach(c => results.push({
      type: 'candidate',
      title: c.fullName,
      subtitle: c.email,
      id: c.id
    }));

    // Search Jobs
    const jobs = await prisma.jobPosting.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { department: { name: { contains: q, mode: 'insensitive' } } },
        ]
      },
      take: 5,
      select: { id: true, title: true, department: { select: { name: true } }, status: true }
    });
    jobs.forEach(j => results.push({
      id: j.id,
      type: 'job',
      title: j.title,
      subtitle: j.department ? j.department.name : '',
      url: `/hr/jobs/${j.id}`,
    }));

    // Search Interviews
    const interviews = await prisma.interview.findMany({
      where: {
        application: {
          candidate: {
            fullName: { contains: q, mode: 'insensitive' }
          }
        }
      },
      take: 5,
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        application: {
          select: {
            candidate: { select: { fullName: true } },
            job: { select: { title: true } }
          }
        }
      }
    });
    interviews.forEach(i => results.push({
      type: 'interview',
      title: i.application?.candidate?.fullName || 'Interview',
      subtitle: `${i.application?.job?.title || ''} • ${i.status}`,
      id: i.id
    }));

    res.json({ results: results.slice(0, 15) });
  } catch (error: any) {
    console.error('Search error:', error.message);
    res.json({ results: [] });
  }
};
