import { prisma } from '../prisma';

async function checkCurrentStaff() {
  const staffList = await prisma.staff.findMany({
    include: {
      assignedDepartments: {
        include: { department: true }
      },
      branch: true
    }
  });

  console.log(`Current Staff Count in DB: ${staffList.length}`);
  staffList.forEach(s => {
    const depts = s.assignedDepartments.map(d => d.department.name).join(', ');
    console.log(`- ${s.fullName} | ${s.email} | ${s.designation} | Depts: [${depts}] | Status: ${s.status}`);
  });
}

checkCurrentStaff().finally(() => prisma.$disconnect());
