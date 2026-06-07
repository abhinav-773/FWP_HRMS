import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    console.log('Seeding Manager and Team Data...');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);
    // Create Department
    const dept = await prisma.department.upsert({
        where: { name: 'Engineering' },
        update: {},
        create: { name: 'Engineering', description: 'Tech Team' }
    });
    // Create Senior Manager
    const managerUser = await prisma.user.upsert({
        where: { email: 'manager@hrgpt.com' },
        update: {},
        create: {
            email: 'manager@hrgpt.com',
            password,
            fullName: 'Alice Manager',
            role: 'SENIOR_MANAGER',
            status: 'ACTIVE'
        }
    });
    const managerProfile = await prisma.employeeProfile.upsert({
        where: { userId: managerUser.id },
        update: { departmentId: dept.id },
        create: {
            userId: managerUser.id,
            employeeId: 'EMP-MGR-001',
            departmentId: dept.id
        }
    });
    // Create 3 Employees under the Manager
    const employees = [];
    for (let i = 1; i <= 3; i++) {
        const empUser = await prisma.user.upsert({
            where: { email: `employee${i}@hrgpt.com` },
            update: {},
            create: {
                email: `employee${i}@hrgpt.com`,
                password,
                fullName: `Bob Employee ${i}`,
                role: 'EMPLOYEE',
                status: 'ACTIVE'
            }
        });
        const empProfile = await prisma.employeeProfile.upsert({
            where: { userId: empUser.id },
            update: { managerId: managerProfile.id, departmentId: dept.id },
            create: {
                userId: empUser.id,
                employeeId: `EMP-00${i}`,
                managerId: managerProfile.id,
                departmentId: dept.id
            }
        });
        employees.push(empProfile);
    }
    // Create 3 Tasks assigned by manager to employee 1
    await prisma.teamTask.create({
        data: {
            title: 'Frontend Refactoring',
            description: 'Refactor the React components',
            priority: 'HIGH',
            assignedToEmployeeId: employees[0].id,
            assignedByManagerId: managerProfile.id,
            department: 'Engineering',
            dueDate: new Date(Date.now() + 86400000 * 2), // 2 days
            status: 'IN_PROGRESS',
            progress: 50
        }
    });
    // Create 2 Leave Requests
    await prisma.leaveRequest.create({
        data: {
            employeeId: employees[1].id,
            managerId: managerProfile.id,
            type: 'SICK',
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            reason: 'Fever',
            status: 'PENDING'
        }
    });
    console.log('Seeding completed! Login with manager@hrgpt.com / password123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seedManagerData.js.map