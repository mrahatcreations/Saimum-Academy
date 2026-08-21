import { prisma } from '../prisma';

async function verifyAllData() {
  const peopleCount = await prisma.person.count();
  const regCount = await prisma.registration.count();
  const studentCount = await prisma.student.count();
  const batchCount = await prisma.batch.count();
  const sessionCount = await prisma.admissionSession.count();

  const regByStatus = await prisma.registration.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  console.log('=== COMPLETE DATABASE VERIFICATION ===');
  console.log('Total People:', peopleCount);
  console.log('Total Registrations:', regCount);
  console.log('Total Graduated Regular Students:', studentCount);
  console.log('Total Department Batches:', batchCount);
  console.log('Total Admission Sessions:', sessionCount);

  console.log('\n=== REGISTRATION STATUS COUNTS ===');
  regByStatus.forEach(r => {
    console.log(`- ${r.status}: ${r._count.id} applicants`);
  });

  console.log('\n=== SAMPLE REGULAR STUDENTS WITH DISTINCT STUDENT IDs ===');
  const sampleStudents = await prisma.student.findMany({
    take: 10,
    include: {
      person: {
        include: {
          registrations: true
        }
      },
      batchMemberships: {
        include: {
          batch: true
        }
      }
    }
  });

  sampleStudents.forEach((s, idx) => {
    const reg = s.person.registrations[0];
    const batch = s.batchMemberships[0]?.batch;
    console.log(`${idx + 1}. [Student ID: ${s.studentId}] Name: ${s.person.fullNameEn} (${s.person.fullNameBn || 'N/A'}) | Reg No: ${reg?.registrationNo} | Batch: ${batch?.name}`);
  });
}

verifyAllData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
