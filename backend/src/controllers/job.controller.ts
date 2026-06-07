import type { Request, Response } from 'express';
import jobService from '../services/job.service';

export const createJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const job = await jobService.createJob(req.body, userId);
    res.status(201).json({ data: job, message: 'Job posting created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await jobService.getAllJobs(req.query);
    res.json({ data: jobs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const job = await jobService.getJobById(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ data: job });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const job = await jobService.updateJob(id, req.body);
    res.json({ data: job, message: 'Job updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await jobService.deleteJob(id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
