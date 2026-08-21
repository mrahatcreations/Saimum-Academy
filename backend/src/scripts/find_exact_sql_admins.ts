import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf-8');

const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('INSERT INTO `roles`') || line.includes('INSERT INTO `role_user`') || line.includes('INSERT INTO `admins`')) {
    console.log(`Line ${i}:`, line.slice(0, 300));
    if (lines[i + 1]) console.log(`Line ${i+1}:`, lines[i + 1].slice(0, 300));
  }
}

// Find user lines
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes("INSERT INTO `users`")) {
    console.log(`\nUsers Insert found at line ${i}:`);
    console.log(line.slice(0, 500));
    break;
  }
}
