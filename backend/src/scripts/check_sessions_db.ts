import { prisma } from '../prisma';

async function checkSessions() {
  const sessions = await prisma.admissionSession.findMany({
    include: {
      _count: {
        select: { registrations: true }
      }
    }
  });

  console.log('=== ALL ADMISSION SESSIONS IN DB ===');
  sessions.forEach(s => {
    console.log(`ID: ${s.id} | Title: "${s.title}" | Code: ${s.sessionCode} | Year: ${s.year} | Start: ${s.startDate} | End: ${s.endDate} | isActive: ${s.isActive} | Status: "${s.status}" | Applicants: ${s._count.registrations}`);
  });
}

checkSessions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
