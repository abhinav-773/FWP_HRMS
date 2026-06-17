import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Demo Data for HireMind Enterprise...');

  // 1. Departments & Designations
  const engineeringDept = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: { name: 'Engineering', description: 'Software Development and IT' }
  });

  const productDept = await prisma.department.upsert({
    where: { name: 'Product' },
    update: {},
    create: { name: 'Product', description: 'Product Management and Design' }
  });

  const sdeDesignation = await prisma.designation.upsert({
    where: { title: 'Senior Software Engineer' },
    update: {},
    create: { title: 'Senior Software Engineer', level: 3 }
  });

  // 2. Demo Users
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('DemoPassword123!', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hiremind.com' },
    update: {},
    create: {
      email: 'admin@hiremind.com',
      fullName: 'Super Admin',
      password: hash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@hiremind.com' },
    update: {},
    create: {
      email: 'manager@hiremind.com',
      fullName: 'Tech Lead',
      password: hash,
      role: 'SENIOR_MANAGER',
      status: 'ACTIVE'
    }
  });

  // 3. Demo Jobs
  const frontendJob = await prisma.jobPosting.create({
    data: {
      title: 'Frontend React Developer',
      departmentId: engineeringDept.id,
      location: 'Remote',
      employmentType: 'FULL_TIME',
      experienceRequired: 3,
      description: 'Looking for a strong React developer with Next.js experience.',
      requirements: 'React, Next.js, Tailwind, TypeScript',
      status: 'OPEN',
      postedById: manager.id
    }
  });

  const backendJob = await prisma.jobPosting.create({
    data: {
      title: 'Backend Node.js Engineer',
      departmentId: engineeringDept.id,
      location: 'New York',
      employmentType: 'FULL_TIME',
      experienceRequired: 5,
      description: 'Expert Node.js engineer needed for scaling microservices.',
      requirements: 'Node.js, Express, Postgres, Redis, Microservices',
      status: 'OPEN',
      postedById: manager.id
    }
  });

  // 4. Demo Candidates
  const alice = await prisma.candidate.upsert({
    where: { email: 'alice.smith@example.com' },
    update: {},
    create: {
      fullName: 'Alice Smith',
      email: 'alice.smith@example.com',
      phone: '123-456-7890',
      source: 'LINKEDIN'
    }
  });
  await prisma.application.create({
    data: {
      candidateId: alice.id,
      jobId: frontendJob.id,
      stage: 'APPLIED',
      overallAIScore: 85,
      aiInsights: 'Strong React background, good team fit.'
    }
  });

  const bob = await prisma.candidate.upsert({
    where: { email: 'bob.j@example.com' },
    update: {},
    create: {
      fullName: 'Bob Johnson',
      email: 'bob.j@example.com',
      phone: '123-456-7891',
      source: 'REFERRAL'
    }
  });
  await prisma.application.create({
    data: {
      candidateId: bob.id,
      jobId: frontendJob.id,
      stage: 'INTERVIEW',
      overallAIScore: 92,
      aiInsights: 'Excellent React and Next.js knowledge. Highly recommended.'
    }
  });

  const charlie = await prisma.candidate.upsert({
    where: { email: 'cbrown@example.com' },
    update: {},
    create: {
      fullName: 'Charlie Brown',
      email: 'cbrown@example.com',
      phone: '123-456-7892',
      source: 'JOB_BOARD'
    }
  });
  await prisma.application.create({
    data: {
      candidateId: charlie.id,
      jobId: backendJob.id,
      stage: 'SHORTLISTED',
      overallAIScore: 88,
      aiInsights: 'Solid Node.js experience, but lacks Redis knowledge.'
    }
  });

  console.log('Demo Data Seeding Complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
