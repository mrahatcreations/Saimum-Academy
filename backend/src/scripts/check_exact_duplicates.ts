import { extractSqlUsers } from './importAllSqlData';
import { loadExcelRows } from './importOldData';

const sqlUsers = extractSqlUsers();
const excelRows = loadExcelRows();

console.log('=== 1. CHECKING EXCEL SHEET FOR SAME NAME AND SAME SRI ===');
const excelNameSri: Record<string, any[]> = {};
for (let i = 1; i < excelRows.length; i++) {
  const r = excelRows[i];
  const name = (r[3] || r[2] || '').trim().toUpperCase();
  const sri = (r[14] || '').trim();
  if (name && sri) {
    const key = `${name}:::${sri}`;
    if (!excelNameSri[key]) excelNameSri[key] = [];
    excelNameSri[key].push({ row: i, name, sri, sub: r[15] || r[13], phone: r[29] || r[7] });
  }
}

const excelDups = Object.entries(excelNameSri).filter(([_, list]) => list.length > 1);
console.log('Total exact (Name + SRI) duplicate groups in Excel Sheet:', excelDups.length);
excelDups.forEach(([key, list], idx) => {
  const [name, sri] = key.split(':::');
  console.log(`\n${idx + 1}. [${sri}] ${name} (${list.length} rows in Excel):`);
  list.forEach(item => {
    console.log(`   - Row ${item.row} | Subject: "${item.sub}" | Phone: ${item.phone}`);
  });
});

console.log('\n=== 2. CHECKING SQL DUMP FOR SAME SRI USED FOR MULTIPLE PEOPLE ===');
const sriMap: Record<string, any[]> = {};
sqlUsers.forEach((u, idx) => {
  const sri = (u.workshop_registration_no || '').trim();
  if (sri && sri.startsWith('SRI-')) {
    if (!sriMap[sri]) sriMap[sri] = [];
    sriMap[sri].push({ row: idx + 1, name: u.name, nameBn: u.name_bn, phone: u.mobile_offline || u.father_mobile, studentId: u.student_id });
  }
});

const duplicateSrisInSql = Object.entries(sriMap).filter(([_, list]) => list.length > 1);
console.log('Total SRI codes duplicated in SQL dump:', duplicateSrisInSql.length);
duplicateSrisInSql.forEach(([sri, list], idx) => {
  console.log(`\n${idx + 1}. SRI: [${sri}] (${list.length} entries in SQL):`);
  list.forEach(item => {
    console.log(`   - Row ${item.row} | Name: ${item.name} (${item.nameBn || ''}) | Phone: ${item.phone} | StudentID: ${item.studentId || 'N/A'}`);
  });
});

console.log('\n=== 3. CHECKING SQL DUMP FOR SAME PERSON (NAME + PHONE) WITH MULTIPLE DIFFERENT SRIs ===');
const personMap: Record<string, any[]> = {};
sqlUsers.forEach((u, idx) => {
  const name = (u.name || '').trim().toUpperCase();
  const phone = (u.mobile_offline || u.father_mobile || '').replace(/[^0-9]/g, '');
  if (name && phone.length >= 10) {
    const key = `${name}:::${phone}`;
    if (!personMap[key]) personMap[key] = [];
    personMap[key].push({ row: idx + 1, name: u.name, sri: u.workshop_registration_no, sub: u.student_department, studentId: u.student_id });
  }
});

const multiSriPersons = Object.entries(personMap).filter(([_, list]) => list.length > 1);
console.log('Total individuals with multiple registrations (Same Name + Same Phone):', multiSriPersons.length);
multiSriPersons.forEach(([_, list], idx) => {
  console.log(`\n${idx + 1}. Name: "${list[0].name}" (${list.length} different registrations):`);
  list.forEach(item => {
    console.log(`   - Row ${item.row} | SRI: [${item.sri || 'No SRI'}] | Subject: "${item.sub}" | StudentID: ${item.studentId || 'None'}`);
  });
});
