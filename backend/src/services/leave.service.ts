import prisma from '../config/prisma';
import { eventBus } from './eventBus';

export class LeaveService {
  async applyLeave(userId: string, data: any) {
    const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Employee profile not found');

    const { type, startDate, endDate, reason } = data;
    
    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId: profile.id,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        managerId: profile.managerId // Automatically assign to manager for approval
      }
    });

    if (profile.managerId) {
      eventBus.emit('leave:requested', {
        managerId: profile.managerId,
        request: leave
      });
    }

    return leave;
  }

  async getMyLeaves(userId: string) {
    const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Employee profile not found');

    return await prisma.leaveRequest.findMany({
      where: { employeeId: profile.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTeamLeaves(userId: string) {
    const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Employee profile not found');

    return await prisma.leaveRequest.findMany({
      where: { managerId: profile.id },
      include: {
        employee: {
          include: { user: { select: { fullName: true, email: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPendingTeamLeaves(userId: string) {
    const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Employee profile not found');

    return await prisma.leaveRequest.findMany({
      where: { managerId: profile.id, status: 'PENDING' },
      include: {
        employee: {
          include: { user: { select: { fullName: true, email: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async processLeave(userId: string, leaveId: string, status: 'APPROVED' | 'REJECTED') {
    const managerProfile = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (!managerProfile) throw new Error('Manager profile not found');

    const leave = await prisma.leaveRequest.findUnique({ 
      where: { id: leaveId },
      include: { employee: true }
    });
    if (!leave) throw new Error('Leave request not found');

    if (leave.managerId !== managerProfile.id) {
      throw new Error('Unauthorized: You are not the manager for this leave request');
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: `LEAVE_${status}`,
        entityType: 'LeaveRequest',
        entityId: leaveId,
        actorId: userId,
        details: { status }
      }
    });

    // Create Notification for the employee
    await prisma.notification.create({
      data: {
        userId: leave.employee.userId,
        title: `Leave Request ${status}`,
        message: `Your ${leave.type} leave request from ${leave.startDate.toISOString().split('T')[0]} to ${leave.endDate.toISOString().split('T')[0]} has been ${status.toLowerCase()}.`,
        type: 'LEAVE',
      }
    });

    if (status === 'APPROVED') {
      eventBus.emit('leave:approved', { employeeId: leave.employeeId, request: updatedLeave });
    } else {
      eventBus.emit('leave:rejected', { employeeId: leave.employeeId, request: updatedLeave });
    }

    return updatedLeave;
  }
}

export default new LeaveService();
