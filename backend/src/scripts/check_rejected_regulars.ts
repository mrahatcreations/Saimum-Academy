import { prisma } from '../prisma';

async function checkRejectedRegulars() {
  console.log('🔍 Checking for applicants who are marked REJECTED but have Regular Student profile...\n');

  // Case 1: Person has studentProfile, but ALL of their registrations are REJECTED
  const studentsWithRejectedRegs = await prisma.person.findMany({
    where: {
      studentProfile: { isNot: null }
    },
    include: {
      studentProfile: {
        include: {
          batchMemberships: {
            include: {
              batch: true
            }
          }
        }
      },
      registrations: true
    }
  });

  const fullyRejectedStudents = studentsWithRejectedRegs.filter(p => 
    p.registrations.length > 0 && p.registrations.every(r => r.status === 'REJECTED')
  );

  console.log(`1. Total Regular Students whose ALL registrations are REJECTED: ${fullyRejectedStudents.length}`);
  fullyRejectedStudents.forEach((p, idx) => {
    console.log(`   ${idx + 1}. [Student ID: ${p.studentProfile?.studentId}] ${p.fullNameEn} | Regs:`, p.registrations.map(r => `${r.registrationNo} (${r.status})`));
  });

  // Case 2: Multi-subject students who are SELECTED in one subject but REJECTED in another
  const mixedStudents = studentsWithRejectedRegs.filter(p => 
    p.registrations.some(r => r.status === 'SELECTED') && p.registrations.some(r => r.status === 'REJECTED')
  );

  console.log(`\n2. Multi-subject Regular Students who are SELECTED in 1 subject and REJECTED in another: ${mixedStudents.length}`);
  mixedStudents.forEach((p, idx) => {
    console.log(`   ${idx + 1}. [Student ID: ${p.studentProfile?.studentId}] ${p.fullNameEn} | Regs:`, p.registrations.map(r => `${r.registrationNo}: ${r.status} (${r.subjectId || 'Subject'})`));
  });

  // Case 3: Any person marked REJECTED who has a batch membership
  const rejectedWithBatch = await prisma.registration.findMany({
    where: {
      status: 'REJECTED',
      person: {
        studentProfile: {
          batchMemberships: {
            some: {}
          }
        }
      }
    },
    include: {
      person: {
        include: {
          studentProfile: {
            include: {
              batchMemberships: {
                include: {
                  batch: true
                }
              }
            }
          }
        }
      }
    }
  });

  console.log(`\n3. Total REJECTED registration records belonging to people who are currently in regular batches: ${rejectedWithBatch.length}`);
}

checkRejectedRegulars()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
