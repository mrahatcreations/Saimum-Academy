import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf-8');

console.log('🔍 Searching for `rtrahat81` and `Rahat` in saimumor_academy.sql...\n');

const lines = content.split('\n');

lines.forEach((line, idx) => {
  const lower = line.toLowerCase();
  if (lower.includes('rtrahat') || lower.includes('rahat81')) {
    console.log(`Line ${idx}: Found rtrahat match!`);
    console.log(line);
  }
});
