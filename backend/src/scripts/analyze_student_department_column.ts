import { extractSqlUsers } from './importAllSqlData';

const sqlUsers = extractSqlUsers();

console.log('================================================================================');
console.log('📊 `saimumor_academy.sql` এর `student_department` কলামের পূর্ণাঙ্গ ব্যবচ্ছেদ');
console.log('================================================================================\n');

interface DeptStats {
  total: number;
  regularCount: number;
  nonRegularCount: number;
  sampleRegulars: string[];
  sampleNonRegulars: string[];
}

const stats: Record<string, DeptStats> = {};

sqlUsers.forEach(u => {
  const dept = u.student_department || '(খালি / NULL)';
  if (!stats[dept]) {
    stats[dept] = {
      total: 0,
      regularCount: 0,
      nonRegularCount: 0,
      sampleRegulars: [],
      sampleNonRegulars: []
    };
  }

  stats[dept].total++;

  const isRegular = !!(u.student_id && u.student_id.trim().length > 0 && u.student_id !== 'null');

  if (isRegular) {
    stats[dept].regularCount++;
    if (stats[dept].sampleRegulars.length < 3) {
      stats[dept].sampleRegulars.push(`[${u.student_id}] ${u.name}`);
    }
  } else {
    stats[dept].nonRegularCount++;
    if (stats[dept].sampleNonRegulars.length < 2) {
      stats[dept].sampleNonRegulars.push(`[SRI: ${u.workshop_registration_no || 'N/A'}] ${u.name}`);
    }
  }
});

const sortedEntries = Object.entries(stats).sort((a, b) => b[1].total - a[1].total);

console.log(`মোট সংরক্ষিত ইউজার রেকর্ড: ${sqlUsers.length} জন\n`);
console.log(`মোট ইউনিক ডিপার্টমেন্ট ভ্যালু পাওয়া গেছে: ${sortedEntries.length} টি\n`);

sortedEntries.forEach(([dept, data], idx) => {
  console.log(`📌 ${idx + 1}. ডিপার্টমেন্ট ভ্যালু: "${dept}"`);
  console.log(`   - সর্বমোট আবেদনকারী/ইউজার: ${data.total} জন`);
  console.log(`   - নিয়মিত শিক্ষার্থী (Regular with Student ID): ${data.regularCount} জন`);
  console.log(`   - অনির্বাচিত / আবেদনকারী (Non-Regular): ${data.nonRegularCount} জন`);
  if (data.sampleRegulars.length > 0) {
    console.log(`   - নিয়মিত শিক্ষার্থী নমুনা: ${data.sampleRegulars.join(', ')}`);
  }
  if (data.sampleNonRegulars.length > 0) {
    console.log(`   - আবেদনকারী নমুনা: ${data.sampleNonRegulars.join(', ')}`);
  }
  console.log('--------------------------------------------------------------------------------');
});
