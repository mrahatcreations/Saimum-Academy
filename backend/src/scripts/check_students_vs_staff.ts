import { prisma } from '../prisma';

async function checkStudentsVsStaff() {
  const totalStudents = await prisma.student.count();
  const staffWithStudentProfile = await prisma.staff.findMany({
    where: { studentId: { not: null } }
  });

  const studentsWhoAreStaff = await prisma.student.findMany({
    where: {
      person: {
        staffProfile: { isNot: null }
      }
    },
    include: {
      person: {
        include: { staffProfile: true }
      }
    }
  });

  console.log(`Total records in Student table: ${totalStudents}`);
  console.log(`Students who are Staff members: ${studentsWhoAreStaff.length}`);
  console.log(`Pure Regular Students (Excluding Staff): ${totalStudents - studentsWhoAreStaff.length}`);

  console.log('\n--- Staff with Student records ---');
  studentsWhoAreStaff.forEach(s => {
    console.log(`- StudentID: ${s.studentId} | Name: ${s.person.fullNameEn} | Staff Role: ${s.person.staffProfile?.designation}`);
  });
}

checkStudentsVsStaff().finally(() => prisma.$disconnect());
