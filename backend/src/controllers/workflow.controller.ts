import { Request, Response } from 'express';
import workflowService from '../services/workflow.service';

export const getRules = async (req: Request, res: Response) => {
  try {
    const rules = await workflowService.getRules();
    res.json({ data: rules });
  } catch (error: any) {
    console.error('getRules error:', error);
    res.status(500).json({ error: 'Failed to fetch workflow rules' });
  }
};

export const toggleRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const rule = await workflowService.toggleRule(id as string, isActive);
    res.json({ data: rule, message: 'Workflow rule updated successfully' });
  } catch (error: any) {
    console.error('toggleRule error:', error);
    res.status(500).json({ error: 'Failed to toggle workflow rule' });
  }
};

export const triggerTestEvent = async (req: Request, res: Response) => {
  try {
    const { event, userId, employeeProfileId } = req.body;
    if (!event || !userId) {
      return res.status(400).json({ error: 'event and userId are required' });
    }
    await workflowService.executeEvent(event, { userId, employeeProfileId });
    res.json({ message: `Executed event: ${event} successfully` });
  } catch (error: any) {
    console.error('triggerTestEvent error:', error);
    res.status(500).json({ error: 'Failed to execute test event' });
  }
};
