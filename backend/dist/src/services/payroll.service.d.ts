export declare class PayrollService {
    generatePayroll(month: number, year: number): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PayrollStatus;
        month: number;
        year: number;
        basicSalary: number;
        allowances: number;
        deductions: number;
        netPay: number;
    }[]>;
    getMyPayslips(userId: string): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PayrollStatus;
        month: number;
        year: number;
        basicSalary: number;
        allowances: number;
        deductions: number;
        netPay: number;
    }[]>;
    markAsPaid(payrollId: string): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PayrollStatus;
        month: number;
        year: number;
        basicSalary: number;
        allowances: number;
        deductions: number;
        netPay: number;
    }>;
}
declare const _default: PayrollService;
export default _default;
//# sourceMappingURL=payroll.service.d.ts.map