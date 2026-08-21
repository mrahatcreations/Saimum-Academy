import { extractSqlUsers } from './importAllSqlData';
import fs from 'fs';
import path from 'path';

const sqlPath = path.resolve('..', 'Old Database', 'saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

console.log('=== INSPECTING ALL STAFF & ROLES IN saimumor_academy.sql ===\n');

// 1. Check roles table
const rolesMatch = content.match(/INSERT INTO `roles`[^;]*;/gi) || [];
console.log('Roles table:');
rolesMatch.forEach(r => console.log(r));

// 2. Check role_user table
const roleUserMatch = content.match(/INSERT INTO `role_user`[^;]*;/gi) || [];
console.log('\nRole_User table blocks:', roleUserMatch.length);
if (roleUserMatch.length > 0) {
  console.log('Sample role_user:', roleUserMatch[0].substring(0, 500));
}

// 3. Check users with user_role != 'applicant' and != 'regular_student'
const sqlUsers = extractSqlUsers();
const staffRoles = new Set(['super_admin', 'admin', 'agent', 'staff', 'account_officer', 'coordinator', 'director', 'moderator', 'teacher']);

const staffUsers = sqlUsers.filter(u => {
  const role = (u.user_role || '').toLowerCase();
  return staffRoles.has(role) || (role !== 'applicant' && role !== 'regular_student' && role !== 'workshop_participant');
});

console.log(`\nFound ${staffUsers.length} users with staff/admin/agent roles in users table:`);
staffUsers.forEach(u => {
  console.log(` - ID: ${u.id} | Name: "${u.name || u.name_bn}" | Email: "${u.email}" | Phone: "${u.phone}" | Role: "${u.user_role}" | StudentID: "${u.student_id || 'N/A'}" | Dept: "${u.student_department || 'N/A'}"`);
});
