import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
export class EmployeeService {
    async getAllEmployees(filters) {
        const query = {
            include: {
                user: {
                    select: { fullName: true, email: true, role: true, status: true }
                },
                department: true,
                designation: true,
                manager: {
                    include: { user: { select: { fullName: true } } }
                }
            }
        };
        // Add simple filtering (can be expanded)
        if (filters.departmentId) {
            query.where = { ...query.where, departmentId: filters.departmentId };
        }
        return await prisma.employeeProfile.findMany(query);
    }
    async getEmployeeById(id) {
        return await prisma.employeeProfile.findUnique({
            where: { id },
            include: {
                user: { select: { fullName: true, email: true, role: true, status: true } },
                department: true,
                designation: true,
                manager: { include: { user: { select: { fullName: true } } } },
                subordinates: { include: { user: { select: { fullName: true } } } }
            }
        });
    }
    async createEmployee(data) {
        const { fullName, email, password, role, employeeId, departmentId, designationId, managerId, joinDate, salary, phone, address } = data;
        const hashedPassword = await bcrypt.hash(password, 10);
        // Run in a transaction to ensure both User and EmployeeProfile are created
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    fullName,
                    email,
                    password: hashedPassword,
                    role: role || 'EMPLOYEE'
                }
            });
            const profile = await tx.employeeProfile.create({
                data: {
                    userId: user.id,
                    employeeId,
                    departmentId,
                    designationId,
                    managerId,
                    joinDate: joinDate ? new Date(joinDate) : new Date(),
                    salary: salary ? parseFloat(salary) : null,
                    phone,
                    address
                },
                include: {
                    user: { select: { fullName: true, email: true, role: true } },
                    department: true,
                    designation: true
                }
            });
            return profile;
        });
    }
    async updateEmployee(id, data) {
        const { fullName, status, role, departmentId, designationId, managerId, salary, phone, address, profilePhoto } = data;
        return await prisma.$transaction(async (tx) => {
            const profile = await tx.employeeProfile.findUnique({ where: { id } });
            if (!profile)
                throw new Error('Employee not found');
            // Update User part
            if (fullName || status || role) {
                await tx.user.update({
                    where: { id: profile.userId },
                    data: {
                        ...(fullName && { fullName }),
                        ...(status && { status }),
                        ...(role && { role })
                    }
                });
            }
            // Update Profile part
            return await tx.employeeProfile.update({
                where: { id },
                data: {
                    ...(departmentId !== undefined && { departmentId }),
                    ...(designationId !== undefined && { designationId }),
                    ...(managerId !== undefined && { managerId }),
                    ...(salary !== undefined && { salary: parseFloat(salary) }),
                    ...(phone !== undefined && { phone }),
                    ...(address !== undefined && { address }),
                    ...(profilePhoto !== undefined && { profilePhoto }),
                },
                include: {
                    user: { select: { fullName: true, email: true, role: true, status: true } },
                    department: true,
                    designation: true
                }
            });
        });
    }
}
export default new EmployeeService();
//# sourceMappingURL=employee.service.js.map