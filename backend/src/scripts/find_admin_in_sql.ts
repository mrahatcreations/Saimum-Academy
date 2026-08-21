import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf-8');

console.log('🔍 Searching for Admin users in saimumor_academy.sql...\n');

// Find all CREATE TABLE or INSERT INTO statements for users/admins/roles
const lines = content.split('\n');

const userInserts: string[] = [];
lines.forEach(line => {
  if (line.includes('INSERT INTO `users`') || line.includes('INSERT INTO `admins`') || line.includes('INSERT INTO `staff`')) {
    userInserts.push(line);
  }
});

console.log(`Found ${userInserts.length} user/admin insert lines.\n`);

// Let's parse users table columns and values
const createUsersMatch = content.match(/CREATE TABLE `users` \(([\s\S]*?)\) ENGINE/);
if (createUsersMatch) {
  console.log('Columns in `users` table:');
  const cols = createUsersMatch[1].split('\n').map(l => l.trim().split(' ')[0].replace(/`/g, '')).filter(Boolean);
  console.log(cols.join(', '));
  console.log('\n');
}

// Find users who have admin role or role_id = 1 or is_admin
const usersRegex = /\((\d+),\s*'([^']*)',\s*'([^']*)'/g;

// Let's search specifically for admin/staff records
const adminKeywords = ['admin', 'superadmin', 'director', 'manager', 'editor', 'moderator'];
lines.forEach(line => {
  if (line.includes('INSERT INTO `users`')) {
    // split row tuples
    const tuples = line.match(/\(.*?\)/g);
    if (tuples) {
      tuples.forEach(tuple => {
        const lower = tuple.toLowerCase();
        if (adminKeywords.some(kw => lower.includes(`'${kw}'`) || lower.includes(`"${kw}"`) || lower.includes(`admin`))) {
          console.log('Admin Candidate Tuple:', tuple.slice(0, 150) + '...');
        }
      });
    }
  }
});

// Also search for any table named `roles` or `model_has_roles` or `role_user`
lines.forEach(line => {
  if (line.includes('INSERT INTO `roles`') || line.includes('INSERT INTO `model_has_roles`') || line.includes('INSERT INTO `role_user`')) {
    console.log('Role mapping:', line.slice(0, 200));
  }
});
