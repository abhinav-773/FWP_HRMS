import prisma from '../config/prisma';

export class LeaveService {
  async applyLeave(userId: string, data: any) {
    const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Employee profile not found');

    const { type, startDate, endDate, reason } = data;
    
    return await prisma.leaveRequest.create({
      data: {
        employeeId: profile.id,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        managerId: profile.managerId // Automatically assign to manager for approval
      }
    });
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
          include: { user: { select: { fullName: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async processLeave(userId: string, leaveId: string, status: 'APPROVED' | 'REJECTED') {
    const managerProfile = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (!managerProfile) throw new Error('Manager profile not found');

    const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) throw new Error('Leave request not found');

    if (leave.managerId !== managerProfile.id) {
      throw new Error('Unauthorized: You are not the manager for this leave request');
    }

    return await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status }
    });
  }
}

export default new LeaveService();
