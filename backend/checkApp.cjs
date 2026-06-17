const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkApp() {
  const app = await prisma.application.findFirst({
    where: {
      candidate: {
        fullName: 'EndToEnd ValidPDF TestCandidate'
      }
    },
    include: {
      candidate: true,
      job: true
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(JSON.stringify(app, null, 2));
}

checkApp().finally(() => prisma.$disconnect());
