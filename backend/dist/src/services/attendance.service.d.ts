export declare class AttendanceService {
    clockIn(userId: string, location?: string, workFromHome?: boolean): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        date: Date;
        clockIn: Date | null;
        clockOut: Date | null;
        workHours: number | null;
        location: string | null;
        workFromHome: boolean;
        breakTime: number;
        shiftStart: Date | null;
        shiftEnd: Date | null;
    }>;
    clockOut(userId: string): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        date: Date;
        clockIn: Date | null;
        clockOut: Date | null;
        workHours: number | null;
        location: string | null;
        workFromHome: boolean;
        breakTime: number;
        shiftStart: Date | null;
        shiftEnd: Date | null;
    }>;
    toggleBreak(userId: string): Promise<{
        onBreak: boolean;
        breakTime: number;
    } | {
        onBreak: boolean;
        breakTime?: undefined;
    }>;
    getBreakStatus(userId: string): Promise<{
        onBreak: boolean;
    }>;
    getBurnoutCheck(userId: string): Promise<{
        burnoutRisk: string;
        avgHours: number;
        reason: string;
        avgBreaks?: undefined;
        recommendation?: undefined;
    } | {
        burnoutRisk: string;
        avgHours: number;
        avgBreaks: number;
        recommendation: string;
        reason?: undefined;
    }>;
    getMyStats(userId: string, month: number, year: number): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        date: Date;
        clockIn: Date | null;
        clockOut: Date | null;
        workHours: number | null;
        location: string | null;
        workFromHome: boolean;
        breakTime: number;
        shiftStart: Date | null;
        shiftEnd: Date | null;
    }[]>;
}
declare const _default: AttendanceService;
export default _default;
//# sourceMappingURL=attendance.service.d.ts.map