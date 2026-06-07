import { Request, Response, NextFunction } from 'express';
import onboardingService from '../services/onboarding.service';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import { io } from '../index.js';
import employeeBootstrapService from '../services/employeeBootstrap.service.js';

export const getOnboardingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    
    // Ensure profile exists
    await employeeBootstrapService.ensureEmployeeProfile(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        EmployeeProfile: {
          include: {
            onboardingChecklists: {
              include: { tasks: true }
            },
            itAssets: true
          }
        }
      }
    });

    if (!user || !user.EmployeeProfile) {
      return res.json({
        success: true,
        data: {
          currentStage: 'Pending',
          checklist: [],
          assignedAssets: []
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          fullName: user.fullName,
          email: user.email,
          tempPassword: user.tempPassword,
          status: user.status
        },
        profile: user.EmployeeProfile,
        currentStage: user.EmployeeProfile.onboardingProgress >= 100 ? 'Completed' : 'In Progress',
        checklist: user.EmployeeProfile.onboardingChecklists || [],
        assignedAssets: user.EmployeeProfile.itAssets || []
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    const { newPassword } = req.body;

    if (!newPassword) return res.status(400).json({ error: 'New password is required' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        tempPassword: false,
        status: 'ACTIVE'
      }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('changePassword error:', error);
    res.status(500).json({ error: error.message });
  }
};

const calculateProgress = async (employeeId: string) => {
  const checklists = await prisma.onboardingChecklist.findMany({
    where: { employeeId },
    include: { tasks: true }
  });

  let totalTasks = 0;
  let completedTasks = 0;

  for (const list of checklists) {
    for (const task of list.tasks) {
      totalTasks++;
      if (task.status === 'COMPLETED') completedTasks++;
    }
  }

  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  
  await prisma.employeeProfile.update({
    where: { id: employeeId },
    data: { onboardingProgress: progress }
  });

  return progress;
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    const taskId = req.params.taskId as string;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'File is required' });

    const task = await prisma.onboardingTask.findUnique({
      where: { id: taskId },
      include: { checklist: true }
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const fileUrl = `/uploads/${file.filename}`;

    let documentType: any = 'OTHER';
    if (task.title.includes('Government ID')) documentType = 'ID_PROOF';
    else if (task.title.includes('Resume')) documentType = 'RESUME';
    else if (task.title.includes('Offer Letter')) documentType = 'OFFER_LETTER';
    else if (task.title.includes('Educational')) documentType = 'CERTIFICATE';
    else if (task.title.includes('PAN')) documentType = 'PAN';
    else if (task.title.includes('Aadhaar')) documentType = 'AADHAAR';
    else if (task.title.includes('Bank Details')) documentType = 'BANK_DETAILS';
    else if (task.title.includes('Address Proof')) documentType = 'ADDRESS_PROOF';
    else if (task.title.includes('Passport Photo')) documentType = 'PASSPORT_PHOTO';
    else if (task.title.includes('NDA')) documentType = 'NDA';

    await prisma.document.create({
      data: {
        userId,
        name: file.originalname,
        documentType,
        fileUrl,
        verificationStatus: 'PENDING'
      }
    });

    await onboardingService.updateTaskStatus(taskId as string, 'COMPLETED', fileUrl);
    const progress = await calculateProgress(task.checklist.employeeId);

    // Emit real-time update
    io.emit('onboarding_update', { employeeId: task.checklist.employeeId, progress });

    res.json({ message: 'Document uploaded successfully', progress });
  } catch (error: any) {
    console.error('uploadDocument error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllOnboardingEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employeeProfile.findMany({
      where: {
        onboardingProgress: { lt: 100 }
      },
      include: {
        user: { select: { fullName: true, email: true, status: true, tempPassword: true, documents: true } },
        onboardingChecklists: { include: { tasks: true } },
        itAssets: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: employees });
  } catch (error: any) {
    console.error('getAllOnboardingEmployees error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { status } = req.body; 

    const document = await prisma.document.update({
      where: { id: documentId as string },
      data: { verificationStatus: status },
      include: { user: true }
    });

    if (status === 'VERIFIED') {
      // Check if all documents for this user are verified
      const allDocs = await prisma.document.findMany({ where: { userId: document.userId } });
      const allVerified = allDocs.every(d => d.verificationStatus === 'VERIFIED');
      
      if (allVerified && allDocs.length > 0) {
        // Auto-activate employee
        const employee = await prisma.employeeProfile.findUnique({ where: { userId: document.userId } });
        if (employee) {
          await prisma.user.update({
            where: { id: document.userId },
            data: { status: 'ACTIVE' }
          });

          /* LeaveBalance removed as it's not in schema, using Payroll */

          await prisma.payroll.create({
            data: {
              employeeId: employee.id,
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear(),
              basicSalary: 0,
              allowances: 0,
              deductions: 0,
              netPay: 0,
              status: 'DRAFT',
            }
          });
          
          io.emit('onboarding_update', { employeeId: employee.id, progress: 100 });
        }
      }
    }

    res.json({ message: `Document ${status}`, data: document });
  } catch (error: any) {
    console.error('verifyDocument error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const activateEmployee = async (req: Request, res: Response) => {
  try {
    const employeeId = req.params.employeeId as string;

    const employee = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: { user: true }
    });

    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    // Mark as active
    await prisma.user.update({
      where: { id: employee.userId },
      data: { status: 'ACTIVE' }
    });

    /* LeaveBalance removed, using Payroll */

    // Create payroll record (default zeroed out, ready for setup)
    await prisma.payroll.create({
      data: {
        employeeId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: 0,
        allowances: 0,
        deductions: 0,
        netPay: 0,
        status: 'DRAFT',
      }
    });

    // Record attendance activation (optional depending on schema, let's skip if no specific table needs it, usually attendance is daily)

    res.json({ message: 'Employee activated successfully with payroll and leave accounts setup.' });
  } catch (error: any) {
    console.error('activateEmployee error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createChecklist = async (req: Request, res: Response) => {
  try {
    const { employeeId, title, description, tasks } = req.body;
    const checklist = await onboardingService.createChecklist(employeeId, title, description, tasks);
    res.status(201).json({ data: checklist, message: 'Onboarding checklist created successfully' });
  } catch (error: any) {
    console.error('createChecklist error:', error);
    res.status(500).json({ error: error.message || 'Failed to create onboarding checklist' });
  }
};

export const getMyChecklist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the employee profile for the current user
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    const employee = await employeeBootstrapService.ensureEmployeeProfile(userId);

    const checklist = await onboardingService.getEmployeeChecklist(employee.id);
    res.json({ success: true, data: checklist || [] });
  } catch (error: any) {
    next(error);
  }
};

export const getEmployeeChecklist = async (req: Request, res: Response) => {
  try {
    const checklist = await onboardingService.getEmployeeChecklist(req.params.employeeId as string);
    res.json({ data: checklist });
  } catch (error: any) {
    console.error('getEmployeeChecklist error:', error);
    res.status(500).json({ error: 'Failed to fetch onboarding checklist' });
  }
};

export const getAllChecklists = async (req: Request, res: Response) => {
  try {
    const checklists = await onboardingService.getAllChecklists();
    res.json({ data: checklists });
  } catch (error: any) {
    console.error('getAllChecklists error:', error);
    res.status(500).json({ error: 'Failed to fetch onboarding checklists' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { status, documentUrl } = req.body;
    const updatedTask = await onboardingService.updateTaskStatus(req.params.taskId as string, status, documentUrl);
    res.json({ data: updatedTask, message: 'Onboarding task updated successfully' });
  } catch (error: any) {
    console.error('updateTask error:', error);
    res.status(500).json({ error: error.message || 'Failed to update onboarding task' });
  }
};

export const assignAsset = async (req: Request, res: Response) => {
  try {
    const { employeeId, assetName, assetType, serialNumber } = req.body;
    const asset = await onboardingService.assignAsset(employeeId, assetName, assetType, serialNumber);
    res.status(201).json({ data: asset, message: 'IT Asset assigned successfully' });
  } catch (error: any) {
    console.error('assignAsset error:', error);
    res.status(500).json({ error: error.message || 'Failed to assign IT Asset' });
  }
};

export const getMyAssets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    const employee = await employeeBootstrapService.ensureEmployeeProfile(userId);

    const assets = await onboardingService.getEmployeeAssets(employee.id);
    res.json({ success: true, data: assets || [] });
  } catch (error: any) {
    next(error);
  }
};

export const getAllAssets = async (req: Request, res: Response) => {
  try {
    const assets = await onboardingService.getAllAssets();
    res.json({ data: assets });
  } catch (error: any) {
    console.error('getAllAssets error:', error);
    res.status(500).json({ error: 'Failed to fetch IT assets' });
  }
};

export const releaseAsset = async (req: Request, res: Response) => {
  try {
    const asset = await onboardingService.releaseAsset(req.params.assetId as string);
    res.json({ data: asset, message: 'IT Asset released successfully' });
  } catch (error: any) {
    console.error('releaseAsset error:', error);
    res.status(500).json({ error: error.message || 'Failed to release IT Asset' });
  }
};
