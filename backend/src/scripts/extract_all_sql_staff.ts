import fs from 'fs';
import path from 'path';
import { extractSqlUsers } from './importAllSqlData';

const sqlPath = path.resolve('..', 'Old Database', 'saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

// Parse roles table
const roleMap = new Map<number, string>();
const roleInsert = content.match(/INSERT INTO `roles`[^\;]*;/gi) || [];
roleInsert.forEach(block => {
  const tupleRegex = /\((\d+),\s*'([^']+)'/g;
  let match;
  while ((match = tupleRegex.exec(block)) !== null) {
    roleMap.set(parseInt(match[1], 10), match[2]);
  }
});
console.log('Roles from DB:', Array.from(roleMap.entries()));

// Parse role_user table
const userRoleIds = new Map<number, Set<string>>();
const ruInsert = content.match(/INSERT INTO `role_user`[^\;]*;/gi) || [];
ruInsert.forEach(block => {
  const tupleRegex = /\((\d+),\s*(\d+),\s*(\d+)/g;
  let match;
  while ((match = tupleRegex.exec(block)) !== null) {
    const userId = parseInt(match[2], 10);
    const roleId = parseInt(match[3], 10);
    const roleName = roleMap.get(roleId) || `Role_${roleId}`;
    if (!userRoleIds.has(userId)) userRoleIds.set(userId, new Set());
    userRoleIds.get(userId)!.add(roleName);
  }
});

const sqlUsers = extractSqlUsers();
console.log(`Total users in SQL: ${sqlUsers.length}`);

// Find all unique staff members
const staffList: any[] = [];
const seenEmails = new Set<string>();

const staffRoleNames = new Set([
  'super_admin', 'admin', 'agent', 'staff', 'account_officer', 
  'moderator', 'teacher', 'examiner', 'director'
]);

sqlUsers.forEach(u => {
  const roles = userRoleIds.get(u.id) || new Set<string>();
  if (u.user_role) roles.add(u.user_role);

  const hasStaffRole = Array.from(roles).some(r => staffRoleNames.has(r.toLowerCase()));

  if (hasStaffRole) {
    const emailKey = (u.email || '').toLowerCase().trim();
    const phoneKey = (u.phone || '').trim();

    let designation = 'Academy Staff';
    const roleArr = Array.from(roles);
    if (roleArr.includes('super_admin') || u.id === 1) {
      designation = 'Super Administrator / IT Director';
    } else if (roleArr.includes('admin')) {
      designation = 'Central Academy Administrator';
    } else if (roleArr.includes('account_officer')) {
      designation = 'Accounts & Finance Officer';
    } else if (roleArr.includes('moderator')) {
      designation = 'Workshop & Batch Moderator';
    } else if (roleArr.includes('teacher')) {
      designation = 'Senior Faculty / Instructor';
    } else if (roleArr.includes('examiner')) {
      designation = 'Audition Examiner & Evaluator';
    } else if (roleArr.includes('agent')) {
      designation = 'Department Coordinator & Field Agent';
    }

    // Specific known designations in Saimum Academy
    const nameLower = (u.name || u.name_bn || '').toLowerCase();
    if (nameLower.includes('azad') || nameLower.includes('azad')) {
      designation = 'Department Director (শিশু বিভাগ)';
    } else if (nameLower.includes('raad') || nameLower.includes('ezama') || nameLower.includes('রাআদ')) {
      designation = 'Department Director (সঙ্গীত বিভাগ)';
    } else if (nameLower.includes('emon') || nameLower.includes('nazmul islam emon')) {
      designation = 'Department Director (থিয়েটার বিভাগ)';
    } else if (nameLower.includes('muminul') || nameLower.includes('qari')) {
      designation = 'Department Director (ক্বিরাত বিভাগ)';
    } else if (nameLower.includes('zihad') || nameLower.includes('sayeeduzzaman')) {
      designation = 'Department Director (আবৃত্তি ও উপস্থাপনা বিভাগ)';
    } else if (nameLower.includes('saiful mamun') || nameLower.includes('saiful mollik')) {
      designation = 'Central Operations Director';
    } else if (nameLower.includes('tawhid')) {
      designation = 'Senior Accounts Officer';
    } else if (nameLower.includes('jahed')) {
      designation = 'Central Academy Coordinator';
    }

    staffList.push({
      sqlUserId: u.id,
      fullName: u.name || u.name_bn || 'Staff Member',
      fullNameBn: u.name_bn || null,
      email: u.email,
      phone: u.phone,
      roles: roleArr,
      designation,
      studentId: u.student_id || null,
      department: u.student_department || null,
      photoUrl: u.profile_photo_path ? (u.profile_photo_path.startsWith('http') ? u.profile_photo_path : `/storage/${u.profile_photo_path}`) : null
    });
  }
});

console.log(`\nFound ${staffList.length} total staff entries in SQL.`);

// Deduplicate by Name/Email
const uniqueStaff: any[] = [];
const seen = new Set<string>();

staffList.forEach(s => {
  const key = s.fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!seen.has(key) && !key.includes('administrator')) {
    seen.add(key);
    uniqueStaff.push(s);
  }
});

console.log(`\nUnique Human Staff Count: ${uniqueStaff.length}`);
uniqueStaff.forEach((s, idx) => {
  console.log(`${idx + 1}. [User #${s.sqlUserId}] ${s.fullName} | Phone: ${s.phone || 'N/A'} | Email: ${s.email} | Roles: [${s.roles.join(', ')}] | Title: "${s.designation}" | StudentID: "${s.studentId || 'None'}" | Dept: "${s.department || 'N/A'}"`);
});
