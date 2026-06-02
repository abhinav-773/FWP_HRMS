import { Request, Response } from 'express';
import payrollService from '../services/payroll.service';

export const generatePayroll = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) return res.status(400).json({ error: 'Month and year are required' });

    const payrolls = await payrollService.generatePayroll(month, year);
    res.status(201).json({ data: payrolls, message: `Generated ${payrolls.length} payroll records.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyPayslips = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const slips = await payrollService.getMyPayslips(userId);
    res.json({ data: slips });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsPaid = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const slip = await payrollService.markAsPaid(id);
    res.json({ data: slip, message: 'Payroll marked as PAID' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
