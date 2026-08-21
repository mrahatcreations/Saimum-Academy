import { extractSqlUsers } from './importAllSqlData';

const users = extractSqlUsers();

// Group users by (name + SRI) or (name + phone)
const nameSriMap: Record<string, any[]> = {};

users.forEach((u, idx) => {
  const name = (u.name || '').trim().toUpperCase();
  const sri = (u.workshop_registration_no || '').trim();
  if (name && sri) {
    const key = `${name}:::${sri}`;
    if (!nameSriMap[key]) nameSriMap[key] = [];
    nameSriMap[key].push({ ...u, originalRowIndex: idx + 1 });
  }
});

const duplicateNameSri = Object.entries(nameSriMap).filter(([_, list]) => list.length > 1);

console.log('=== EXACT SAME NAME AND SAME SRI DUPLICATES ===');
console.log('Total exact (Name + SRI) duplicate groups:', duplicateNameSri.length);

duplicateNameSri.forEach(([key, list], idx) => {
  const [name, sri] = key.split(':::');
  console.log(`\n${idx + 1}. [${sri}] Name: "${name}" (${list[0].name_bn || 'N/A'}) - ${list.length} duplicate entries:`);
  list.forEach(item => {
    console.log(`   - Row ${item.originalRowIndex} | Phone: ${item.mobile_offline || item.father_mobile} | Status: ${item.selection_status} | StudentID: ${item.student_id || 'None'} | Dept: "${item.student_department || item.department_subject || ''}"`);
  });
});
