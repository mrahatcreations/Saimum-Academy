import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf-8');
const lines = content.split('\n');

console.log('=== 1. ROLES TABLE ===');
for (let i = 12630; i < 12650; i++) {
  if (lines[i] && lines[i].trim()) console.log(lines[i]);
  if (lines[i] && lines[i].includes(';')) break;
}

console.log('\n=== 2. ROLE_USER TABLE ===');
const roleUsers: { userId: number; roleId: number }[] = [];
for (let i = 12660; i < 12700; i++) {
  if (lines[i] && lines[i].trim()) {
    console.log(lines[i]);
    const m = lines[i].match(/\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      roleUsers.push({ userId: parseInt(m[2], 10), roleId: parseInt(m[3], 10) });
    }
  }
  if (lines[i] && lines[i].includes(';')) break;
}

console.log('\n=== 3. FINDING ADMIN USERS IN USERS TABLE ===');
for (let i = 20790; i < lines.length; i++) {
  const line = lines[i];
  if (!line || !line.includes('(')) continue;
  
  roleUsers.forEach(ru => {
    // check if this line contains `(${ru.userId},`
    const regex = new RegExp(`\\(${ru.userId},\\s*'([^']*)',\\s*'([^']*)'`);
    const match = line.match(regex);
    if (match) {
      console.log(`Found Admin/Role User [ID: ${ru.userId}, Role ID: ${ru.roleId}]: Name: "${match[1]}" | Email: "${match[2]}"`);
    }
  });

  // Also check User ID 1, 2, 3, 4, 5, 799
  [1, 2, 3, 4, 5, 799].forEach(id => {
    const regex = new RegExp(`\\(${id},\\s*'([^']*)',\\s*'([^']*)'`);
    const match = line.match(regex);
    if (match) {
      console.log(`Key User [ID: ${id}]: Name: "${match[1]}" | Email: "${match[2]}"`);
    }
  });
}
