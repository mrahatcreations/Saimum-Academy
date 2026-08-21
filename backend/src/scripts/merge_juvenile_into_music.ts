import { prisma } from '../prisma';

async function mergeJuvenileIntoMusic() {
  console.log('🚀 Merging Juvenile into সঙ্গীত বিভাগ (Songit)...\n');

  const juvenileDept = await prisma.department.findUnique({ where: { id: 'dept-juvenile' } });
  const musicDept = await prisma.department.findUnique({ where: { id: 'dept-music' } });
  const musicSub = await prisma.subject.findUnique({ where: { id: 'sub-vocal' } });
  const musicBatch = await prisma.batch.findUnique({ where: { id: 'batch-vocal-1' } });

  if (juvenileDept && musicDept && musicSub && musicBatch) {
    // 1. Re-link registrations
    await prisma.registration.updateMany({
      where: { departmentId: juvenileDept.id },
      data: { departmentId: musicDept.id, subjectId: musicSub.id }
    });

    // 2. Find and re-link/delete branch subjects for juvenile
    const deptBranches = await prisma.departmentBranch.findMany({ where: { departmentId: juvenileDept.id } });
    for (const db of deptBranches) {
      const branchSubjects = await prisma.branchSubject.findMany({ where: { departmentBranchId: db.id } });
      for (const bs of branchSubjects) {
        await prisma.batch.deleteMany({ where: { branchSubjectId: bs.id } });
        await prisma.branchSubject.delete({ where: { id: bs.id } });
      }
      await prisma.departmentBranch.delete({ where: { id: db.id } });
    }

    // 3. Delete juvenile department
    await prisma.department.delete({ where: { id: juvenileDept.id } }).catch(() => {});
    console.log('✅ Juvenile successfully merged into সঙ্গীত বিভাগ!');
  }

  // Ensure 5 departments have exact names
  const depts = [
    { id: 'dept-kids', name: 'শিশু বিভাগ' },
    { id: 'dept-music', name: 'সঙ্গীত বিভাগ' },
    { id: 'dept-theatre', name: 'থিয়েটার বিভাগ' },
    { id: 'dept-qirat', name: 'ক্বিরাত বিভাগ' },
    { id: 'dept-recitation', name: 'আবৃত্তি ও উপস্থাপনা বিভাগ' }
  ];

  for (const d of depts) {
    await prisma.department.update({
      where: { id: d.id },
      data: { name: d.name }
    });
  }

  const finalDepts = await prisma.department.findMany({
    include: {
      branches: {
        include: {
          subjects: {
            include: {
              batches: {
                include: {
                  memberships: true
                }
              }
            }
          }
        }
      }
    }
  });

  console.log('\n======================================================');
  console.log('🏛️ YOUR CURRENT SITE 5 DEPARTMENTS & BATCHES STATUS:');
  console.log('======================================================');
  finalDepts.forEach((dept, idx) => {
    let studentCount = 0;
    dept.branches.forEach(b => b.subjects.forEach(s => s.batches.forEach(batch => studentCount += batch.memberships.length)));
    console.log(`${idx + 1}. [${dept.name}] ➔ মোট নিয়মিত শিক্ষার্থী: ${studentCount} জন`);
  });
  console.log('======================================================\n');
}

mergeJuvenileIntoMusic()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
