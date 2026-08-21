import { prisma } from '../prisma';

async function verifyCounts() {
  const peopleCount = await prisma.person.count();
  const regCount = await prisma.registration.count();
  const studentCount = await prisma.student.count();
  const branchCount = await prisma.branch.count();
  const deptCount = await prisma.department.count();
  const batchCount = await prisma.batch.count();
  const wsBatchCount = await prisma.workshopBatch.count();
  const wsEnrollmentCount = await prisma.workshopStudentEnrollment.count();
  const sessionCount = await prisma.admissionSession.count();
  const staffCount = await prisma.staff.count();

  console.log('=== DATABASE VERIFICATION ===');
  console.log('Branches:', branchCount);
  console.log('Departments:', deptCount);
  console.log('Staff:', staffCount);
  console.log('Admission Sessions:', sessionCount);
  console.log('People:', peopleCount);
  console.log('Registrations:', regCount);
  console.log('Regular Students:', studentCount);
  console.log('Regular Batches:', batchCount);
  console.log('Workshop Batches:', wsBatchCount);
  console.log('Workshop Enrollments:', wsEnrollmentCount);

  // Sample Registrations
  const sampleRegs = await prisma.registration.findMany({
    take: 5,
    include: {
      person: true,
      branch: true
    }
  });
  console.log('\n=== SAMPLE REGISTRATIONS ===');
  sampleRegs.forEach(r => {
    console.log(`[${r.registrationNo}] ${r.person.fullNameEn} (${r.person.fullNameBn}) | Phone: ${r.person.phone} | Status: ${r.status} | Branch: ${r.branch.name}`);
  });
}

verifyCounts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
