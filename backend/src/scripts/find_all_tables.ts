import fs from 'fs';
import path from 'path';

const sqlPath = path.resolve('..', 'Old Database', 'saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

console.log('=== SEARCHING ALL TABLES IN saimumor_academy.sql ===\n');

const tableMatches = content.match(/CREATE TABLE `([^`]+)`/g);
if (tableMatches) {
  const tables = tableMatches.map(m => m.replace("CREATE TABLE `", '').replace('`', ''));
  console.log('Tables found in SQL dump:');
  tables.forEach(t => console.log(' - ' + t));
}
