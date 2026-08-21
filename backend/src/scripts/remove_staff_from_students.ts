import { prisma } from '../prisma';

async function removeStaffFromStudentTable() {
  console.log('🧹 Removing Staff records from Student roster...\n');

  // Find all staff who have person profiles
  const allStaff = await prisma.staff.findMany({
    where: { personId: { not: null } }
  });

  const staffPersonIds = allStaff.map(s => s.personId).filter(Boolean) as string[];
  const staffStudentIds = allStaff.map(s => s.studentId).filter(Boolean) as string[];

  console.log(`Found ${allStaff.length} staff members.`);

  // Find students associated with these staff
  const staffStudents = await prisma.student.findMany({
    where: {
      OR: [
        { personId: { in: staffPersonIds } },
        { studentId: { in: staffStudentIds } }
      ]
    }
  });

  console.log(`Found ${staffStudents.length} student records belonging to staff members.`);

  // Delete batch memberships for these staff members
  const staffStudentTableIds = staffStudents.map(s => s.id);
  const deletedMemberships = await prisma.batchMembership.deleteMany({
    where: { studentId: { in: staffStudentTableIds } }
  });
  console.log(`Deleted ${deletedMemberships.count} staff batch memberships.`);

  // Delete student records for these staff members
  const deletedStudents = await prisma.student.deleteMany({
    where: { id: { in: staffStudentTableIds } }
  });
  console.log(`Deleted ${deletedStudents.count} staff student records.`);

  // Also remove test student if any
  const testStudents = await prisma.student.deleteMany({
    where: {
      OR: [
        { studentId: 'TEST-001' },
        { studentId: 'SA-0000' },
        { person: { fullNameEn: 'Test Student' } }
      ]
    }
  });
  if (testStudents.count > 0) {
    console.log(`Deleted ${testStudents.count} test student records.`);
  }

  // Count final students
  const finalStudentCount = await prisma.student.count();
  console.log(`\n======================================================`);
  console.log(`🎉 FINAL PURE REGULAR STUDENT ROSTER COUNT: ${finalStudentCount}`);
  console.log(`======================================================\n`);

  // Count by department
  const depts = await prisma.department.findMany({
    include: {
      departmentBranches: {
        include: {
          branchSubjects: {
            include: {
              batches: {
                include: {
                  _count: { select: { memberships: true } }
                }
              }
            }
          }
        }
      }
    }
  });

  console.log('--- Department-wise Pure Student Distribution ---');
  depts.forEach(d => {
    let count = 0;
    d.departmentBranches.forEach(db => {
      db.branchSubjects.forEach(bs => {
        bs.batches.forEach(b => {
          count += b._count.memberships;
        });
      });
    });
    console.log(` - ${d.name}: ${count} students`);
  });
}

removeStaffFromStudentTable()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
