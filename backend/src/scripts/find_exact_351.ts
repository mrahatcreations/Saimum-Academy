import { prisma } from '../prisma';
import { extractSqlUsers } from './importAllSqlData';

async function findExact351() {
  const sqlUsers = extractSqlUsers();
  const sqlStudentUsers = sqlUsers.filter(u => u.student_id && u.student_id !== 'null');

  const dbStudents = await prisma.student.findMany({
    include: { person: true }
  });

  console.log(`SQL Users with student_id: ${sqlStudentUsers.length}`);
  console.log(`DB Students count: ${dbStudents.length}`);

  // Find duplicates by studentId or phone or email
  const seenStudentIds = new Set<string>();
  const duplicates: any[] = [];

  dbStudents.forEach(s => {
    if (seenStudentIds.has(s.studentId)) {
      duplicates.push(s);
    } else {
      seenStudentIds.add(s.studentId);
    }
  });

  console.log('Duplicates in DB Students:', duplicates);

  // Check if any student has no person or is dummy
  const dummies = dbStudents.filter(s => 
    s.person.fullNameEn.toLowerCase().includes('test') || 
    s.person.fullNameEn.toLowerCase().includes('dummy') ||
    s.person.fullNameEn.toLowerCase().includes('administrator') ||
    !s.studentId.match(/^\d+$/)
  );

  console.log('Dummy / Non-numeric StudentIDs:', dummies.map(d => ({ id: d.id, studentId: d.studentId, name: d.person.fullNameEn })));
}

findExact351().finally(() => prisma.$disconnect());
