import { extractSqlUsers } from './importAllSqlData';

const sqlUsers = extractSqlUsers();
const sqlRegulars = sqlUsers.filter(u => u.student_id && u.student_id.trim().length > 0 && u.student_id !== 'null');

console.log('🔍 Verifying User Subject/Department Totals...\n');

let kidsCount = 0;
let theatreCount = 0;
let qiratCount = 0;
let recitationCount = 0;
let songitCount = 0;

sqlRegulars.forEach(u => {
  const dept = (u.student_department || '').toLowerCase();
  
  if (dept.includes('kid')) kidsCount++;
  if (dept.includes('theatre') || dept.includes('acting')) theatreCount++;
  if (dept.includes('qira')) qiratCount++;
  if (dept.includes('recit') || dept.includes('presentation')) recitationCount++;
  if (dept === 'songit') songitCount++;
});

console.log(`📊 Subject/Department Tag Breakdown:`);
console.log(`- KIDS: ${kidsCount} জন`);
console.log(`- Theatre: ${theatreCount} জন`);
console.log(`- Qiraat: ${qiratCount} জন`);
console.log(`- Recitation & Presentation: ${recitationCount} জন`);
console.log(`- Songit: ${songitCount} জন`);
console.log(`\nUnique Regular Students: ${sqlRegulars.length} জন`);
