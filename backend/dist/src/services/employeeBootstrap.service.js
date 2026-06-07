import prisma from '../config/prisma.js';
export class EmployeeBootstrapService {
    async ensureEmployeeProfile(userId) {
        let profile = await prisma.employeeProfile.findUnique({
            where: { userId }
        });
        if (profile)
            return profile;
        // 1. Fetch User
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        // 2. Ensure Default Department & Designation
        let defaultDept = await prisma.department.findFirst({
            where: { name: 'General' }
        });
        if (!defaultDept) {
            defaultDept = await prisma.department.create({
                data: { name: 'General', description: 'General Department' }
            });
        }
        let defaultDesig = await prisma.designation.findFirst({
            where: { title: 'Staff' }
        });
        if (!defaultDesig) {
            defaultDesig = await prisma.designation.create({
                data: { title: 'Staff', level: 1 }
            });
        }
        // 3. Create EmployeeProfile
        const employeeId = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;
        profile = await prisma.employeeProfile.create({
            data: {
                userId: user.id,
                employeeId,
                departmentId: defaultDept.id,
                designationId: defaultDesig.id,
                salary: 50000,
                joinDate: new Date()
            }
        });
        // 4. Initialize HR Records (Payroll, Onboarding, Performance)
        await this.initializeHRRecords(profile.id);
        return profile;
    }
    async initializeHRRecords(employeeProfileId) {
        // A. Initialize Payroll (Draft)
        const currentDate = new Date();
        await prisma.payroll.upsert({
            where: {
                employeeId_month_year: {
                    employeeId: employeeProfileId,
                    month: currentDate.getMonth() + 1,
                    year: currentDate.getFullYear()
                }
            },
            update: {},
            create: {
                employeeId: employeeProfileId,
                month: currentDate.getMonth() + 1,
                year: currentDate.getFullYear(),
                basicSalary: 50000 / 12,
                netPay: (50000 / 12) * 0.9, // Simplified
                status: 'DRAFT'
            }
        });
        // B. Initialize Performance Goal (Placeholder)
        await prisma.performanceGoal.create({
            data: {
                employeeId: employeeProfileId,
                title: 'Initial Onboarding Goals',
                description: 'Complete mandatory onboarding and system setup.',
                targetDate: new Date(new Date().setMonth(currentDate.getMonth() + 1)),
                progress: 0,
                status: 'ACTIVE'
            }
        });
        // C. Initialize Onboarding Checklist
        const checklist = await prisma.onboardingChecklist.create({
            data: {
                employeeId: employeeProfileId,
                title: 'Standard Enterprise Onboarding',
                status: 'IN_PROGRESS',
                tasks: {
                    create: [
                        { title: 'Offer Accepted & Welcome', status: 'COMPLETED' },
                        { title: 'Identity Verification', status: 'PENDING' },
                        { title: 'IT Asset Setup', status: 'PENDING' },
                        { title: 'Manager Orientation', status: 'PENDING' }
                    ]
                }
            }
        });
        return true;
    }
}
export default new EmployeeBootstrapService();
//# sourceMappingURL=employeeBootstrap.service.js.map