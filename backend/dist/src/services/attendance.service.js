import prisma from '../config/prisma';
// In-memory tracking for active breaks (since Redis might be disabled)
const activeBreaks = new Map();
export class AttendanceService {
    async clockIn(userId, location, workFromHome = false) {
        // Find employee profile
        const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
        if (!profile)
            throw new Error('Employee profile not found');
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
                location,
                workFromHome
            }
        });
    }
    async clockOut(userId) {
        const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
        if (!profile)
            throw new Error('Employee profile not found');
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
        // End break if employee is currently on break
        if (activeBreaks.has(profile.id)) {
            const breakStart = activeBreaks.get(profile.id);
            const duration = (new Date().getTime() - breakStart.getTime()) / (1000 * 60);
            attendance.breakTime += duration;
            activeBreaks.delete(profile.id);
        }
        const clockOutTime = new Date();
        const clockInTime = attendance.clockIn;
        const workHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
        return await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                clockOut: clockOutTime,
                workHours,
                breakTime: attendance.breakTime
            }
        });
    }
    async toggleBreak(userId) {
        const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
        if (!profile)
            throw new Error('Employee profile not found');
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
        if (!attendance)
            throw new Error('You must clock in first before taking a break');
        if (attendance.clockOut)
            throw new Error('Already clocked out for today');
        const employeeId = profile.id;
        if (activeBreaks.has(employeeId)) {
            const breakStart = activeBreaks.get(employeeId);
            const durationMinutes = (new Date().getTime() - breakStart.getTime()) / (1000 * 60);
            activeBreaks.delete(employeeId);
            const updated = await prisma.attendance.update({
                where: { id: attendance.id },
                data: {
                    breakTime: attendance.breakTime + durationMinutes
                }
            });
            return { onBreak: false, breakTime: updated.breakTime };
        }
        else {
            activeBreaks.set(employeeId, new Date());
            return { onBreak: true };
        }
    }
    async getBreakStatus(userId) {
        const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
        if (!profile)
            throw new Error('Employee profile not found');
        return { onBreak: activeBreaks.has(profile.id) };
    }
    async getBurnoutCheck(userId) {
        const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
        if (!profile)
            throw new Error('Employee profile not found');
        // Retrieve last 30 days of attendance
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const records = await prisma.attendance.findMany({
            where: {
                employeeId: profile.id,
                date: { gte: thirtyDaysAgo }
            },
            orderBy: { date: 'desc' }
        });
        if (records.length === 0) {
            return { burnoutRisk: 'LOW', avgHours: 0, reason: 'No recent attendance history.' };
        }
        const totalHours = records.reduce((acc, rec) => acc + (rec.workHours || 0), 0);
        const avgHours = totalHours / records.length;
        const avgBreaks = records.reduce((acc, rec) => acc + rec.breakTime, 0) / records.length;
        let burnoutRisk = 'LOW';
        let recommendation = 'Your work balance looks healthy. Keep taking regular breaks!';
        if (avgHours > 9.5) {
            burnoutRisk = 'HIGH';
            recommendation = 'Critical: Your daily working hours are consistently high. Please consult your manager to delegate work and reduce overtime.';
        }
        else if (avgHours > 8.5 || avgBreaks < 15) {
            burnoutRisk = 'MEDIUM';
            recommendation = 'Warning: Overtime detected or break times are too short. Try to schedule short breaks and step away from your desk.';
        }
        return {
            burnoutRisk,
            avgHours: parseFloat(avgHours.toFixed(2)),
            avgBreaks: Math.round(avgBreaks),
            recommendation
        };
    }
    async getMyStats(userId, month, year) {
        const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
        if (!profile)
            throw new Error('Employee profile not found');
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
//# sourceMappingURL=attendance.service.js.map