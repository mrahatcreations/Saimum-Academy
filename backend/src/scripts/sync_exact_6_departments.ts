import { prisma } from '../prisma';

export async function syncExact6Departments() {
  console.log('🚀 Syncing Exact 6 Departments & Directors from Legacy Laravel System...\n');

  const paltanBranch = await prisma.branch.findFirst({
    where: { OR: [{ code: 'PLT' }, { name: { contains: 'Paltan' } }, { name: { contains: 'পল্টন' } }] }
  });

  if (!paltanBranch) throw new Error('Paltan Branch not found!');

  const departmentsData = [
    {
      id: 'dept-kids',
      name: 'শিশু বিভাগ',
      code: 'KIDS',
      directorName: 'মহিউদ্দিন আজাদ',
      directorMobile: '01876768026',
      whatsappNumber: '01821155882',
      whatsappGroupLink: 'https://chat.whatsapp.com/IEiU0qGjqFV3xsIaaArPfP',
      classTime: 'সকাল ৯টা',
      subjectName: 'শিশুতোষ পাঠ',
      subCode: 'KID'
    },
    {
      id: 'dept-theatre',
      name: 'থিয়েটার বিভাগ',
      code: 'THEATRE',
      directorName: 'নাজমুল ইসলাম ইমন',
      directorMobile: null,
      whatsappNumber: null,
      whatsappGroupLink: null,
      classTime: null,
      subjectName: 'থিয়েটার',
      subCode: 'ACT'
    },
    {
      id: 'dept-qirat',
      name: 'ক্বিরাত বিভাগ',
      code: 'QIRAAT',
      directorName: 'ক্বারি মুমিনুল ইসলাম',
      directorMobile: null,
      whatsappNumber: null,
      whatsappGroupLink: null,
      classTime: null,
      subjectName: 'ক্বিরাত',
      subCode: 'QIR'
    },
    {
      id: 'dept-recitation',
      name: 'আবৃত্তি ও উপস্থাপনা বিভাগ',
      code: 'RECITATION',
      directorName: 'সাইদুজ্জামান খান জিহাদ',
      directorMobile: null,
      whatsappNumber: null,
      whatsappGroupLink: null,
      classTime: null,
      subjectName: 'আবৃত্তি ও উপস্থাপনা',
      subCode: 'REC'
    },
    {
      id: 'dept-music',
      name: 'সঙ্গীত বিভাগ',
      code: 'SONGIT',
      directorName: 'রাআদ ইজামা',
      directorMobile: null,
      whatsappNumber: null,
      whatsappGroupLink: null,
      classTime: null,
      subjectName: 'গান',
      subCode: 'SONG'
    },
    {
      id: 'dept-juvenile',
      name: 'কিশোর বিভাগ',
      code: 'JUVENILE',
      directorName: 'রাআদ ইজামা',
      directorMobile: null,
      whatsappNumber: null,
      whatsappGroupLink: null,
      classTime: null,
      subjectName: 'কিশোর সংগীত ও সাংস্কৃতিক পাঠ',
      subCode: 'JUV'
    }
  ];

  for (const d of departmentsData) {
    // 1. Create or Update Department
    let dept = await prisma.department.findUnique({ where: { id: d.id } });
    if (!dept) {
      dept = await prisma.department.create({
        data: {
          id: d.id,
          name: d.name,
          status: 'ACTIVE'
        }
      });
    } else {
      dept = await prisma.department.update({
        where: { id: d.id },
        data: { name: d.name }
      });
    }

    // 2. Link Department to Paltan Branch
    let dbLink = await prisma.departmentBranch.findFirst({
      where: { branchId: paltanBranch.id, departmentId: dept.id }
    });
    if (!dbLink) {
      dbLink = await prisma.departmentBranch.create({
        data: { branchId: paltanBranch.id, departmentId: dept.id }
      });
    }

    // 3. Create or Update Subject
    let sub = await prisma.subject.findFirst({ where: { OR: [{ code: d.subCode }, { name: d.subjectName }] } });
    if (!sub) {
      sub = await prisma.subject.create({
        data: {
          name: d.subjectName,
          code: d.subCode,
          status: 'ACTIVE'
        }
      });
    } else {
      sub = await prisma.subject.update({
        where: { id: sub.id },
        data: { name: d.subjectName, code: d.subCode }
      });
    }

    // 4. Link Subject to Branch & Department
    let bs = await prisma.branchSubject.findFirst({
      where: { branchId: paltanBranch.id, subjectId: sub.id }
    });
    if (!bs) {
      bs = await prisma.branchSubject.create({
        data: {
          branchId: paltanBranch.id,
          subjectId: sub.id,
          departmentBranchId: dbLink.id
        }
      });
    } else {
      bs = await prisma.branchSubject.update({
        where: { id: bs.id },
        data: { departmentBranchId: dbLink.id }
      });
    }

    // 5. Create or Update Batch
    const batchName = `পল্টন সেন্ট্রাল ${d.name.replace(' বিভাগ', '')} ব্যাচ ০১`;
    let batch = await prisma.batch.findFirst({ where: { branchSubjectId: bs.id } });
    if (!batch) {
      batch = await prisma.batch.create({
        data: {
          name: batchName,
          branchSubjectId: bs.id,
          status: 'ACTIVE'
        }
      });
    }

    console.log(`✅ [${d.code}] ${d.name} ➔ পরিচালক: ${d.directorName} | বিষয়: ${d.subjectName}`);
  }

  console.log('\n======================================================');
  console.log('🎉 ALL 6 EXACT DEPARTMENTS FROM SCREENSHOT SYNCED!');
  console.log('======================================================\n');
}

if (require.main === module) {
  syncExact6Departments()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
