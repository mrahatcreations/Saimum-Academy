import { prisma } from '../prisma';

async function fixTahsinMahmud() {
  // Find Tahsin Mahmud in staff
  const staffTahsin = await prisma.staff.findFirst({
    where: { fullName: { contains: 'Tahsin' } }
  });

  // Find Tahsin Mahmud in student
  const studentTahsin = await prisma.student.findFirst({
    where: { studentId: '202604000275' },
    include: { person: true }
  });

  if (staffTahsin && studentTahsin) {
    console.log(`Linking Staff "${staffTahsin.fullName}" to Person "${studentTahsin.person.fullNameEn}"`);
    await prisma.staff.update({
      where: { id: staffTahsin.id },
      data: {
        personId: studentTahsin.personId,
        studentId: studentTahsin.studentId
      }
    });

    // Delete student record and batch memberships
    await prisma.batchMembership.deleteMany({ where: { studentId: studentTahsin.id } });
    await prisma.student.delete({ where: { id: studentTahsin.id } });
    console.log(`Removed staff member from student roster.`);
  }

  const finalCount = await prisma.student.count();
  console.log(`\n======================================================`);
  console.log(`🎉 EXACT FINAL PURE REGULAR STUDENT ROSTER: ${finalCount}`);
  console.log(`======================================================\n`);
}

fixTahsinMahmud().finally(() => prisma.$disconnect());
