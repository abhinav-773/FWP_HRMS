import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export class JobService {
  async createJob(data: any, userId: string) {
    let aiSummary = data.aiSummary || null;
    if (!aiSummary && process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('dummy')) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
        You are an expert recruiter. Write a compelling, punchy 2-3 sentence role summary for a job opening.
        Job Title: ${data.title}
        Job Description: ${data.description}
        Job Requirements: ${data.requirements}
        Do not output any introductory text or markdown formatting. Just return the raw summary.
        `;
        const response = await genai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        aiSummary = response.text?.trim() || null;
      } catch (err: any) {
        console.warn("Failed to generate AI role summary:", err.message);
      }
    }
    
    if (!aiSummary) {
      aiSummary = `Exciting opportunity for a ${data.title} to join our growing team. You will drive core initiatives and contribute to engineering/operational excellence.`;
    }

    return await prisma.jobPosting.create({
      data: {
        title: data.title,
        departmentId: data.departmentId,
        description: data.description,
        requirements: data.requirements,
        skills: data.skills || [],
        employmentType: data.employmentType || 'FULL_TIME',
        salaryMin: data.salaryMin ? parseFloat(data.salaryMin) : null,
        salaryMax: data.salaryMax ? parseFloat(data.salaryMax) : null,
        location: data.location,
        experienceRequired: data.experienceRequired ? parseInt(data.experienceRequired, 10) : 0,
        aiSummary,
        status: data.status || 'OPEN',
        openings: data.openings ? parseInt(data.openings, 10) : 1,
        postedById: userId,
        closingDate: data.closingDate ? new Date(data.closingDate) : null,
      },
      include: {
        department: true,
        postedBy: { select: { id: true, fullName: true } }
      }
    });
  }

  async getAllJobs(query: any) {
    const where: Prisma.JobPostingWhereInput = {};
    
    if (query.status) where.status = query.status;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    return await prisma.jobPosting.findMany({
      where,
      include: {
        department: true,
        postedBy: { select: { id: true, fullName: true } },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getJobById(id: string) {
    return await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        department: true,
        postedBy: { select: { id: true, fullName: true } },
        applications: {
          include: { candidate: true }
        },
        _count: { select: { applications: true } }
      }
    });
  }

  async updateJob(id: string, data: any) {
    return await prisma.jobPosting.update({
      where: { id },
      data: {
        title: data.title,
        departmentId: data.departmentId,
        description: data.description,
        requirements: data.requirements,
        skills: data.skills,
        employmentType: data.employmentType,
        salaryMin: data.salaryMin ? parseFloat(data.salaryMin) : null,
        salaryMax: data.salaryMax ? parseFloat(data.salaryMax) : null,
        location: data.location,
        experienceRequired: data.experienceRequired ? parseInt(data.experienceRequired, 10) : undefined,
        aiSummary: data.aiSummary,
        status: data.status,
        openings: data.openings ? parseInt(data.openings, 10) : undefined,
        closingDate: data.closingDate ? new Date(data.closingDate) : null,
      }
    });
  }

  async deleteJob(id: string) {
    return await prisma.jobPosting.delete({
      where: { id }
    });
  }
}

export default new JobService();
