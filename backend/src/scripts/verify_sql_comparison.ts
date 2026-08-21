import { extractSqlUsers } from './importAllSqlData';
import { prisma } from '../prisma';

async function verifyWithOriginalSql() {
  console.log('🔍 Running 100% Exact Comparison between SQL Dump and Current DB...\n');

  const sqlUsers = extractSqlUsers();
  console.log(`Total users in saimumor_academy.sql: ${sqlUsers.length}`);

  // 1. Analyze regular students in SQL (those with student_id)
  const sqlRegulars = sqlUsers.filter(u => u.student_id && u.student_id.trim().length > 0 && u.student_id !== 'null');
  console.log(`Total Regular Students (with student_id) in SQL Dump: ${sqlRegulars.length}`);

  // Break down SQL regular students by their original `student_department`
  const sqlDeptCounts: Record<string, number> = {};
  sqlRegulars.forEach(u => {
    const dept = u.student_department || 'NO_DEPT';
    sqlDeptCounts[dept] = (sqlDeptCounts[dept] || 0) + 1;
  });

  console.log('\n📊 SQL Dump Regular Students by Original Department:');
  Object.entries(sqlDeptCounts).sort((a, b) => b[1] - a[1]).forEach(([dept, count]) => {
    console.log(`   - "${dept}": ${count} students`);
  });

  // 2. Fetch all regular students from current Database
  const dbStudents = await prisma.student.findMany({
    include: {
      person: {
        include: {
          registrations: true
        }
      },
      batchMemberships: {
        include: {
          batch: {
            include: {
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
          }
        }
      }
    }
  });

  console.log(`\n📊 Current DB Total Regular Students: ${dbStudents.length}`);

  // Map db students by studentId and Phone
  const dbByStudentId = new Map<string, typeof dbStudents[0]>();
  const dbByPhone = new Map<string, typeof dbStudents[0]>();

  dbStudents.forEach(s => {
    if (s.studentId) dbByStudentId.set(s.studentId.trim(), s);
    const phone = (s.person.phone || '').replace(/[^0-9]/g, '').slice(-10);
    if (phone && phone.length >= 10) dbByPhone.set(phone, s);
  });

  // 3. Match SQL Regulars against DB Students
  let matchedCount = 0;
  let missingInDb: any[] = [];
  let departmentMismatches: any[] = [];

  sqlRegulars.forEach((u, idx) => {
    const sId = u.student_id.trim();
    const phone = (u.mobile_offline || u.mobile_online || u.father_mobile || '').replace(/[^0-9]/g, '').slice(-10);
    
    const dbStudent = dbByStudentId.get(sId) || dbByPhone.get(phone);

    if (!dbStudent) {
      missingInDb.push({ index: idx + 1, name: u.name, studentId: sId, phone, dept: u.student_department });
    } else {
      matchedCount++;
      const currentDept = dbStudent.batchMemberships[0]?.batch?.branchSubject?.departmentBranch?.department?.name || 'No Dept';
      const sqlDept = u.student_department || 'EMPTY';

      // Check if mapped logically
      const sqlDeptLower = sqlDept.toLowerCase();
      let expectedDeptName = 'সংগীত বিভাগ';
      if (sqlDeptLower.includes('kid')) expectedDeptName = 'শিশু বিভাগ';
      else if (sqlDeptLower.includes('theatre') || sqlDeptLower.includes('acting')) expectedDeptName = 'থিয়েটার বিভাগ';
      else if (sqlDeptLower.includes('recit') || sqlDeptLower.includes('presentation')) expectedDeptName = 'আবৃত্তি ও উপস্থাপনা বিভাগ';
      else if (sqlDeptLower.includes('qira')) expectedDeptName = 'কিরাত বিভাগ';

      if (currentDept !== expectedDeptName && !sqlDeptLower.includes('kid') && !sqlDeptLower.includes('songit')) {
        departmentMismatches.push({
          name: u.name,
          studentId: sId,
          sqlDept,
          currentDept,
          expectedDeptName
        });
      }
    }
  });

  console.log(`\n======================================================`);
  console.log(`✅ MATCHED STUDENTS: ${matchedCount} / ${sqlRegulars.length} (${Math.round((matchedCount / sqlRegulars.length) * 100)}%)`);
  console.log(`⚠️ Missing in DB: ${missingInDb.length}`);
  console.log(`⚠️ Department Mismatches: ${departmentMismatches.length}`);
  console.log(`======================================================`);

  if (missingInDb.length > 0) {
    console.log('\nMissing Regular Students in DB:');
    missingInDb.forEach((m, idx) => {
      console.log(`   ${idx + 1}. [${m.studentId}] ${m.name} (Phone: ${m.phone}) - SQL Dept: "${m.dept}"`);
    });
  }

  // 4. Batch wise current distribution
  const batchSummary = await prisma.batch.findMany({
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

  console.log('\n🏛️ Current Active Regular Batches in DB:');
  batchSummary.forEach((b, idx) => {
    console.log(`   ${idx + 1}. Batch: "${b.name}"`);
    console.log(`      - Department: ${b.branchSubject.departmentBranch?.department?.name}`);
    console.log(`      - Subject: ${b.branchSubject.subject.name}`);
    console.log(`      - Students: ${b.memberships.length}`);
  });
}

verifyWithOriginalSql()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
