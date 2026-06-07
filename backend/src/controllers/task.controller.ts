import { Request, Response } from 'express';
import taskService from '../services/task.service';

export const assignTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const task = await taskService.assignTask(userId, req.body);
    res.status(201).json({ data: task, message: 'Task assigned successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTaskProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const id = req.params.id as string;
    const task = await taskService.updateTaskProgress(userId, id, req.body);
    res.json({ data: task, message: 'Task updated successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const tasks = await taskService.getMyTasks(userId);
    res.json({ data: tasks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTeamTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const tasks = await taskService.getTeamTasks(userId);
    res.json({ data: tasks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
