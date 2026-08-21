import { prisma } from '../prisma';
import { extractSqlUsers } from './importAllSqlData';

export async function fixPreciseAgeFiltering() {
  console.log('🚀 Running Airtight Separation for সংগীত বিভাগ (Seniors) vs শিশু বিভাগ (Children)...\n');

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

  // Get all batch memberships across both music and kids
  const memberships = await prisma.batchMembership.findMany({
    where: {
      batchId: { in: [musicBatch.id, kidsBatch.id] }
    },
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

  console.log(`Processing ${memberships.length} total students across Music and Kids...`);

  let seniorCount = 0;
  let childCount = 0;

  for (const m of memberships) {
    const p = m.student.person;
    const phone = (p.phone || '').replace(/[^0-9]/g, '').slice(-10);
    const name = (p.fullNameEn || '').trim().toUpperCase();
    const sqlU = sqlMap.get(`P:${phone}`) || sqlMap.get(`N:${name}`);

    // Calculate exact age
    let age = 0;
    if (p.dateOfBirth) {
      const birthYear = parseInt(p.dateOfBirth.split('-')[0], 10);
      if (!isNaN(birthYear)) age = 2026 - birthYear;
    }

    const rawClass = (p.currentClass || '').toLowerCase();
    const isSeniorClass = [
      'স্নাতক', 'ডিগ্রি', 'অনার্স', 'মাস্টার্স', 'ফাজিল', 'কামিল', 'এইচএসসি', 'hsc', 'একাদশ', 'দ্বাদশ',
      'কলেজ', 'বিশ্ববিদ্যালয়', 'চাকরি', 'আলিম', 'দাখিল', 'নবম', 'দশম', 'ssc', 'honours', 'degree', 'masters', 'university'
    ].some(c => rawClass.includes(c));

    const isChildClass = [
      'প্লে', 'play', 'নার্সারি', 'nursery', 'কেজি', 'kg', 'শিশু শ্রেণী', 'প্রথম শ্রেণী', '১ম শ্রেণী',
      'দ্বিতীয় শ্রেণী', '২য় শ্রেণী', 'তৃতীয় শ্রেণী', '৩য় শ্রেণী', 'চতুর্থ শ্রেণী', '৪র্থ শ্রেণী', 'পঞ্চম শ্রেণী', '৫ম শ্রেণী'
    ].some(c => rawClass.includes(c));

    const rawSqlDept = (sqlU?.student_department || '').toLowerCase();
    const isExplicitSongit = rawSqlDept.includes('songit') && !rawSqlDept.includes('kid');
    const isExplicitKid = rawSqlDept.includes('kid');

    let isChild = false;

    if (isSeniorClass || age >= 14) {
      isChild = false; // Strictly Senior
    } else if (isChildClass || (age <= 10 && age > 0) || isExplicitKid) {
      isChild = true;  // Strictly Child
    } else if (isExplicitSongit) {
      isChild = false;
    } else {
      isChild = age < 12;
    }

    if (isChild) {
      // Belongs to শিশু বিভাগ
      if (m.batchId !== kidsBatch.id) {
        await prisma.batchMembership.update({ where: { id: m.id }, data: { batchId: kidsBatch.id } });
      }
      for (const reg of p.registrations) {
        await prisma.registration.update({
          where: { id: reg.id },
          data: { departmentId: kidsDept.id, subjectId: kidsSub.id }
        });
      }
      childCount++;
    } else {
      // Belongs to সংগীত বিভাগ (Senior Vocal Music)
      if (m.batchId !== musicBatch.id) {
        await prisma.batchMembership.update({ where: { id: m.id }, data: { batchId: musicBatch.id } });
      }
      for (const reg of p.registrations) {
        await prisma.registration.update({
          where: { id: reg.id },
          data: { departmentId: musicDept.id, subjectId: musicSub.id }
        });
      }
      seniorCount++;
    }
  }

  console.log('\n======================================================');
  console.log('🎉 AIRTIGHT SEPARATION COMPLETED!');
  console.log(`🎵 সংগীত বিভাগ (Senior Vocal Music Artists): ${seniorCount} জন`);
  console.log(`👶 শিশু বিভাগ (Kids Cultural Wing Children): ${childCount} জন`);
  console.log('======================================================\n');
}

if (require.main === module) {
  fixPreciseAgeFiltering()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
