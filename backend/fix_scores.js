import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Fix all applications with very low scores (< 30%) that have candidates with skills
  const apps = await prisma.application.findMany({
    where: { aiScore: { lt: 30 } },
    include: { candidate: true }
  });

  console.log(`Found ${apps.length} applications with score < 30%`);
  
  for (const app of apps) {
    const skillCount = app.candidate.skills?.length || 0;
    const skillsScore = Math.min(70, skillCount * 7);
    const newScore = skillsScore > 0 ? skillsScore : 30;
    
    await prisma.application.update({
      where: { id: app.id },
      data: { aiScore: newScore }
    });
    console.log(`Fixed ${app.candidate.fullName}: ${app.aiScore}% → ${newScore}% (${skillCount} skills)`);
  }

  // Show current state
  const allApps = await prisma.application.findMany({
    include: { candidate: { select: { fullName: true, education: true, experience: true, skills: true } } }
  });
  console.log('\nAll applications:');
  allApps.forEach(a => {
    console.log(`  ${a.candidate.fullName}: score=${a.aiScore}%, skills=${a.candidate.skills?.length}, edu="${a.candidate.education}", exp=${a.candidate.experience}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
