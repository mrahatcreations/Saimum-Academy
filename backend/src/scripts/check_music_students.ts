import { prisma } from '../prisma';
import { extractSqlUsers } from './importAllSqlData';

async function checkMusicDeptStudents() {
  console.log('🔍 Inspecting all students in সংগীত বিভাগ (Music Department)...\n');

  const sqlUsers = extractSqlUsers();
  const sqlMap = new Map<string, any>();
  sqlUsers.forEach(u => {
    const phone = (u.mobile_offline || u.mobile_online || u.father_mobile || '').replace(/[^0-9]/g, '').slice(-10);
    const name = (u.name || '').trim().toUpperCase();
    if (phone) sqlMap.set(`P:${phone}`, u);
    if (name) sqlMap.set(`N:${name}`, u);
  });

  // 1. Find Music Department
  const musicDept = await prisma.department.findFirst({
    where: {
      OR: [{ id: 'dept-music' }, { name: { contains: 'সংগীত' } }]
    }
  });

  // 2. Find Music Batches
  const musicBatches = await prisma.batch.findMany({
    where: {
      branchSubject: {
        OR: [
          { departmentBranch: { departmentId: musicDept?.id } },
          { subjectId: 'sub-vocal' }
        ]
      }
    },
    include: {
      memberships: {
        include: {
          student: {
            include: {
              person: true
            }
          }
        }
      }
    }
  });

  console.log(`Found ${musicBatches.length} batch(es) for সংগীত বিভাগ:`);
  
  const allMusicStudents: any[] = [];

  musicBatches.forEach(b => {
    console.log(`\n📌 Batch: "${b.name}" (${b.memberships.length} students)`);
    b.memberships.forEach(m => {
      const p = m.student.person;
      const phone = (p.phone || '').replace(/[^0-9]/g, '').slice(-10);
      const name = (p.fullNameEn || '').trim().toUpperCase();
      const sqlU = sqlMap.get(`P:${phone}`) || sqlMap.get(`N:${name}`);

      // Calculate age from DOB
      let age = 'N/A';
      if (p.dateOfBirth) {
        const birthYear = parseInt(p.dateOfBirth.split('-')[0], 10);
        if (!isNaN(birthYear)) {
          age = `${2026 - birthYear} years`;
        }
      }

      allMusicStudents.push({
        studentId: m.student.studentId,
        name: p.fullNameEn,
        nameBn: p.fullNameBn,
        dob: p.dateOfBirth,
        age,
        class: p.currentClass,
        institution: p.academicInstitution,
        sqlDept: sqlU?.student_department || 'N/A',
        sqlSubs: sqlU?.student_subjects || sqlU?.interested_subjects || 'N/A'
      });
    });
  });

  // Identify any kids (< 11 years or having 'KIDS' in SQL dump)
  const suspiciousKids = allMusicStudents.filter(s => {
    const ageNum = parseInt(s.age, 10);
    const hasKidsDept = (s.sqlDept || '').toLowerCase().includes('kid');
    return (!isNaN(ageNum) && ageNum < 12) || hasKidsDept;
  });

  console.log(`\n======================================================`);
  console.log(`Total Students in সংগীত বিভাগ: ${allMusicStudents.length}`);
  console.log(`⚠️ Potential Kids/Children inside সংগীত বিভাগ: ${suspiciousKids.length}`);
  console.log(`======================================================\n`);

  if (suspiciousKids.length > 0) {
    console.log('List of children currently in সংগীত বিভাগ:');
    suspiciousKids.forEach((k, idx) => {
      console.log(`${idx + 1}. [Student ID: ${k.studentId}] ${k.name} (${k.nameBn || ''})`);
      console.log(`   - Age: ${k.age} (DOB: ${k.dob}) | Class: ${k.class || 'N/A'} | Inst: ${k.institution || 'N/A'}`);
      console.log(`   - Original SQL Dept: "${k.sqlDept}" | Subjects: "${k.sqlSubs}"`);
    });
  }

  const purelyAdults = allMusicStudents.filter(s => !suspiciousKids.includes(s));
  console.log(`\n✅ Senior/General Music Students in সংগীত বিভাগ: ${purelyAdults.length}`);
  purelyAdults.slice(0, 10).forEach((a, idx) => {
    console.log(`${idx + 1}. [${a.studentId}] ${a.name} | Age: ${a.age} | Class: ${a.class || 'N/A'} | SQL Dept: "${a.sqlDept}"`);
  });
}

checkMusicDeptStudents()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
