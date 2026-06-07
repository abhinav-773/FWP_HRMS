import { Request, Response, NextFunction } from 'express';
import performanceService from '../services/performance.service';
import prisma from '../config/prisma.js';
import employeeBootstrapService from '../services/employeeBootstrap.service.js';

export const createGoal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId, title, description, targetDate } = req.body;
    const goal = await performanceService.createGoal(employeeId, title, description, targetDate);
    res.status(201).json({ success: true, data: goal, message: 'OKR Goal created successfully' });
  } catch (error: any) {
    next(error);
  }
};

export const getMyGoals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    const employee = await employeeBootstrapService.ensureEmployeeProfile(userId);

    const goals = await performanceService.getEmployeeGoals(employee.id);
    res.json({ success: true, data: goals || [] });
  } catch (error: any) {
    next(error);
  }
};

export const getEmployeeGoals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goals = await performanceService.getEmployeeGoals(req.params.employeeId as string);
    res.json({ success: true, data: goals || [] });
  } catch (error: any) {
    next(error);
  }
};

export const updateGoalProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { progress, status } = req.body;
    const updated = await performanceService.updateGoalProgress(req.params.goalId as string, parseFloat(progress), status);
    res.json({ success: true, data: updated, message: 'OKR Goal progress updated' });
  } catch (error: any) {
    next(error);
  }
};

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    const manager = await employeeBootstrapService.ensureEmployeeProfile(userId);

    const { employeeId, reviewPeriod, rating, comments } = req.body;
    const review = await performanceService.createReview(employeeId, manager.id, reviewPeriod, parseFloat(rating), comments);
    res.status(201).json({ success: true, data: review, message: 'Manager Performance Review saved successfully' });
  } catch (error: any) {
    next(error);
  }
};

export const getMyReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    const employee = await employeeBootstrapService.ensureEmployeeProfile(userId);

    const reviews = await performanceService.getEmployeeReviews(employee.id);
    res.json({ success: true, data: reviews || [] });
  } catch (error: any) {
    next(error);
  }
};

export const requestFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    const peer = await employeeBootstrapService.ensureEmployeeProfile(userId);

    const { employeeId, reviewPeriod, feedbackText, rating } = req.body;
    const feedback = await performanceService.requestFeedback(employeeId, peer.id, reviewPeriod, feedbackText, rating ? parseFloat(rating) : undefined);
    res.status(201).json({ success: true, data: feedback, message: 'Peer Feedback submitted successfully' });
  } catch (error: any) {
    next(error);
  }
};

export const getMyFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    const employee = await employeeBootstrapService.ensureEmployeeProfile(userId);

    const feedbacks = await performanceService.getEmployeeFeedback(employee.id);
    res.json({ success: true, data: feedbacks || [] });
  } catch (error: any) {
    next(error);
  }
};

export const generateAISummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { employeeId, reviewPeriod } = req.body;
    const summary = await performanceService.generateAISummary(employeeId, reviewPeriod);
    res.json({ success: true, data: summary || null });
  } catch (error: any) {
    next(error);
  }
};
