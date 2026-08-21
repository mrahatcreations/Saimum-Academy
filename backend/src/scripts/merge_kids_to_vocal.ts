import { prisma } from '../prisma';

export async function mergeKidsIntoVocalMusic() {
  console.log('🚀 Merging "Kids" into "গান (Vocal Music)"...\n');

  const subVocal = await prisma.subject.findUnique({ where: { id: 'sub-vocal' } });
  const deptMusic = await prisma.department.findUnique({ where: { id: 'dept-music' } });
  const subKids = await prisma.subject.findUnique({ where: { id: 'sub-kids' } });
  const deptKids = await prisma.department.findUnique({ where: { id: 'dept-kids' } });

  if (!subVocal || !deptMusic) {
    throw new Error('Vocal Music Subject or Music Department not found!');
  }

  console.log(`Target Subject: "${subVocal.name}" (${subVocal.id})`);
  console.log(`Target Department: "${deptMusic.name}" (${deptMusic.id})`);

  // 1. Move all registrations to sub-vocal and dept-music
  if (subKids || deptKids) {
    const updatedRegs = await prisma.registration.updateMany({
      where: {
        OR: [
          subKids ? { subjectId: subKids.id } : {},
          deptKids ? { departmentId: deptKids.id } : {}
        ]
      },
      data: {
        subjectId: subVocal.id,
        departmentId: deptMusic.id
      }
    });
    console.log(`✅ Moved ${updatedRegs.count} registrations to Subject: "${subVocal.name}"`);
  }

  // 2. Find Paltan branch and branchSubject for Vocal Music
  const paltanBranch = await prisma.branch.findFirst({ where: { name: { contains: 'পল্টন' } } });
  
  let branchSubVocal = await prisma.branchSubject.findFirst({
    where: {
      branchId: paltanBranch?.id,
      subjectId: subVocal.id
    }
  });

  if (!branchSubVocal && paltanBranch) {
    branchSubVocal = await prisma.branchSubject.create({
      data: {
        branchId: paltanBranch.id,
        subjectId: subVocal.id,
        departmentId: deptMusic.id
      }
    });
  }

  // 3. Move Batches belonging to Kids to branchSubVocal
  if (subKids && branchSubVocal) {
    const kidsBranchSubs = await prisma.branchSubject.findMany({
      where: { subjectId: subKids.id }
    });

    for (const kbs of kidsBranchSubs) {
      await prisma.batch.updateMany({
        where: { branchSubjectId: kbs.id },
        data: {
          branchSubjectId: branchSubVocal.id,
          name: 'পল্টন সেন্ট্রাল গান ব্যাচ (জুনিয়র)'
        }
      });
    }
  }

  // 4. Delete staff department assignment for Kids
  if (deptKids) {
    await prisma.staffDepartmentAssignment.deleteMany({
      where: { departmentId: deptKids.id }
    });
  }

  // 5. Delete Kids BranchSubject, Subject, and Department
  if (subKids) {
    await prisma.branchSubject.deleteMany({ where: { subjectId: subKids.id } });
    await prisma.subject.delete({ where: { id: subKids.id } }).catch(err => console.log('Subject delete note:', err.message));
    console.log(`🗑️ Removed Subject: "${subKids.name}"`);
  }

  if (deptKids) {
    await prisma.departmentBranch.deleteMany({ where: { departmentId: deptKids.id } });
    await prisma.department.delete({ where: { id: deptKids.id } }).catch(err => console.log('Department delete note:', err.message));
    console.log(`🗑️ Removed Department: "${deptKids.name}"`);
  }

  // 6. Verify final counts
  const finalSubs = await prisma.subject.findMany();
  const finalDepts = await prisma.department.findMany();
  const vocalRegsCount = await prisma.registration.count({ where: { subjectId: subVocal.id } });

  console.log('\n======================================================');
  console.log('🎉 KIDS SUCCESSFULLY MERGED INTO "গান" (VOCAL MUSIC)!');
  console.log(`🎵 Total Registrations under "গান": ${vocalRegsCount}`);
  console.log('📚 Remaining Authentic Subjects:');
  finalSubs.forEach(s => console.log(`   - ${s.name} (${s.code})`));
  console.log('🏛️ Remaining Authentic Departments:');
  finalDepts.forEach(d => console.log(`   - ${d.name}`));
  console.log('======================================================\n');
}

if (require.main === module) {
  mergeKidsIntoVocalMusic()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
