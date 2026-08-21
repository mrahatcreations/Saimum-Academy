import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

// Find all table names and their INSERT counts
const tableMatches = content.matchAll(/INSERT INTO `([^`]+)`/g);
const tableCounts: Record<string, number> = {};

for (const match of tableMatches) {
  const table = match[1];
  tableCounts[table] = (tableCounts[table] || 0) + 1;
}

console.log('=== TABLES IN saimumor_academy.sql ===');
Object.entries(tableCounts).sort((a, b) => b[1] - a[1]).forEach(([table, count]) => {
  console.log(`${table}: ${count} INSERT statements`);
});

// Search for SRI occurrences in the SQL dump
const sriMatches = content.match(/SRI-[0-9]+/g);
const uniqueSqlSris = new Set(sriMatches || []);
console.log('\n=== SRI NUMBERS IN SQL DUMP ===');
console.log('Total SRI occurrences in SQL:', sriMatches?.length || 0);
console.log('Unique SRI numbers in SQL:', uniqueSqlSris.size);

// Count users
const userInserts = content.match(/INSERT INTO `users`/g);
console.log('User inserts in SQL:', userInserts?.length || 0);
