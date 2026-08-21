import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf-8');

const lines = content.split('\n');

for (const line of lines) {
  if (line.includes('saiful@saimum.org')) {
    console.log('Found line containing saiful@saimum.org:');
    // Extract password hash field (usually 5th column in users table)
    console.log(line.slice(0, 400));
  }
}
