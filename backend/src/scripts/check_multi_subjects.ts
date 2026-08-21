import fs from 'fs';
import path from 'path';
import { parseSqlUsers } from './fast_parse_sql';

const users = parseSqlUsers();
console.log('Total users:', users.length);

let multiCount = 0;
const sampleMultis: any[] = [];

users.forEach(u => {
  const rawSubs = u.student_subjects || u.interested_subjects || u.department_subject || '';
  if (rawSubs.includes(',') || rawSubs.includes(';') || rawSubs.includes('&')) {
    multiCount++;
    if (sampleMultis.length < 10) {
      sampleMultis.push({
        name: u.name,
        subjects: rawSubs,
        sri: u.workshop_registration_no,
        student_id: u.student_id
      });
    }
  }
});

console.log('Users with multiple subjects:', multiCount);
console.log('Sample Multi-Subject Users:');
sampleMultis.forEach((s, idx) => {
  console.log(`${idx + 1}. [${s.sri || 'NO-SRI'}] ${s.name} -> Subjects: "${s.subjects}" | StudentID: ${s.student_id || 'N/A'}`);
});
