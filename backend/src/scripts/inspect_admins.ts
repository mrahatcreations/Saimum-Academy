import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf-8');

console.log('🔍 Searching Roles & Admin Users in saimumor_academy.sql...\n');

// 1. Check `roles`
const rolesMatch = content.match(/INSERT INTO `roles`[^\n]+/g);
if (rolesMatch) {
  console.log('=== ROLES TABLE ===');
  rolesMatch.forEach(r => console.log(r));
}

// 2. Check `role_user`
const roleUserMatch = content.match(/INSERT INTO `role_user`[^\n]+/g);
if (roleUserMatch) {
  console.log('\n=== ROLE_USER TABLE ===');
  roleUserMatch.forEach(ru => console.log(ru));
}

// 3. Find users by id 1, 2, 3, etc. or where user_role is admin
const lines = content.split('\n');
const userLines = lines.filter(l => l.includes('INSERT INTO `users`'));

console.log('\n=== FIRST FEW USERS IN USERS TABLE ===');
userLines.forEach(l => {
  const match = l.match(/\((\d+),\s*'([^']*)',\s*'([^']*)'/g);
  if (match) {
    match.slice(0, 10).forEach(m => console.log(m));
  }
});

// Let's inspect user id = 1, 2, 3, 4, 5 in detail
lines.forEach(l => {
  if (l.includes('INSERT INTO `users`')) {
    const tuples = l.split(/\),\s*\(/);
    tuples.forEach(t => {
      const clean = t.replace(/^\s*INSERT INTO `users`[^(]*\(/, '').replace(/\);?\s*$/, '');
      const parts = clean.split(',').map(s => s.trim().replace(/^'|'$/g, ''));
      const id = parts[0];
      const name = parts[1];
      const email = parts[2];
      const role = parts[31] || parts[32]; // user_role
      const phone = parts[67] || parts[68];
      
      if (['1', '2', '3', '4', '5'].includes(id) || (role && role.toLowerCase().includes('admin')) || (email && email.toLowerCase().includes('admin'))) {
        console.log(`User [ID: ${id}] Name: "${name}" | Email: "${email}" | Role: "${role}" | Phone: "${phone}"`);
      }
    });
  }
});
