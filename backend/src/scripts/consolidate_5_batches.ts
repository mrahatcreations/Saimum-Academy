import { prisma } from '../prisma';

async function consolidateBatches() {
  console.log('🧹 Consolidating exactly 5 clean batches for the 5 departments...\n');

  const mainBatches = [
    { id: 'batch-vocal-1', name: 'পল্টন সেন্ট্রাল সংগীত ব্যাচ ০১', subId: 'sub-vocal' },
    { id: 'batch-kids-1', name: 'পল্টন সেন্ট্রাল শিশু ব্যাচ ০১', subId: 'sub-kids' },
    { id: 'batch-acting-1', name: 'পল্টন সেন্ট্রাল থিয়েটার ব্যাচ ০১', subId: 'sub-acting' },
    { id: 'batch-qirat-1', name: 'পল্টন সেন্ট্রাল কিরাত ব্যাচ ০১', subId: 'sub-qirat' },
    { id: 'batch-recite-1', name: 'পল্টন সেন্ট্রাল আবৃত্তি ও উপস্থাপনা ব্যাচ ০১', subId: 'sub-recite' }
  ];

  const mainBatchIds = new Set(mainBatches.map(b => b.id));

  // Find all other batches
  const otherBatches = await prisma.batch.findMany({
    where: {
      id: { notIn: Array.from(mainBatchIds) }
    },
    include: {
      memberships: true,
      branchSubject: true
    }
  });

  for (const ob of otherBatches) {
    const subId = ob.branchSubject.subjectId;
    let targetBatchId = 'batch-vocal-1';
    if (subId === 'sub-kids') targetBatchId = 'batch-kids-1';
    else if (subId === 'sub-acting') targetBatchId = 'batch-acting-1';
    else if (subId === 'sub-qirat') targetBatchId = 'batch-qirat-1';
    else if (subId === 'sub-recite') targetBatchId = 'batch-recite-1';

    // Move memberships
    for (const m of ob.memberships) {
      await prisma.batchMembership.update({
        where: { id: m.id },
        data: { batchId: targetBatchId }
      });
    }

    // Delete redundant batch
    await prisma.staffBatchAssignment.deleteMany({ where: { batchId: ob.id } });
    await prisma.batch.delete({ where: { id: ob.id } });
    console.log(`Deleted extra batch: "${ob.name}"`);
  }

  // Summary
  const finalBatches = await prisma.batch.findMany({
    include: {
      memberships: true,
      branchSubject: {
        include: {
          subject: true,
          departmentBranch: {
            include: {
              department: true
            }
          }
        }
      }
    }
  });

  console.log('\n======================================================');
  console.log('🎉 EXACT 5 DEPARTMENT BATCHES CONSOLIDATED!');
  console.log('======================================================');
  finalBatches.forEach((b, idx) => {
    console.log(`${idx + 1}. Batch: "${b.name}"`);
    console.log(`   - Department: ${b.branchSubject.departmentBranch?.department?.name || 'N/A'}`);
    console.log(`   - Subject: ${b.branchSubject.subject.name}`);
    console.log(`   - Enrolled Students: ${b.memberships.length}`);
  });
  console.log('======================================================\n');
}

consolidateBatches()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
