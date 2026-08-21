import { prisma } from '../prisma';

async function listSubjectsDepts() {
  const subs = await prisma.subject.findMany();
  const depts = await prisma.department.findMany();
  console.log('=== SUBJECTS ===');
  subs.forEach(s => console.log(`ID: ${s.id} | Name: "${s.name}" | Code: ${s.code}`));
  console.log('\n=== DEPARTMENTS ===');
  depts.forEach(d => console.log(`ID: ${d.id} | Name: "${d.name}" | Code: ${d.code}`));
}

listSubjectsDepts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
