import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

const matches = content.matchAll(/'([^']*(?:Songit|Abritti|Theatre|Qiraat|KIDS)[^']*)'/gi);
const subjectStrings = new Set<string>();

for (const m of matches) {
  if (m[1].length < 100 && (m[1].includes(',') || m[1].includes(' '))) {
    subjectStrings.add(m[1]);
  }
}

console.log('Sample multi-subject strings found in SQL:');
Array.from(subjectStrings).slice(0, 20).forEach(s => console.log(`- "${s}"`));
