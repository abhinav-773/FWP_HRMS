import { PrismaClient, Role, ApplicationStage, JobStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import chalk from 'chalk';
import readline from 'readline';
import { env } from '../src/config/env';
import employeeBootstrapService from '../src/services/employeeBootstrap.service';
const prisma = new PrismaClient();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
async function prompt(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}
async function seedDatabase() {
    console.log(chalk.cyan.bold('\n🚀 HireMind Demo Data Seeding Script\n'));
    // Safeguards
    const args = process.argv.slice(2);
    if (env.NODE_ENV === 'production' && !args.includes('--force-production')) {
        console.error(chalk.red('❌ ERROR: Cannot run demo seeding in production environment without --force-production!'));
        process.exit(1);
    }
    if (!args.includes('--force-demo')) {
        console.error(chalk.yellow('⚠️ WARNING: You must pass --force-demo flag to run this script.'));
        console.error(chalk.yellow('Example: npm run seed:demo -- --force-demo\n'));
        process.exit(1);
    }
    console.log(chalk.bgRed.white.bold(' ⚠️ DANGER ZONE ⚠️ '));
    console.log(chalk.red('This will COMPLETELY WIPE the database and reseed demo data!'));
    if (args.includes('--yes')) {
        console.log(chalk.green('Bypassing prompt due to --yes flag.'));
    }
    else {
        const answer = await prompt(chalk.yellow('Are you absolutely sure you want to proceed? (yes/no): '));
        if (answer.toLowerCase() !== 'yes') {
            console.log(chalk.green('Aborting seed process.'));
            process.exit(0);
        }
    }
    console.log(chalk.blue('\n🧹 Wiping database...'));
    // Wipe Database in correct order to avoid foreign key constraints
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.sharedNote.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.onboardingTask.deleteMany();
    await prisma.onboardingChecklist.deleteMany();
    await prisma.performanceGoal.deleteMany();
    await prisma.performanceReview.deleteMany();
    await prisma.iTAsset.deleteMany();
    await prisma.document.deleteMany();
    await prisma.payroll.deleteMany();
    await prisma.leaveRequest.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.interview.deleteMany();
    await prisma.application.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.jobPosting.deleteMany();
    await prisma.employeeProfile.deleteMany();
    await prisma.designation.deleteMany();
    await prisma.department.deleteMany();
    await prisma.user.deleteMany();
    console.log(chalk.green('✅ Database wiped.'));
    console.log(chalk.blue('\n🌱 Seeding new demo data...'));
    const defaultPassword = await bcrypt.hash('password123', 10);
    // 1. Create Personas
    console.log(chalk.magenta('- Creating Executive Personas...'));
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const hrPassword = await bcrypt.hash('Hr@123', 10);
    const managerPassword = await bcrypt.hash('Manager@123', 10);
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@hiremind.com',
            password: adminPassword,
            fullName: 'System Admin',
            role: Role.SUPER_ADMIN,
        }
    });
    const hrUser = await prisma.user.create({
        data: {
            email: 'hr@hiremind.com',
            password: hrPassword,
            fullName: 'Marcus Johnson (HR Manager)',
            role: Role.HR_RECRUITER,
        }
    });
    const managerUser = await prisma.user.create({
        data: {
            email: 'manager@hiremind.com',
            password: managerPassword,
            fullName: 'David Kim (VP Eng)',
            role: Role.SENIOR_MANAGER,
        }
    });
    const employeeUser = await prisma.user.create({
        data: {
            email: 'employee@hiremind.com',
            password: defaultPassword,
            fullName: 'Alex Rivera (Engineer)',
            role: Role.EMPLOYEE,
        }
    });
    // Create Departments
    console.log(chalk.magenta('- Creating Departments...'));
    const deptNames = ['Executive', 'Human Resources', 'Recruiting', 'Engineering', 'Marketing', 'Sales', 'Product', 'Design'];
    const createdDepts = {};
    for (const name of deptNames) {
        const dept = await prisma.department.create({
            data: { name, description: `${name} Department` }
        });
        createdDepts[name] = dept.id;
    }
    // Create Designations
    console.log(chalk.magenta('- Creating Designations...'));
    const titles = ['CEO', 'HR Manager', 'Senior Recruiter', 'VP of Engineering', 'Software Engineer', 'Marketing Specialist', 'Sales Specialist', 'Product Specialist', 'Design Specialist', 'Engineering Specialist'];
    const createdDesignations = {};
    for (const title of titles) {
        const desig = await prisma.designation.create({
            data: { title, level: 1 }
        });
        createdDesignations[title] = desig.id;
    }
    // Create standard employee profiles
    const allUsers = [adminUser, hrUser, managerUser, employeeUser];
    const departments = ['Executive', 'Human Resources', 'Engineering', 'Engineering'];
    const userTitles = ['CEO', 'HR Manager', 'VP of Engineering', 'Software Engineer'];
    for (let i = 0; i < allUsers.length; i++) {
        const user = allUsers[i];
        const deptName = departments[i];
        const title = userTitles[i];
        if (!user || !deptName || !title)
            continue;
        const profile = await prisma.employeeProfile.create({
            data: {
                userId: user.id,
                employeeId: `EMP-${Math.floor(Math.random() * 90000) + 10000}`,
                departmentId: createdDepts[deptName],
                designationId: createdDesignations[title],
                joinDate: faker.date.past({ years: 3 }),
                salary: faker.number.int({ min: 80000, max: 250000 }),
            }
        });
        await employeeBootstrapService.initializeHRRecords(profile.id);
    }
    // Generate 20 more random employees
    console.log(chalk.magenta('- Generating Employees & Attendance Data...'));
    const departmentsList = ['Engineering', 'Marketing', 'Sales', 'Product', 'Design'];
    for (let i = 0; i < 20; i++) {
        const fn = faker.person.firstName();
        const ln = faker.person.lastName();
        const user = await prisma.user.create({
            data: {
                email: `${fn.toLowerCase()}.${ln.toLowerCase()}@hiremind.com`,
                password: defaultPassword,
                fullName: `${fn} ${ln}`,
                role: Role.EMPLOYEE,
            }
        });
        const deptName = faker.helpers.arrayElement(departmentsList);
        const profile = await prisma.employeeProfile.create({
            data: {
                userId: user.id,
                employeeId: `EMP-${Math.floor(Math.random() * 90000) + 10000}`,
                departmentId: createdDepts[deptName],
                designationId: createdDesignations[`${deptName} Specialist`],
                joinDate: faker.date.past({ years: 2 }),
                salary: faker.number.int({ min: 60000, max: 150000 }),
            }
        });
        await employeeBootstrapService.initializeHRRecords(profile.id);
        // Generate recent attendance records (last 5 days)
        for (let d = 0; d < 5; d++) {
            const date = new Date();
            date.setDate(date.getDate() - d);
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6)
                continue;
            const checkIn = new Date(date);
            checkIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60)); // 8-9am
            const checkOut = new Date(date);
            checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60)); // 5-6pm
            const status = faker.helpers.arrayElement(['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'HALF_DAY']);
            await prisma.attendance.create({
                data: {
                    employeeId: profile.id,
                    date: date,
                    clockIn: checkIn,
                    clockOut: checkOut,
                    status: status,
                    location: 'Office (HQ)'
                }
            });
        }
        const currentDate = new Date();
        // Generate 1 payroll per employee
        const baseSalary = profile.salary ?? 60000;
        await prisma.payroll.update({
            where: {
                employeeId_month_year: {
                    employeeId: profile.id,
                    month: currentDate.getMonth() + 1,
                    year: currentDate.getFullYear()
                }
            },
            data: {
                basicSalary: baseSalary / 12,
                allowances: faker.number.int({ min: 200, max: 1000 }),
                deductions: faker.number.int({ min: 50, max: 300 }),
                netPay: (baseSalary / 12) + 500 - 150,
                status: 'PAID'
            }
        });
        // We can skip manual payroll generation here since initializeHRRecords handles draft creation.
        // If we want history, we can keep the PAID one. Let's just keep the PAID one.
    }
    // Generate ATS Jobs
    console.log(chalk.magenta('- Generating ATS Pipeline...'));
    const jobs = [];
    const jobTitles = ['Senior React Developer', 'Product Designer', 'VP of Sales', 'AI Researcher'];
    for (const title of jobTitles) {
        const deptName = faker.helpers.arrayElement(departmentsList);
        const job = await prisma.jobPosting.create({
            data: {
                title,
                departmentId: createdDepts[deptName],
                location: 'San Francisco, CA (Hybrid)',
                employmentType: 'FULL_TIME',
                description: `We are looking for a ${title} to join our fast-growing team.`,
                requirements: `5+ years experience.\nStrong communication skills.`,
                status: JobStatus.OPEN,
                postedById: hrUser.id,
            }
        });
        jobs.push(job);
    }
    // Generate Candidates and Applications
    for (const job of jobs) {
        const numCandidates = faker.number.int({ min: 5, max: 15 });
        for (let i = 0; i < numCandidates; i++) {
            const candidate = await prisma.candidate.create({
                data: {
                    fullName: faker.person.fullName(),
                    email: faker.internet.email(),
                    phone: faker.phone.number(),
                    resumeUrl: '/uploads/demo-resume.pdf',
                }
            });
            const stage = faker.helpers.arrayElement([
                ApplicationStage.APPLIED,
                ApplicationStage.SCREENING,
                ApplicationStage.INTERVIEW,
                ApplicationStage.SHORTLISTED
            ]);
            const aiScore = faker.number.int({ min: 40, max: 98 });
            let aiSummary = `This candidate has a strong background in software engineering, but lacks specific domain experience mentioned in the job description. \n\nStrengths:\n- Good communication\n- Solid technical background\n\nWeaknesses:\n- No direct management experience.`;
            if (aiScore > 85) {
                aiSummary = `Exceptional candidate. Highly recommended. Matches all criteria perfectly and shows strong leadership potential based on their resume semantics.`;
            }
            await prisma.application.create({
                data: {
                    candidateId: candidate.id,
                    jobId: job.id,
                    stage,
                    aiScore,
                    aiInsights: aiSummary,
                    recruiterNotes: 'Seems like a solid fit, let us push to next round.',
                }
            });
        }
    }
    console.log(chalk.green('\n🎉 Demo Data Seeded Successfully!'));
    console.log(chalk.white('You can now log in with the following demo personas:'));
    console.log(chalk.cyan(`- admin@hiremind.com (Password: Admin@123)`));
    console.log(chalk.cyan(`- hr@hiremind.com (Password: Hr@123)`));
    console.log(chalk.cyan(`- manager@hiremind.com (Password: Manager@123)`));
    console.log(chalk.cyan(`- employee@hiremind.com (Password: password123)`));
    process.exit(0);
}
seedDatabase().catch(e => {
    console.error(chalk.red(e));
    process.exit(1);
});
//# sourceMappingURL=seedDemo.js.map