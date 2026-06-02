import { Request, Response } from 'express';
import attendanceService from '../services/attendance.service';

export const clockIn = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { location } = req.body;
    const record = await attendanceService.clockIn(userId, location);
    res.status(201).json({ data: record, message: 'Clocked in successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const clockOut = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const record = await attendanceService.clockOut(userId);
    res.json({ data: record, message: 'Clocked out successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { month, year } = req.query;
    
    const m = month ? parseInt(month as string) : new Date().getMonth() + 1;
    const y = year ? parseInt(year as string) : new Date().getFullYear();

    const stats = await attendanceService.getMyStats(userId, m, y);
    res.json({ data: stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
