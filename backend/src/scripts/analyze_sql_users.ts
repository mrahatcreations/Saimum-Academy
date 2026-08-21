import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

// Parse CREATE TABLE users to get column indexes
const usersTableMatch = content.match(/CREATE TABLE `users`\s*\((.*?)\)\s*ENGINE/s);
const colLines = usersTableMatch![1].split('\n').filter(l => l.trim().startsWith('`'));
const colNames = colLines.map(l => l.trim().match(/`([^`]+)`/)![1]);

console.log('Total Columns in users table:', colNames.length);

// Extract rows from INSERT INTO `users`
// Helper to parse MySQL values tuple
function parseSQLValues(tupleStr: string): string[] {
  const values: string[] = [];
  let current = '';
  let inString = false;
  let escape = false;

  for (let i = 0; i < tupleStr.length; i++) {
    const char = tupleStr[i];
    if (escape) {
      current += char;
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === "'") {
      inString = !inString;
      continue;
    }
    if (char === ',' && !inString) {
      values.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  values.push(current.trim());
  return values;
}

// Let's sample rows from INSERT INTO `users`
const usersInsertBlocks = content.split('INSERT INTO `users`');
const parsedUsers: Record<string, any>[] = [];

for (let b = 1; b < usersInsertBlocks.length; b++) {
  const statement = usersInsertBlocks[b].split(';')[0];
  const tuples = statement.match(/\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g) || [];

  for (const t of tuples) {
    const inner = t.slice(1, -1);
    const vals = parseSQLValues(inner);
    if (vals.length === colNames.length) {
      const obj: Record<string, string> = {};
      colNames.forEach((col, idx) => {
        let v = vals[idx];
        if (v === 'NULL') v = '';
        obj[col] = v;
      });
      parsedUsers.push(obj);
    }
  }
}

console.log('Successfully parsed user objects:', parsedUsers.length);

// Analysis of Student IDs, selection_status, workshop_completion_date
let hasStudentIdCount = 0;
let hasWorkshopRegCount = 0;
let hasWorkshopCompDateCount = 0;
const selectionStatuses: Record<string, number> = {};
const sampleStudentIds: string[] = [];

parsedUsers.forEach(u => {
  if (u.student_id && u.student_id !== 'NULL' && u.student_id.trim() !== '') {
    hasStudentIdCount++;
    if (sampleStudentIds.length < 15) sampleStudentIds.push(`[${u.workshop_registration_no || 'NO-SRI'}] StudentID: "${u.student_id}" | Name: ${u.name}`);
  }
  if (u.workshop_registration_no && u.workshop_registration_no.startsWith('SRI-')) {
    hasWorkshopRegCount++;
  }
  if (u.workshop_completion_date && u.workshop_completion_date !== 'NULL') {
    hasWorkshopCompDateCount++;
  }
  const sel = u.selection_status || 'empty';
  selectionStatuses[sel] = (selectionStatuses[sel] || 0) + 1;
});

console.log('\n=== USERS TABLE STATS ===');
console.log('Total Parsed Users:', parsedUsers.length);
console.log('Users with SRI Workshop Reg No:', hasWorkshopRegCount);
console.log('Users with Student ID (Regular Students):', hasStudentIdCount);
console.log('Users with Workshop Completion Date:', hasWorkshopCompDateCount);
console.log('Selection Status Breakdown:', selectionStatuses);
console.log('\nSample Regular Student IDs:', sampleStudentIds);
