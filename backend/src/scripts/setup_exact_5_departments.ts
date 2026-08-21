import { prisma } from '../prisma';
import { extractSqlUsers } from './importAllSqlData';

export async function setupExact5Departments() {
  console.log('🚀 Configuring Exact 5 Departments & Subjects from Legacy Database...\n');

  // 1. Ensure Paltan Branch exists
  let paltanBranch = await prisma.branch.findFirst({ where: { OR: [{ code: 'PLT' }, { name: { contains: 'Paltan' } }, { name: { contains: 'পল্টন' } }] } });
  if (!paltanBranch) {
    paltanBranch = await prisma.branch.create({
      data: {
        id: 'br-paltan',
        name: 'Dhaka Paltan Branch',
        code: 'PLT',
        type: 'PHYSICAL',
        status: 'ACTIVE'
      }
    });
  }

  // 2. Define the 5 Authentic Departments
  const departmentsData = [
    { id: 'dept-music', name: 'সংগীত বিভাগ' },
    { id: 'dept-kids', name: 'শিশু বিভাগ' },
    { id: 'dept-theatre', name: 'থিয়েটার বিভাগ' },
    { id: 'dept-qirat', name: 'কিরাত বিভাগ' },
    { id: 'dept-recitation', name: 'আবৃত্তি ও উপস্থাপনা বিভাগ' }
  ];

  const createdDepts: Record<string, any> = {};
  const deptBranchMap: Record<string, any> = {};

  for (const d of departmentsData) {
    let dept = await prisma.department.findUnique({ where: { id: d.id } });
    if (!dept) {
      dept = await prisma.department.create({ data: { id: d.id, name: d.name, status: 'ACTIVE' } });
    } else {
      dept = await prisma.department.update({ where: { id: d.id }, data: { name: d.name } });
    }
    createdDepts[d.id] = dept;

    // Link to Paltan Branch
    let dbLink = await prisma.departmentBranch.findFirst({
      where: { branchId: paltanBranch.id, departmentId: dept.id }
    });
    if (!dbLink) {
      dbLink = await prisma.departmentBranch.create({
        data: { branchId: paltanBranch.id, departmentId: dept.id }
      });
    }
    deptBranchMap[d.id] = dbLink;
  }

  // 3. Define the 5 Authentic Subjects
  const subjectsData = [
    { id: 'sub-vocal', name: 'গান', code: 'SONG', deptId: 'dept-music' },
    { id: 'sub-kids', name: 'শিশুতোষ পাঠ', code: 'KID', deptId: 'dept-kids' },
    { id: 'sub-acting', name: 'থিয়েটার', code: 'ACT', deptId: 'dept-theatre' },
    { id: 'sub-qirat', name: 'কিরাত', code: 'QIR', deptId: 'dept-qirat' },
    { id: 'sub-recite', name: 'আবৃত্তি ও উপস্থাপনা', code: 'REC', deptId: 'dept-recitation' }
  ];

  const createdSubs: Record<string, any> = {};
  const branchSubjectMap: Record<string, any> = {};

  for (const s of subjectsData) {
    let sub = await prisma.subject.findUnique({ where: { id: s.id } });
    if (!sub) {
      sub = await prisma.subject.create({ data: { id: s.id, name: s.name, code: s.code, status: 'ACTIVE' } });
    } else {
      sub = await prisma.subject.update({ where: { id: s.id }, data: { name: s.name, code: s.code } });
    }
    createdSubs[s.id] = sub;

    const dbLink = deptBranchMap[s.deptId];

    // BranchSubject mapping
    let bs = await prisma.branchSubject.findFirst({
      where: { branchId: paltanBranch.id, subjectId: sub.id }
    });
    if (!bs) {
      bs = await prisma.branchSubject.create({
        data: { branchId: paltanBranch.id, subjectId: sub.id, departmentBranchId: dbLink.id }
      });
    } else {
      bs = await prisma.branchSubject.update({
        where: { id: bs.id },
        data: { departmentBranchId: dbLink.id }
      });
    }
    branchSubjectMap[s.id] = bs;
  }

  // 4. Create/Update 5 Regular Batches (one for each Department)
  const batchesData = [
    { id: 'batch-vocal-1', name: 'পল্টন সেন্ট্রাল সংগীত ব্যাচ ০১', subId: 'sub-vocal' },
    { id: 'batch-kids-1', name: 'পল্টন সেন্ট্রাল শিশু ব্যাচ ০১', subId: 'sub-kids' },
    { id: 'batch-acting-1', name: 'পল্টন সেন্ট্রাল থিয়েটার ব্যাচ ০১', subId: 'sub-acting' },
    { id: 'batch-qirat-1', name: 'পল্টন সেন্ট্রাল কিরাত ব্যাচ ০১', subId: 'sub-qirat' },
    { id: 'batch-recite-1', name: 'পল্টন সেন্ট্রাল আবৃত্তি ও উপস্থাপনা ব্যাচ ০১', subId: 'sub-recite' }
  ];

  const createdBatches: Record<string, any> = {};
  for (const b of batchesData) {
    const bs = branchSubjectMap[b.subId];
    let batch = await prisma.batch.findUnique({ where: { id: b.id } });
    if (!batch) {
      batch = await prisma.batch.create({
        data: { id: b.id, name: b.name, branchSubjectId: bs.id, status: 'ACTIVE' }
      });
    } else {
      batch = await prisma.batch.update({
        where: { id: b.id },
        data: { name: b.name, branchSubjectId: bs.id }
      });
    }
    createdBatches[b.id] = batch;
  }

  // 5. Re-map all Registrations and Regular Students to their true Department & Subject
  console.log('🔄 Re-mapping 981 registrations and 384 regular students to the 5 authentic departments...');

  const sqlUsers = extractSqlUsers();
  const allPeople = await prisma.person.findMany({
    include: {
      registrations: true,
      studentProfile: true
    }
  });

  const personByPhoneOrName = new Map<string, typeof allPeople[0]>();
  allPeople.forEach(p => {
    const phone = (p.phone || '').replace(/[^0-9]/g, '').slice(-10);
    if (phone && phone.length >= 10) personByPhoneOrName.set(`PHONE:${phone}`, p);
    if (p.fullNameEn) personByPhoneOrName.set(`NAME:${p.fullNameEn.trim().toUpperCase()}`, p);
  });

  let remappedRegs = 0;
  let remappedStudents = 0;

  for (const u of sqlUsers) {
    const phone = (u.mobile_offline || u.mobile_online || u.father_mobile || '').replace(/[^0-9]/g, '').slice(-10);
    const name = (u.name || '').trim().toUpperCase();

    const person = personByPhoneOrName.get(`PHONE:${phone}`) || personByPhoneOrName.get(`NAME:${name}`);
    if (!person) continue;

    // Determine authentic department & subject from SQL dump
    const rawDept = (u.student_department || u.department || '').toLowerCase();
    const rawSub = (u.student_subjects || u.interested_subjects || u.department_subject || '').toLowerCase();

    let targetSub = createdSubs['sub-vocal'];
    let targetDept = createdDepts['dept-music'];
    let targetBatch = createdBatches['batch-vocal-1'];

    if (rawDept.includes('kid') || rawSub.includes('kid') || rawSub.includes('শিশু')) {
      targetSub = createdSubs['sub-kids'];
      targetDept = createdDepts['dept-kids'];
      targetBatch = createdBatches['batch-kids-1'];
    } else if (rawDept.includes('theatre') || rawSub.includes('theatre') || rawSub.includes('acting') || rawSub.includes('অভিনয়') || rawSub.includes('মঞ্চ')) {
      targetSub = createdSubs['sub-acting'];
      targetDept = createdDepts['dept-theatre'];
      targetBatch = createdBatches['batch-acting-1'];
    } else if (rawDept.includes('recit') || rawSub.includes('recit') || rawSub.includes('আবৃত্তি') || rawSub.includes('presentation') || rawSub.includes('উপস্থাপনা')) {
      targetSub = createdSubs['sub-recite'];
      targetDept = createdDepts['dept-recitation'];
      targetBatch = createdBatches['batch-recite-1'];
    } else if (rawDept.includes('qira') || rawSub.includes('qira') || rawSub.includes('কুরআন') || rawSub.includes('কিরাত')) {
      targetSub = createdSubs['sub-qirat'];
      targetDept = createdDepts['dept-qirat'];
      targetBatch = createdBatches['batch-qirat-1'];
    }

    // Update person's registrations
    for (const reg of person.registrations) {
      await prisma.registration.update({
        where: { id: reg.id },
        data: {
          subjectId: targetSub.id,
          departmentId: targetDept.id
        }
      });
      remappedRegs++;
    }

    // If regular student, assign to batch
    if (person.studentProfile) {
      await prisma.batchMembership.deleteMany({ where: { studentId: person.studentProfile.id } });
      await prisma.batchMembership.create({
        data: {
          studentId: person.studentProfile.id,
          batchId: targetBatch.id,
          status: 'ACTIVE'
        }
      });
      remappedStudents++;
    }
  }

  // 6. Print summary
  const summaryBatches = await prisma.batch.findMany({
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
  console.log('🎉 5 AUTHENTIC DEPARTMENTS & SUBJECTS FULLY CONFIGURED!');
  console.log('======================================================');
  summaryBatches.forEach(b => {
    console.log(`📌 Batch: "${b.name}"`);
    console.log(`   - Department: ${b.branchSubject.departmentBranch?.department?.name || 'N/A'}`);
    console.log(`   - Subject: ${b.branchSubject.subject.name}`);
    console.log(`   - Total Enrolled Regular Students: ${b.memberships.length}`);
  });
  console.log('======================================================\n');
}

if (require.main === module) {
  setupExact5Departments()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
