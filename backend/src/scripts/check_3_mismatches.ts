import { extractSqlUsers } from './importAllSqlData';
import { prisma } from '../prisma';

async function check3Mismatches() {
  const sqlUsers = extractSqlUsers();
  const sqlRegulars = sqlUsers.filter(u => u.student_id && u.student_id.trim().length > 0 && u.student_id !== 'null');

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

  const dbByStudentId = new Map<string, typeof dbStudents[0]>();
  dbStudents.forEach(s => {
    if (s.studentId) dbByStudentId.set(s.studentId.trim(), s);
  });

  sqlRegulars.forEach(u => {
    const sId = u.student_id.trim();
    const dbStudent = dbByStudentId.get(sId);
    if (!dbStudent) return;

    const currentDept = dbStudent.batchMemberships[0]?.batch?.branchSubject?.departmentBranch?.department?.name || 'No Dept';
    const sqlDept = u.student_department || 'EMPTY';
    const sqlDeptLower = sqlDept.toLowerCase();

    let expectedDeptName = 'সংগীত বিভাগ';
    if (sqlDeptLower.includes('kid')) expectedDeptName = 'শিশু বিভাগ';
    else if (sqlDeptLower.includes('theatre') || sqlDeptLower.includes('acting')) expectedDeptName = 'থিয়েটার বিভাগ';
    else if (sqlDeptLower.includes('recit') || sqlDeptLower.includes('presentation')) expectedDeptName = 'আবৃত্তি ও উপস্থাপনা বিভাগ';
    else if (sqlDeptLower.includes('qira')) expectedDeptName = 'কিরাত বিভাগ';

    if (currentDept !== expectedDeptName && !sqlDeptLower.includes('kid') && !sqlDeptLower.includes('songit')) {
      console.log(`Mismatch: [${sId}] ${u.name} | SQL Dept: "${sqlDept}" | Expected: "${expectedDeptName}" | Current DB: "${currentDept}"`);
    }
  });
}

check3Mismatches()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
