import { prisma } from '../prisma';

async function checkDeptStudentCounts() {
  const students = await prisma.student.findMany({
    include: {
      batchMemberships: {
        include: {
          batch: {
            include: {
              branchSubject: {
                include: {
                  departmentBranch: {
                    include: { department: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const deptCounts: Record<string, number> = {};
  students.forEach(s => {
    s.batchMemberships.forEach(bm => {
      const deptName = bm.batch.branchSubject.departmentBranch.department.name;
      deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
    });
  });

  console.log('=== PURE REGULAR STUDENT ROSTER BREAKDOWN ===');
  console.log(`Total Pure Students: ${students.length}`);
  console.log('Department Counts:', deptCounts);
}

checkDeptStudentCounts().finally(() => prisma.$disconnect());
