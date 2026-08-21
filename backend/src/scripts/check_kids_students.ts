import { prisma } from '../prisma';

async function checkKidsStudents() {
  console.log('🔍 Checking Students for "শিশুতোষ সাংস্কৃতিক পাঠ (Kids Cultural Arts)"...\n');

  // 1. Check Subject & Department records
  const kidsSubject = await prisma.subject.findFirst({
    where: {
      OR: [
        { name: { contains: 'শিশু' } },
        { name: { contains: 'Kids' } },
        { code: 'SUB-KIDS' }
      ]
    }
  });

  const kidsDept = await prisma.department.findFirst({
    where: {
      OR: [
        { name: { contains: 'শিশু' } },
        { name: { contains: 'Kids' } }
      ]
    }
  });

  console.log(`Subject found: "${kidsSubject?.name}" (ID: ${kidsSubject?.id})`);
  console.log(`Department found: "${kidsDept?.name}" (ID: ${kidsDept?.id})`);

  // 2. Check Registrations for Kids Cultural Arts
  const kidsRegs = await prisma.registration.findMany({
    where: {
      OR: [
        kidsSubject ? { subjectId: kidsSubject.id } : {},
        kidsDept ? { departmentId: kidsDept.id } : {}
      ]
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

  console.log(`\n📊 Total Registrations under Kids Cultural Arts: ${kidsRegs.length}`);
  const selectedKids = kidsRegs.filter(r => r.status === 'SELECTED');
  const rejectedKids = kidsRegs.filter(r => r.status === 'REJECTED');
  const regularStudentsWithId = kidsRegs.filter(r => !!r.person.studentProfile?.studentId);

  console.log(`- Selected / Workshop Completed: ${selectedKids.length}`);
  console.log(`- Regular Students with Student ID: ${regularStudentsWithId.length}`);
  console.log(`- Rejected / Not Selected: ${rejectedKids.length}`);

  // 3. Check Batch Memberships in Kids Batch
  const kidsBatch = await prisma.batch.findFirst({
    where: {
      OR: [
        { name: { contains: 'শিশু' } },
        { name: { contains: 'Kids' } }
      ]
    },
    include: {
      memberships: {
        include: {
          student: {
            include: {
              person: true
            }
          }
        }
      }
    }
  });

  if (kidsBatch) {
    console.log(`\n🎓 Regular Batch: "${kidsBatch.name}"`);
    console.log(`Total Enrolled Regular Students: ${kidsBatch.memberships.length}`);
    console.log('\nSample Regular Students in Kids Batch:');
    kidsBatch.memberships.slice(0, 15).forEach((m, idx) => {
      console.log(`${idx + 1}. [Student ID: ${m.student.studentId}] ${m.student.person.fullNameEn} (${m.student.person.fullNameBn || ''}) | Phone: ${m.student.person.phone} | Age/DOB: ${m.student.person.dateOfBirth}`);
    });
  }
}

checkKidsStudents()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
