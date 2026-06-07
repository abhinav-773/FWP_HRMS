import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    try {
        const employees = await prisma.employeeProfile.findMany({
            where: {
                onboardingProgress: { lt: 100 }
            },
            include: {
                user: { select: { fullName: true, email: true, status: true, tempPassword: true, documents: true } },
                onboardingChecklists: { include: { tasks: true } },
                itAssets: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log("Success! Employees found:", employees.length);
    }
    catch (error) {
        console.error("Prisma error:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=testQuery.js.map