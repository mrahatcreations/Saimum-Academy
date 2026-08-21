import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf-8');

const lines = content.split('\n');

console.log('🔍 Searching `departments` table in saimumor_academy.sql...\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('INSERT INTO `departments`') || line.includes('CREATE TABLE `departments`')) {
    console.log(`Line ${i}:`, line.slice(0, 300));
    for (let j = 1; j <= 15; j++) {
      if (lines[i + j] && lines[i + j].trim()) {
        console.log(`Line ${i + j}:`, lines[i + j]);
        if (lines[i + j].includes(';')) break;
      }
    }
  }
}
