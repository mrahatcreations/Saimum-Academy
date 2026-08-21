import { prisma } from '../prisma';

async function fixSelectedStatus() {
  const res = await prisma.registration.updateMany({
    where: { status: 'REGULAR_STUDENT' },
    data: { status: 'SELECTED' }
  });
  console.log(`Updated ${res.count} registrations to status 'SELECTED'`);

  const summary = await prisma.registration.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  console.log('Current status summary:', summary);
}

fixSelectedStatus()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
