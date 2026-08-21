import { extractSqlUsers } from './importAllSqlData';

const sqlUsers = extractSqlUsers();
const sqlRegulars = sqlUsers.filter(u => u.student_id && u.student_id.trim().length > 0 && u.student_id !== 'null');

console.log('🔍 Explaining Unique Students vs Department Seats...\n');

const singleDeptStudents: any[] = [];
const multiDeptStudents: any[] = [];

sqlRegulars.forEach(u => {
  const dept = (u.student_department || '').trim();
  if (dept.includes(',')) {
    multiDeptStudents.push(u);
  } else {
    singleDeptStudents.push(u);
  }
});

console.log(`১. শুধুমাত্র ১টি ডিপার্টমেন্টে থাকা একক শিক্ষার্থী: ${singleDeptStudents.length} জন`);
console.log(`২. একাধিক (২টি) ডিপার্টমেন্টে থাকা দ্বৈত শিক্ষার্থী: ${multiDeptStudents.length} জন`);
console.log(`--------------------------------------------------------------------------------`);
console.log(`👉 সর্বমোট ভিন্ন ভিন্ন আসল শিক্ষার্থী (Total Unique Persons with Student ID): ${sqlRegulars.length} জন`);
console.log(`👉 ডিপার্টমেন্ট যোগফল (Seats / Double-counted Total): ${singleDeptStudents.length + (multiDeptStudents.length * 2)} টি সিট`);
