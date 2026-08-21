import { extractSqlUsers } from './importAllSqlData';
import { prisma } from '../prisma';

const sqlUsers = extractSqlUsers();

console.log('🔍 Inspecting exact 56 students of Songit in saimumor_academy.sql...\n');

const songitUsers = sqlUsers.filter(u => (u.student_department || '').trim() === 'Songit');
const juvenileUsers = sqlUsers.filter(u => (u.student_department || '').trim() === 'Juvenile');

console.log(`📌 Exactly "Songit" users in SQL: ${songitUsers.length} জন`);
console.log(`📌 Exactly "Juvenile" users in SQL: ${juvenileUsers.length} জন`);

console.log('\n--- The 56 "Songit" Students ---');
songitUsers.forEach((u, idx) => {
  console.log(`${idx + 1}. [${u.student_id}] ${u.name} | Phone: ${u.mobile_offline || u.mobile_online || 'N/A'} | Class: ${u.class_year || 'N/A'}`);
});

console.log('\n--- The 3 "Juvenile" Students ---');
juvenileUsers.forEach((u, idx) => {
  console.log(`${idx + 1}. [${u.student_id}] ${u.name} | Phone: ${u.mobile_offline || u.mobile_online || 'N/A'} | Class: ${u.class_year || 'N/A'}`);
});
