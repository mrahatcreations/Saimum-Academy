import { prisma } from '../prisma';

async function checkAllDesignations() {
  const staff = await prisma.staff.findMany({ select: { fullName: true, designation: true, role: true } });
  console.log(staff);
}

checkAllDesignations().finally(() => prisma.$disconnect());
