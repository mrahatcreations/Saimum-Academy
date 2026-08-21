import { extractSqlUsers } from './importAllSqlData';

const sqlUsers = extractSqlUsers();

console.log('🔍 Investigating the number 351 vs 376/377 in saimumor_academy.sql...\n');

// 1. All users with student_id
const withStudentId = sqlUsers.filter(u => u.student_id && u.student_id.trim().length > 0 && u.student_id !== 'null');
console.log(`1. Total users with student_id in SQL: ${withStudentId.length}`);

// 2. Breakdown by user_role
const roleCounts: Record<string, number> = {};
withStudentId.forEach(u => {
  const r = u.user_role || 'NO_ROLE';
  roleCounts[r] = (roleCounts[r] || 0) + 1;
});
console.log('\n2. Breakdown of student_id users by `user_role`:');
Object.entries(roleCounts).forEach(([r, c]) => console.log(`   - "${r}": ${c}`));

// 3. Breakdown by selection_status
const selectCounts: Record<string, number> = {};
withStudentId.forEach(u => {
  const s = u.selection_status || 'NO_STATUS';
  selectCounts[s] = (selectCounts[s] || 0) + 1;
});
console.log('\n3. Breakdown of student_id users by `selection_status`:');
Object.entries(selectCounts).forEach(([s, c]) => console.log(`   - "${s}": ${c}`));

// 4. Breakdown by id_card_status
const cardCounts: Record<string, number> = {};
withStudentId.forEach(u => {
  const s = u.id_card_status || 'NO_CARD';
  cardCounts[s] = (cardCounts[s] || 0) + 1;
});
console.log('\n4. Breakdown of student_id users by `id_card_status`:');
Object.entries(cardCounts).forEach(([s, c]) => console.log(`   - "${s}": ${c}`));

// 5. Check if there are 351 users in some specific condition
// Check combinations that equal 351:
const withDept = withStudentId.filter(u => u.student_department && u.student_department.trim().length > 0);
console.log(`\n5. Users with student_id AND student_department != null: ${withDept.length}`);

const withWorkshopReg = withStudentId.filter(u => u.workshop_registration_no && u.workshop_registration_no.trim().length > 0);
console.log(`6. Users with student_id AND workshop_registration_no != null: ${withWorkshopReg.length}`);

const withStudentSubjects = withStudentId.filter(u => u.student_subjects && u.student_subjects.trim().length > 0);
console.log(`7. Users with student_id AND student_subjects != null: ${withStudentSubjects.length}`);

// Let's check users where student_department is not 'Juvenile' or specific years
const year2025_2026 = withStudentId.filter(u => u.student_id.startsWith('2025') || u.student_id.startsWith('2026'));
console.log(`8. Users with student_id starting with 2025 or 2026: ${year2025_2026.length}`);

// Find which 25-26 users make the difference between 351 and 377
console.log(`\nDifference: 377 - 351 = ${377 - 351} users.`);
