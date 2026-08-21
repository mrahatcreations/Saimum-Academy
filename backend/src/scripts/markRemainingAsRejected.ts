import { prisma } from '../prisma';

export async function markRemainingAsRejected() {
  console.log('🚀 Marking all non-workshop applicants in closed admission sessions as REJECTED...\n');

  // Find all registrations that are NOT regular students and NOT enrolled in workshops
  const allRegs = await prisma.registration.findMany({
    include: {
      person: {
        include: {
          studentProfile: true
        }
      }
    }
  });

  console.log(`Total Registrations: ${allRegs.length}`);

  let updatedToRejectedCount = 0;
  let retainedRegularCount = 0;

  for (const reg of allRegs) {
    const hasStudentId = !!reg.person.studentProfile;

    if (hasStudentId) {
      // Kept as REGULAR_STUDENT
      if (reg.status !== 'REGULAR_STUDENT') {
        await prisma.registration.update({
          where: { id: reg.id },
          data: { status: 'REGULAR_STUDENT' }
        });
      }
      retainedRegularCount++;
    } else {
      // Everyone else outside workshop graduation -> REJECTED
      if (reg.status !== 'REJECTED') {
        await prisma.registration.update({
          where: { id: reg.id },
          data: {
            status: 'REJECTED',
            vivaNotes: 'সাংস্কৃতিক কর্মশালার জন্য নির্বাচিত হতে পারেননি।'
          }
        });
        updatedToRejectedCount++;
      }
    }
  }

  // Count final registration statuses
  const statusSummary = await prisma.registration.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  console.log('\n======================================================');
  console.log('🎉 APPLICANTS REJECTED UPDATE COMPLETED!');
  console.log(`🎓 Workshop Graduates (Retained as REGULAR_STUDENT): ${retainedRegularCount}`);
  console.log(`❌ Non-Workshop Applicants Updated to REJECTED: ${updatedToRejectedCount}`);
  console.log('======================================================');
  console.log('\n📊 Final Registrations Breakdown by Status:');
  statusSummary.forEach(s => {
    console.log(`- ${s.status}: ${s._count.id} applicants`);
  });
}

// Self execute if run directly
if (require.main === module) {
  markRemainingAsRejected()
    .catch(err => {
      console.error('❌ Update Failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
