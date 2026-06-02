import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export class AttendanceService {
  async clockIn(userId: string, location?: string) {
    // Find employee profile
    const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Employee profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: profile.id,
          date: today
        }
      }
    });

    if (existingAttendance) {
      throw new Error('Already clocked in for today');
    }

    const clockInTime = new Date();
    // Simple logic for late checking: Assuming 9:30 AM is standard
    const isLate = clockInTime.getHours() > 9 || (clockInTime.getHours() === 9 && clockInTime.getMinutes() > 30);

    return await prisma.attendance.create({
      data: {
        employeeId: profile.id,
        date: today,
        clockIn: clockInTime,
        status: isLate ? 'LATE' : 'PRESENT',
        location
      }
    });
  }

  async clockOut(userId: string) {
    const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Employee profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: profile.id,
          date: today
        }
      }
    });

    if (!attendance) {
      throw new Error('No active clock-in found for today');
    }
    
    if (attendance.clockOut) {
      throw new Error('Already clocked out for today');
    }

    const clockOutTime = new Date();
    const clockInTime = attendance.clockIn!;
    const workHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    return await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut: clockOutTime,
        workHours
      }
    });
  }

  async getMyStats(userId: string, month: number, year: number) {
    const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Employee profile not found');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return await prisma.attendance.findMany({
      where: {
        employeeId: profile.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'desc' }
    });
  }
}

export default new AttendanceService();
