import { prisma } from '../prisma';

async function printDepartmentWiseStudents() {
  const departments = await prisma.department.findMany({
    include: {
      branches: {
        include: {
          subjects: {
            include: {
              batches: {
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
              }
            }
          }
        }
      }
    }
  });

  departments.forEach(dept => {
    console.log(`\n======================================================`);
    console.log(`🏛️ ${dept.name.toUpperCase()}`);
    console.log(`======================================================`);

    const students: any[] = [];
    dept.branches.forEach(b => {
      b.subjects.forEach(s => {
        s.batches.forEach(batch => {
          batch.memberships.forEach(m => {
            students.push({
              studentId: m.student.studentId,
              nameEn: m.student.person.fullNameEn,
              nameBn: m.student.person.fullNameBn,
              phone: m.student.person.phone,
              dob: m.student.person.dateOfBirth,
              class: m.student.person.currentClass,
              batchName: batch.name
            });
          });
        });
      });
    });

    console.log(`মোট শিক্ষার্থী: ${students.length} জন`);
    students.forEach((st, idx) => {
      console.log(`  ${idx + 1}. [${st.studentId}] ${st.nameEn} (${st.nameBn || ''}) | মোবাইল: ${st.phone} | শ্রেণী: ${st.class || 'N/A'}`);
    });
  });
}

printDepartmentWiseStudents()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
