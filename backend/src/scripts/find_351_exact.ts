import { extractSqlUsers } from './importAllSqlData';

const sqlUsers = extractSqlUsers();
const withStudentId = sqlUsers.filter(u => u.student_id && u.student_id.trim().length > 0 && u.student_id !== 'null');
const regularStudents = withStudentId.filter(u => u.user_role === 'regular_student');

console.log('🔍 Finding the exact 351 active students...\n');

console.log(`Total regular_student rows: ${regularStudents.length}`);

// Check for deleted_at, account_status, or dummy/test records
const deleted = regularStudents.filter(u => u.deleted_at && u.deleted_at !== 'null' && u.deleted_at !== 'NULL');
console.log(`Deleted rows (deleted_at != null): ${deleted.length}`);

const inactive = regularStudents.filter(u => (u.account_status || '').toLowerCase() === 'inactive');
console.log(`Inactive account_status: ${inactive.length}`);

const dummy = regularStudents.filter(u => (u.name || '').toLowerCase().includes('test') || (u.name || '').toLowerCase().includes('dummy'));
console.log(`Dummy / Test names: ${dummy.length}`);

// Check users where id_card_status or other flags
const notSelected = regularStudents.filter(u => u.selection_status === 'not_selected');
console.log(`selection_status not_selected: ${notSelected.length}`);

// Let's list any user with strange email or empty fields
regularStudents.forEach(u => {
  if (u.name === 'SADIA ISLAM' || (u.email && u.email.includes('example.com')) || (u.email && u.email === '\\')) {
    console.log(`Special row [ID: ${u.id}]: Name: "${u.name}" | Email: "${u.email}" | SRI: "${u.workshop_registration_no}" | Student ID: "${u.student_id}" | Status: "${u.account_status}"`);
  }
});
