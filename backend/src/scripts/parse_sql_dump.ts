import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

// Extract column list
const usersTableMatch = content.match(/CREATE TABLE `users`\s*\((.*?)\)\s*ENGINE/s);
const colLines = usersTableMatch![1].split('\n').filter(l => l.trim().startsWith('`'));
const colNames = colLines.map(l => l.trim().match(/`([^`]+)`/)![1]);

console.log('Columns in users table:', colNames.length);

// Extract each INSERT INTO `users` block
const usersBlocks = content.split('INSERT INTO `users`');
console.log('Found INSERT INTO users blocks:', usersBlocks.length - 1);

const parsedUsers: any[] = [];

for (let b = 1; b < usersBlocks.length; b++) {
  const block = usersBlocks[b];
  const statement = block.split(/;\s*(?:\r?\n|$)/)[0];
  const valIndex = statement.indexOf('VALUES');
  if (valIndex === -1) continue;

  const rawData = statement.slice(valIndex + 6).trim();

  let i = 0;
  while (i < rawData.length) {
    while (i < rawData.length && rawData[i] !== '(') i++;
    if (i >= rawData.length) break;
    i++; // past '('

    const rowVals: string[] = [];
    let curVal = '';
    let inStr = false;
    let escape = false;

    while (i < rawData.length) {
      const c = rawData[i];

      if (escape) {
        curVal += c;
        escape = false;
        i++;
        continue;
      }

      if (c === '\\') {
        escape = true;
        i++;
        continue;
      }

      if (c === "'") {
        inStr = !inStr;
        i++;
        continue;
      }

      if (!inStr) {
        if (c === ',') {
          rowVals.push(curVal.trim());
          curVal = '';
          i++;
          continue;
        }
        if (c === ')') {
          rowVals.push(curVal.trim());
          curVal = '';
          i++;
          break;
        }
      }

      curVal += c;
      i++;
    }

    if (rowVals.length === colNames.length) {
      const obj: any = {};
      colNames.forEach((col, idx) => {
        let v = rowVals[idx];
        if (v === 'NULL') v = '';
        obj[col] = v;
      });
      parsedUsers.push(obj);
    }
  }
}

console.log('Parsed Users Count:', parsedUsers.length);

let withStudentId = 0;
let withSri = 0;
let withWorkshopComp = 0;
const statusMap: Record<string, number> = {};

parsedUsers.forEach(u => {
  if (u.student_id && u.student_id.trim() && u.student_id !== "''") withStudentId++;
  if (u.workshop_registration_no && u.workshop_registration_no.trim() && u.workshop_registration_no !== "''") withSri++;
  if (u.workshop_completion_date && u.workshop_completion_date.trim() && u.workshop_completion_date !== "''") withWorkshopComp++;
  const sel = u.selection_status || 'empty';
  statusMap[sel] = (statusMap[sel] || 0) + 1;
});

console.log('With SRI Registration Number:', withSri);
console.log('With Student ID (Regular Students):', withStudentId);
console.log('With Workshop Completion Date:', withWorkshopComp);
console.log('Selection Status Breakdown:', statusMap);

console.log('\n=== SAMPLE PARSED USER WITH REGULAR STUDENT ID ===');
const regSamples = parsedUsers.filter(u => u.student_id && u.student_id.trim() && u.student_id !== "''").slice(0, 5);
regSamples.forEach(u => {
  console.log(`SRI: [${u.workshop_registration_no}] | Student ID: [${u.student_id}] | Name: ${u.name} (${u.name_bn}) | Dept: ${u.student_department} | Status: ${u.selection_status}`);
});
