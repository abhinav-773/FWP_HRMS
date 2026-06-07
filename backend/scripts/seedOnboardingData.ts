import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Onboarding Data...');

  // Get a manager
  let manager = await prisma.user.findFirst({
    where: { role: 'SENIOR_MANAGER' },
    include: { EmployeeProfile: true }
  });

  // Get an employee
  let employee = await prisma.user.findFirst({
    where: { role: 'EMPLOYEE' },
    include: { EmployeeProfile: true }
  });

  if (!employee) {
    console.log('No employee found, skipping onboarding seeding.');
    return;
  }

  const employeeProfile = employee.EmployeeProfile;

  if (employeeProfile) {
    console.log('Creating Checklist for:', employee.email);

    // Delete existing checklist to prevent duplicates
    await prisma.onboardingChecklist.deleteMany({
      where: { employeeId: employeeProfile.id }
    });

    const checklist = await prisma.onboardingChecklist.create({
      data: {
        employeeId: employeeProfile.id,
        title: 'Enterprise Standard Onboarding',
        description: 'Complete the necessary documentation and IT setup.',
        status: 'IN_PROGRESS',
        tasks: {
          create: [
            {
              title: 'Upload Government ID',
              description: 'Please upload a valid Aadhar or Passport copy.',
              documentRequired: true,
              status: 'PENDING'
            },
            {
              title: 'Sign NDA',
              description: 'Sign the non-disclosure agreement.',
              documentRequired: true,
              status: 'COMPLETED',
              documentUrl: '/uploads/dummy_nda.pdf'
            },
            {
              title: 'IT Orientation',
              description: 'Attend the 30-min IT security briefing.',
              documentRequired: false,
              status: 'PENDING'
            }
          ]
        }
      }
    });

    // IT Assets
    await prisma.iTAsset.deleteMany({
      where: { employeeId: employeeProfile.id }
    });

    await prisma.iTAsset.createMany({
      data: [
        {
          employeeId: employeeProfile.id,
          assetName: 'MacBook Pro 16 M3',
          assetType: 'Laptop',
          serialNumber: 'C02X12345XYZ',
          status: 'ASSIGNED',
          assignedDate: new Date()
        },
        {
          employeeId: employeeProfile.id,
          assetName: 'YubiKey 5 NFC',
          assetType: 'YubiKey',
          serialNumber: 'YK-998877',
          status: 'ASSIGNED',
          assignedDate: new Date()
        }
      ]
    });

    // Update progress
    await prisma.employeeProfile.update({
      where: { id: employeeProfile.id },
      data: { onboardingProgress: 33 }
    });

    console.log('Successfully seeded onboarding data for', employee.email);
  }

  // Create an interview for the manager
  if (manager && manager.EmployeeProfile && employeeProfile) {
    console.log('Creating interview for Manager:', manager.email);
    await prisma.interview.create({
      data: {
        interviewerId: manager.id,
        employeeId: employeeProfile.id,
        title: '30-Day Check-in & Technical Review',
        interviewType: 'Performance Review',
        meetingProvider: 'Google Meet',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        status: 'SCHEDULED',
        scheduledAt: new Date(),
        notes: 'Review early code contributions and ensure onboarding is going smoothly.'
      }
    });
    console.log('Successfully created manager interview.');
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
