import { extractSqlUsers } from './importAllSqlData';
import { prisma } from '../prisma';

async function listAll377() {
  const sqlUsers = extractSqlUsers();
  const withSid = sqlUsers.filter(u => u.student_id && u.student_id !== 'null');

  console.log(`Total users with student_id in SQL: ${withSid.length}`);

  const roleCounts: Record<string, number> = {};
  withSid.forEach(u => {
    const r = u.user_role || 'empty';
    roleCounts[r] = (roleCounts[r] || 0) + 1;
  });
  console.log('Roles among users with student_id:', roleCounts);

  const nonRegular = withSid.filter(u => u.user_role !== 'regular_student');
  console.log(`\nNon-regular users with student_id (${nonRegular.length}):`);
  nonRegular.forEach(u => {
    console.log(`- ID: ${u.id} | Name: ${u.name} | Role: ${u.user_role} | SID: ${u.student_id} | Email: ${u.email}`);
  });

  const pureRegular = withSid.filter(u => u.user_role === 'regular_student');
  console.log(`\nPure regular students in SQL: ${pureRegular.length}`);
}

listAll377().finally(() => prisma.$disconnect());
