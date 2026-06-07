import { Request, Response } from 'express';
import attendanceService from '../services/attendance.service';

export const clockIn = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { location, workFromHome } = req.body;
    const record = await attendanceService.clockIn(userId, location, !!workFromHome);
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

export const toggleBreak = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const result = await attendanceService.toggleBreak(userId);
    res.json({ data: result, message: result.onBreak ? 'Break started' : 'Break ended' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getBreakStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const status = await attendanceService.getBreakStatus(userId);
    res.json({ data: status });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getBurnoutCheck = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const check = await attendanceService.getBurnoutCheck(userId);
    res.json({ data: check });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
