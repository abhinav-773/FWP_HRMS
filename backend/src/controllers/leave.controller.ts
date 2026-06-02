import { Request, Response } from 'express';
import leaveService from '../services/leave.service';

export const applyLeave = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const leave = await leaveService.applyLeave(userId, req.body);
    res.status(201).json({ data: leave, message: 'Leave request submitted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyLeaves = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const leaves = await leaveService.getMyLeaves(userId);
    res.json({ data: leaves });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTeamLeaves = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const leaves = await leaveService.getTeamLeaves(userId);
    res.json({ data: leaves });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const processLeave = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const leave = await leaveService.processLeave(userId, id, status);
    res.json({ data: leave, message: `Leave request ${status.toLowerCase()}` });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
