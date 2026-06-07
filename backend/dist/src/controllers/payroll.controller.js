import payrollService from '../services/payroll.service';
import prisma from '../config/prisma';
export const generatePayroll = async (req, res) => {
    try {
        const { month, year } = req.body;
        if (!month || !year)
            return res.status(400).json({ error: 'Month and year are required' });
        const payrolls = await payrollService.generatePayroll(month, year);
        res.status(201).json({ data: payrolls, message: `Generated ${payrolls.length} payroll records.` });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getMyPayslips = async (req, res) => {
    try {
        const userId = req.user.userId;
        const slips = await payrollService.getMyPayslips(userId);
        res.json({ data: slips });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const markAsPaid = async (req, res) => {
    try {
        const id = req.params.id;
        const slip = await payrollService.markAsPaid(id);
        res.json({ data: slip, message: 'Payroll marked as PAID' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const downloadPayslip = async (req, res) => {
    try {
        const id = req.params.id;
        const payroll = await prisma.payroll.findUnique({
            where: { id },
            include: {
                employee: {
                    include: {
                        user: { select: { fullName: true, email: true } },
                        department: true,
                        designation: true
                    }
                }
            }
        });
        if (!payroll)
            return res.status(404).json({ error: 'Payroll record not found' });
        // Build standard, printable payslip HTML content
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${payroll.month}/${payroll.year}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 40px; background-color: #f9fafb; }
          .container { border: 1px solid #e5e7eb; padding: 40px; border-radius: 20px; max-width: 600px; margin: 40px auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #4f46e5; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 5px 0 0 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
          .details-table, .salary-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .details-table td { padding: 10px 0; font-size: 14px; color: #4b5563; }
          .salary-table th, .salary-table td { border: 1px solid #f3f4f6; padding: 12px 16px; text-align: left; font-size: 14px; }
          .salary-table th { background-color: #f9fafb; color: #374151; font-weight: 700; }
          .salary-table td { color: #4b5563; }
          .total-row { font-weight: 800; font-size: 16px; background-color: #e0e7ff !important; color: #312e81 !important; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HRGPT SYSTEMS</h1>
            <p>Employee Pay Slip</p>
          </div>
          <table class="details-table">
            <tr>
              <td><strong>Name:</strong> ${payroll.employee.user.fullName}</td>
              <td><strong>Employee ID:</strong> ${payroll.employee.employeeId}</td>
            </tr>
            <tr>
              <td><strong>Department:</strong> ${payroll.employee.department?.name || 'N/A'}</td>
              <td><strong>Designation:</strong> ${payroll.employee.designation?.title || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Period:</strong> ${payroll.month}/${payroll.year}</td>
              <td><strong>Status:</strong> ${payroll.status}</td>
            </tr>
          </table>
          <table class="salary-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Salary</td>
                <td>$${payroll.basicSalary.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Allowances</td>
                <td>$${payroll.allowances.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Deductions (Taxes & PF)</td>
                <td>-$${payroll.deductions.toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td>Net Take-Home Pay</td>
                <td>$${payroll.netPay.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename=payslip_${payroll.month}_${payroll.year}.html`);
        res.send(htmlContent);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=payroll.controller.js.map