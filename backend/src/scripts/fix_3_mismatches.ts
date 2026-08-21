import { prisma } from '../prisma';

async function fix3ExactMismatches() {
  console.log('🔧 Fixing 3 exact student department assignments to match SQL dump 100%...\n');

  const recDept = await prisma.department.findUnique({ where: { id: 'dept-recitation' } });
  const recSub = await prisma.subject.findUnique({ where: { id: 'sub-recite' } });
  const recBatch = await prisma.batch.findUnique({ where: { id: 'batch-recite-1' } });

  const qirDept = await prisma.department.findUnique({ where: { id: 'dept-qirat' } });
  const qirSub = await prisma.subject.findUnique({ where: { id: 'sub-qirat' } });
  const qirBatch = await prisma.batch.findUnique({ where: { id: 'batch-qirat-1' } });

  // 1. Fix Waziha Tuz Sawda (202604000329) -> Recitation
  const s1 = await prisma.student.findUnique({ where: { studentId: '202604000329' }, include: { person: { include: { registrations: true } } } });
  if (s1 && recBatch && recDept && recSub) {
    await prisma.batchMembership.updateMany({ where: { studentId: s1.id }, data: { batchId: recBatch.id } });
    for (const r of s1.person.registrations) {
      await prisma.registration.update({ where: { id: r.id }, data: { departmentId: recDept.id, subjectId: recSub.id } });
    }
    console.log(`✅ Fixed [${s1.studentId}] Waziha Tuz Sawda -> আবৃত্তি ও উপস্থাপনা বিভাগ`);
  }

  // 2. Fix NOSAIBA MONTAHA TAHIA (202604000346) -> Recitation
  const s2 = await prisma.student.findUnique({ where: { studentId: '202604000346' }, include: { person: { include: { registrations: true } } } });
  if (s2 && recBatch && recDept && recSub) {
    await prisma.batchMembership.updateMany({ where: { studentId: s2.id }, data: { batchId: recBatch.id } });
    for (const r of s2.person.registrations) {
      await prisma.registration.update({ where: { id: r.id }, data: { departmentId: recDept.id, subjectId: recSub.id } });
    }
    console.log(`✅ Fixed [${s2.studentId}] NOSAIBA MONTAHA TAHIA -> আবৃত্তি ও উপস্থাপনা বিভাগ`);
  }

  // 3. Fix Mohammad Assadullah (202604000306) -> Qiraat
  const s3 = await prisma.student.findUnique({ where: { studentId: '202604000306' }, include: { person: { include: { registrations: true } } } });
  if (s3 && qirBatch && qirDept && qirSub) {
    await prisma.batchMembership.updateMany({ where: { studentId: s3.id }, data: { batchId: qirBatch.id } });
    for (const r of s3.person.registrations) {
      await prisma.registration.update({ where: { id: r.id }, data: { departmentId: qirDept.id, subjectId: qirSub.id } });
    }
    console.log(`✅ Fixed [${s3.studentId}] Mohammad Assadullah -> কিরাত বিভাগ`);
  }

  console.log('\n🎉 All 3 students fixed to 100% match saimumor_academy.sql!');
}

fix3ExactMismatches()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
