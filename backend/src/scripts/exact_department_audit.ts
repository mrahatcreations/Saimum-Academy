import { extractSqlUsers } from './importAllSqlData';
import { prisma } from '../prisma';

async function exactDepartmentAudit() {
  console.log('🔍 EXACT AUDIT: Original SQL `student_department` vs Current DB Department\n');

  const sqlUsers = extractSqlUsers();
  const sqlRegulars = sqlUsers.filter(u => u.student_id && u.student_id.trim().length > 0 && u.student_id !== 'null');

  const dbStudents = await prisma.student.findMany({
    include: {
      person: true,
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

  const dbMap = new Map<string, typeof dbStudents[0]>();
  dbStudents.forEach(s => {
    if (s.studentId) dbMap.set(s.studentId.trim(), s);
  });

  // Group SQL regulars by their raw SQL `student_department`
  const sqlByRawDept: Record<string, { total: number; matchedToDbDept: Record<string, number>; samples: any[] }> = {};

  sqlRegulars.forEach(u => {
    const rawDept = u.student_department || 'EMPTY';
    if (!sqlByRawDept[rawDept]) {
      sqlByRawDept[rawDept] = { total: 0, matchedToDbDept: {}, samples: [] };
    }
    sqlByRawDept[rawDept].total++;

    const dbStudent = dbMap.get(u.student_id.trim());
    const currentDbDept = dbStudent?.batchMemberships[0]?.batch?.branchSubject?.departmentBranch?.department?.name || 'NOT_FOUND';
    sqlByRawDept[rawDept].matchedToDbDept[currentDbDept] = (sqlByRawDept[rawDept].matchedToDbDept[currentDbDept] || 0) + 1;

    if (sqlByRawDept[rawDept].samples.length < 3) {
      sqlByRawDept[rawDept].samples.push({
        id: u.student_id,
        name: u.name,
        dbDept: currentDbDept
      });
    }
  });

  console.log('================================================================================');
  console.log('📊 MAPPING MATRIX: Original SQL student_department ➔ Current DB Department');
  console.log('================================================================================\n');

  Object.entries(sqlByRawDept).sort((a, b) => b[1].total - a[1].total).forEach(([rawDept, data]) => {
    console.log(`📌 Original SQL: "${rawDept}" (Total: ${data.total} students)`);
    Object.entries(data.matchedToDbDept).forEach(([dbDept, count]) => {
      console.log(`   ➔ Assigned to Current DB: "${dbDept}": ${count} students`);
    });
    console.log(`   Sample students: ${data.samples.map(s => `[${s.id}] ${s.name}`).join(', ')}`);
    console.log('--------------------------------------------------------------------------------');
  });
}

exactDepartmentAudit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
