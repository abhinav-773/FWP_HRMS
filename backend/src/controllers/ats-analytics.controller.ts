import type { Request, Response } from 'express';
import atsAnalyticsService from '../services/ats-analytics.service';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const metrics = await atsAnalyticsService.getDashboardMetrics();
    res.json({ data: metrics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
