import { prisma } from '../prisma';
import { extractSqlUsers } from './importAllSqlData';

export async function fixKidsSeparation() {
  console.log('🚀 Moving all young children (Play - Class 4 / Age < 11 / KIDS Dept) to শিশু বিভাগ...\n');

  const kidsDept = await prisma.department.findUnique({ where: { id: 'dept-kids' } });
  const kidsSub = await prisma.subject.findUnique({ where: { id: 'sub-kids' } });
  const kidsBatch = await prisma.batch.findUnique({ where: { id: 'batch-kids-1' } });

  const musicDept = await prisma.department.findUnique({ where: { id: 'dept-music' } });
  const musicSub = await prisma.subject.findUnique({ where: { id: 'sub-vocal' } });
  const musicBatch = await prisma.batch.findUnique({ where: { id: 'batch-vocal-1' } });

  if (!kidsDept || !kidsSub || !kidsBatch || !musicDept || !musicSub || !musicBatch) {
    throw new Error('Required departments or batches not found!');
  }

  const sqlUsers = extractSqlUsers();
  const sqlMap = new Map<string, any>();
  sqlUsers.forEach(u => {
    const phone = (u.mobile_offline || u.mobile_online || u.father_mobile || '').replace(/[^0-9]/g, '').slice(-10);
    const name = (u.name || '').trim().toUpperCase();
    if (phone) sqlMap.set(`P:${phone}`, u);
    if (name) sqlMap.set(`N:${name}`, u);
  });

  // Find all students currently in music batch
  const currentMusicMembers = await prisma.batchMembership.findMany({
    where: { batchId: musicBatch.id },
    include: {
      student: {
        include: {
          person: {
            include: {
              registrations: true
            }
          }
        }
      }
    }
  });

  console.log(`Checking ${currentMusicMembers.length} students currently in সংগীত ব্যাচ ০১...`);

  let movedToKidsCount = 0;

  for (const m of currentMusicMembers) {
    const p = m.student.person;
    const phone = (p.phone || '').replace(/[^0-9]/g, '').slice(-10);
    const name = (p.fullNameEn || '').trim().toUpperCase();
    const sqlU = sqlMap.get(`P:${phone}`) || sqlMap.get(`N:${name}`);

    // Calculate age
    let ageNum = 99;
    if (p.dateOfBirth) {
      const birthYear = parseInt(p.dateOfBirth.split('-')[0], 10);
      if (!isNaN(birthYear)) ageNum = 2026 - birthYear;
    }

    const rawClass = (p.currentClass || '').toLowerCase();
    const isJuniorClass = ['প্লে', 'play', 'নার্সারি', 'nursery', 'কেজি', 'kg', 'শিশু', '১ম', 'প্রথম', '২য়', 'দ্বিতীয়', '৩য়', 'তৃতীয়', '৪র্থ', 'চতুর্থ'].some(c => rawClass.includes(c));
    const isSqlKid = (sqlU?.student_department || '').toLowerCase().includes('kid');

    // Rule for Kids Dept: Age <= 10 OR Junior Class OR Originally in KIDS dept
    if ((ageNum <= 10 && ageNum > 0) || isJuniorClass || isSqlKid) {
      console.log(`👶 Moving child to শিশু বিভাগ: [${m.student.studentId}] ${p.fullNameEn} (Age: ${ageNum}, Class: ${p.currentClass || 'N/A'}, SQL: "${sqlU?.student_department || 'N/A'}")`);

      // 1. Move BatchMembership to Kids Batch
      await prisma.batchMembership.update({
        where: { id: m.id },
        data: { batchId: kidsBatch.id }
      });

      // 2. Update Registrations to Kids Department & Subject
      for (const reg of p.registrations) {
        await prisma.registration.update({
          where: { id: reg.id },
          data: {
            departmentId: kidsDept.id,
            subjectId: kidsSub.id
          }
        });
      }

      movedToKidsCount++;
    }
  }

  // Final counts
  const finalMusicStudents = await prisma.batchMembership.count({ where: { batchId: musicBatch.id } });
  const finalKidsStudents = await prisma.batchMembership.count({ where: { batchId: kidsBatch.id } });

  console.log('\n======================================================');
  console.log('🎉 SEPARATION COMPLETED!');
  console.log(`👶 Children moved to শিশু বিভাগ: ${movedToKidsCount}`);
  console.log(`🎵 Senior Students remaining in সংগীত বিভাগ: ${finalMusicStudents}`);
  console.log(`🧒 Total Children in শিশু বিভাগ: ${finalKidsStudents}`);
  console.log('======================================================\n');
}

if (require.main === module) {
  fixKidsSeparation()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
