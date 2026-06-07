import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const interviews = await prisma.interview.findMany({ select: { id: true, meetingUrl: true, status: true, candidate: true } });
  console.log("Interviews:", JSON.stringify(interviews, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
