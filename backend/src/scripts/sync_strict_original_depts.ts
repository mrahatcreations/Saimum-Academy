import { extractSqlUsers } from './importAllSqlData';
import { prisma } from '../prisma';

export async function syncStrictOriginalDepartments() {
  console.log('🚀 Syncing 100% Literal `student_department` from SQL Dump into Batches...\n');

  const sqlUsers = extractSqlUsers();
  const sqlRegulars = sqlUsers.filter(u => u.student_id && u.student_id.trim().length > 0 && u.student_id !== 'null');

  const musicBatch = await prisma.batch.findUnique({ where: { id: 'batch-vocal-1' } });
  const kidsBatch = await prisma.batch.findUnique({ where: { id: 'batch-kids-1' } });
  const theatreBatch = await prisma.batch.findUnique({ where: { id: 'batch-acting-1' } });
  const qiratBatch = await prisma.batch.findUnique({ where: { id: 'batch-qirat-1' } });
  const reciteBatch = await prisma.batch.findUnique({ where: { id: 'batch-recite-1' } });

  const musicDept = await prisma.department.findUnique({ where: { id: 'dept-music' } });
  const kidsDept = await prisma.department.findUnique({ where: { id: 'dept-kids' } });
  const theatreDept = await prisma.department.findUnique({ where: { id: 'dept-theatre' } });
  const qiratDept = await prisma.department.findUnique({ where: { id: 'dept-qirat' } });
  const reciteDept = await prisma.department.findUnique({ where: { id: 'dept-recitation' } });

  const musicSub = await prisma.subject.findUnique({ where: { id: 'sub-vocal' } });
  const kidsSub = await prisma.subject.findUnique({ where: { id: 'sub-kids' } });
  const theatreSub = await prisma.subject.findUnique({ where: { id: 'sub-acting' } });
  const qiratSub = await prisma.subject.findUnique({ where: { id: 'sub-qirat' } });
  const reciteSub = await prisma.subject.findUnique({ where: { id: 'sub-recite' } });

  for (const u of sqlRegulars) {
    const sId = u.student_id.trim();
    const rawDept = (u.student_department || '').trim();

    const student = await prisma.student.findUnique({
      where: { studentId: sId },
      include: { person: { include: { registrations: true } } }
    });

    if (!student) continue;

    let targetBatch = musicBatch;
    let targetDept = musicDept;
    let targetSub = musicSub;

    if (rawDept === 'Songit') {
      targetBatch = musicBatch;
      targetDept = musicDept;
      targetSub = musicSub;
    } else if (rawDept === 'Theatre') {
      targetBatch = theatreBatch;
      targetDept = theatreDept;
      targetSub = theatreSub;
    } else if (rawDept === 'Qiraat') {
      targetBatch = qiratBatch;
      targetDept = qiratDept;
      targetSub = qiratSub;
    } else if (rawDept === 'Recitation & Presentation') {
      targetBatch = reciteBatch;
      targetDept = reciteDept;
      targetSub = reciteSub;
    } else if (rawDept.includes('KIDS')) {
      targetBatch = kidsBatch;
      targetDept = kidsDept;
      targetSub = kidsSub;
    } else if (rawDept === 'Juvenile') {
      targetBatch = musicBatch;
      targetDept = musicDept;
      targetSub = musicSub;
    } else if (rawDept.includes('Theatre')) {
      targetBatch = theatreBatch;
      targetDept = theatreDept;
      targetSub = theatreSub;
    } else if (rawDept.includes('Qiraat')) {
      targetBatch = qiratBatch;
      targetDept = qiratDept;
      targetSub = qiratSub;
    } else if (rawDept.includes('Recitation')) {
      targetBatch = reciteBatch;
      targetDept = reciteDept;
      targetSub = reciteSub;
    }

    if (targetBatch && targetDept && targetSub) {
      await prisma.batchMembership.updateMany({
        where: { studentId: student.id },
        data: { batchId: targetBatch.id }
      });

      for (const reg of student.person.registrations) {
        await prisma.registration.update({
          where: { id: reg.id },
          data: { departmentId: targetDept.id, subjectId: targetSub.id }
        });
      }
    }
  }

  // Final summary
  const summaryBatches = await prisma.batch.findMany({
    include: {
      memberships: true,
      branchSubject: {
        include: {
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
  console.log('🏛️ FINAL BATCH COUNTS MATCHING EXACT ORIGINAL SQL:');
  console.log('======================================================');
  summaryBatches.forEach(b => {
    console.log(`📌 Batch: "${b.name}" (${b.branchSubject.departmentBranch.department.name}) ➔ ${b.memberships.length} জন`);
  });
  console.log('======================================================\n');
}

if (require.main === module) {
  syncStrictOriginalDepartments()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
