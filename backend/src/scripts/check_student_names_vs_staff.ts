import { prisma } from '../prisma';

async function checkAll352() {
  const students = await prisma.student.findMany({
    where: {
      person: {
        staffProfile: null
      }
    },
    include: {
      person: true
    }
  });

  const staff = await prisma.staff.findMany();
  const staffNames = new Set(staff.map(s => s.fullName.toLowerCase().trim()));

  const matchedAsStaff = students.filter(s => 
    staffNames.has(s.person.fullNameEn.toLowerCase().trim()) || 
    staffNames.has(s.person.fullNameBn?.toLowerCase().trim() || '')
  );

  console.log(`Students with name matching staff:`, matchedAsStaff.map(s => ({
    id: s.id,
    sid: s.studentId,
    name: s.person.fullNameEn,
    phone: s.person.phone
  })));
}

checkAll352().finally(() => prisma.$disconnect());
