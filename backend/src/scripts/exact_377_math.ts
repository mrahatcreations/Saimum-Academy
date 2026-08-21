import { extractSqlUsers } from './importAllSqlData';

const sqlUsers = extractSqlUsers();
const withStudentId = sqlUsers.filter(u => u.student_id && u.student_id.trim().length > 0 && u.student_id !== 'null');

console.log('=== EXACT BREAKDOWN OF 377 ROWS WITH STUDENT_ID ===\n');

const regularStudents = withStudentId.filter(u => u.user_role === 'regular_student');
const nonRegulars = withStudentId.filter(u => u.user_role !== 'regular_student');

console.log(`1. Total rows with student_id in SQL: ${withStudentId.length} টি সারি`);
console.log(`2. user_role = "regular_student" (শিক্ষার্থী সারি): ${regularStudents.length} টি`);
console.log(`3. user_role != "regular_student" (স্টাফ/এজেন্ট সারি): ${nonRegulars.length} টি`);
console.log(`   (যোগফল: ${regularStudents.length} + ${nonRegulars.length} = ${regularStudents.length + nonRegulars.length})`);

// Check duplicates among regularStudents
const regStudentMap = new Map<string, any[]>();
regularStudents.forEach(u => {
  const sId = u.student_id.trim();
  if (!regStudentMap.has(sId)) regStudentMap.set(sId, []);
  regStudentMap.get(sId)?.push(u);
});

console.log('\n--- Duplicate student_id records among regular students ---');
regStudentMap.forEach((users, sId) => {
  if (users.length > 1) {
    console.log(`Student ID: ${sId} has ${users.length} duplicate entries:`);
    users.forEach(u => console.log(`  - ID: ${u.id} | Name: "${u.name}" | SRI: "${u.workshop_registration_no}" | Role: "${u.user_role}"`));
  }
});

console.log(`\n👉 ইউনিক রেগুলার স্টুডেন্ট (Unique Persons): ${regStudentMap.size} জন`);
console.log(`👉 স্টাফ/পরিচালক যাদের স্টুডেন্ট আইডি রয়েছে: ${nonRegulars.length} জন`);
console.log(`👉 সর্বমোট ইউনিক ব্যক্তি (Total Unique Persons): ${regStudentMap.size + nonRegulars.length} জন (${regStudentMap.size} + ${nonRegulars.length} = ${regStudentMap.size + nonRegulars.length})`);
