import prisma from '../config/prisma.js';
import employeeBootstrapService from './employeeBootstrap.service.js';

export class PayrollService {
  async generatePayroll(month: number, year: number) {
    const employees = await prisma.employeeProfile.findMany({
      where: { user: { status: 'ACTIVE' } }
    });

    const payrolls = [];

    for (const emp of employees) {
      if (!emp.salary) continue; // Skip employees without a defined salary

      // Check if payroll already generated for this month/year
      const existing = await prisma.payroll.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: emp.id,
            month,
            year
          }
        }
      });

      if (existing) continue;

      // Mock calculation for allowances and deductions
      const basicSalary = emp.salary;
      const allowances = basicSalary * 0.1; // 10% allowance
      const deductions = basicSalary * 0.05; // 5% tax deduction
      const netPay = basicSalary + allowances - deductions;

      const payroll = await prisma.payroll.create({
        data: {
          employeeId: emp.id,
          month,
          year,
          basicSalary,
          allowances,
          deductions,
          netPay,
          status: 'DRAFT'
        }
      });
      payrolls.push(payroll);
    }
    
    return payrolls;
  }

  async getMyPayslips(userId: string) {
    const profile = await employeeBootstrapService.ensureEmployeeProfile(userId);

    return await prisma.payroll.findMany({
      where: { employeeId: profile.id },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });
  }

  async markAsPaid(payrollId: string) {
    return await prisma.payroll.update({
      where: { id: payrollId },
      data: { status: 'PAID' }
    });
  }
}

export default new PayrollService();
