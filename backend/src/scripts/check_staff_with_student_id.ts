import { extractSqlUsers } from './importAllSqlData';

const sqlUsers = extractSqlUsers();
const withStudentId = sqlUsers.filter(u => u.student_id && u.student_id.trim().length > 0 && u.student_id !== 'null');

console.log('=== USERS WITH STUDENT_ID WHO ARE STAFF/AGENT/OFFICER (24-26 USERS) ===\n');

const staffWithStudentId = withStudentId.filter(u => u.user_role !== 'regular_student');

console.log(`Total Staff/Agents with Student ID: ${staffWithStudentId.length} জন\n`);

staffWithStudentId.forEach((u, idx) => {
  console.log(`${idx + 1}. [${u.student_id}] ${u.name} | Role: "${u.user_role}" | Dept: "${u.student_department}" | Phone: ${u.mobile_offline || u.mobile_online}`);
});

console.log('\n=== REGULAR STUDENTS ONLY (user_role = "regular_student") ===');
const pureRegulars = withStudentId.filter(u => u.user_role === 'regular_student');
console.log(`Total pure regular students: ${pureRegulars.length} জন`);
