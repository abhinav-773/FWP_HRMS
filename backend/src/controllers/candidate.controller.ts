import type { Request, Response } from 'express';
import candidateService from '../services/candidate.service';

export const createCandidate = async (req: Request, res: Response) => {
  try {
    // If a resume was uploaded, multer puts it in req.file
    const data = { ...req.body };
    if (req.file) {
      data.resumeUrl = `/uploads/${req.file.filename}`;
    }
    
    // Skills might come as a comma-separated string if sent via FormData
    if (typeof data.skills === 'string') {
      data.skills = data.skills.split(',').map((s: string) => s.trim());
    }

    const candidate = await candidateService.createCandidate(data);
    res.status(201).json({ data: candidate, message: 'Candidate added successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const getCandidates = async (req: Request, res: Response) => {
  try {
    const candidates = await candidateService.getAllCandidates(req.query);
    res.json({ data: candidates });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCandidateById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const candidate = await candidateService.getCandidateById(id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ data: candidate });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCandidate = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = { ...req.body };
    if (req.file) {
      data.resumeUrl = `/uploads/${req.file.filename}`;
    }
    if (typeof data.skills === 'string') {
      data.skills = data.skills.split(',').map((s: string) => s.trim());
    }
    
    const candidate = await candidateService.updateCandidate(id, data);
    res.json({ data: candidate, message: 'Candidate updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCandidate = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await candidateService.deleteCandidate(id);
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
