import { extractSqlUsers } from './importAllSqlData';

const sqlUsers = extractSqlUsers();
const pureRegular = sqlUsers.filter(u => u.student_id && u.student_id !== 'null' && u.user_role === 'regular_student');

console.log(`Total 353 regular students:`);
const byStatus: Record<string, number> = {};
pureRegular.forEach(u => {
  const s = u.account_status || 'empty';
  byStatus[s] = (byStatus[s] || 0) + 1;
});
console.log('Account Statuses:', byStatus);

const nonActive = pureRegular.filter(u => u.account_status !== 'active');
console.log('Non-active regular students:', nonActive.map(u => ({ id: u.id, name: u.name, sid: u.student_id, status: u.account_status })));
