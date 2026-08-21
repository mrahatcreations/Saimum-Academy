import { prisma } from '../prisma';

async function checkStatusBreakdown() {
  const all = await prisma.registration.findMany({
    select: {
      status: true,
      sessionId: true,
      session: { select: { title: true, sessionCode: true } }
    }
  });

  const statusCount: Record<string, number> = {};
  const sessionCount: Record<string, number> = {};

  all.forEach(r => {
    statusCount[r.status] = (statusCount[r.status] || 0) + 1;
    const title = r.session?.title || 'No Session';
    sessionCount[title] = (sessionCount[title] || 0) + 1;
  });

  console.log('=== REGISTRATION STATUS BREAKDOWN ===');
  console.log(statusCount);
  console.log('\n=== SESSION BREAKDOWN ===');
  console.log(sessionCount);
}

checkStatusBreakdown()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
