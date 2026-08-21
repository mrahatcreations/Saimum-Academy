import { extractSqlUsers } from './importAllSqlData';

const sqlUsers = extractSqlUsers();

// Normalize name for matching
function norm(s: string | undefined): string {
  if (!s) return '';
  return s.trim().toUpperCase().replace(/\s+/g, ' ');
}

// Group by Name + Phone OR Name + Father/Mother Name
const personMap: Record<string, any[]> = {};

sqlUsers.forEach((u, idx) => {
  const name = norm(u.name);
  const phone = (u.mobile_offline || u.mobile_online || u.father_mobile || '').replace(/[^0-9]/g, '');
  const father = norm(u.father_name_en || u.father_name_bn);
  const sri = (u.workshop_registration_no || '').trim();

  // Create robust person key
  let key = '';
  if (name && phone.length >= 10) {
    key = `${name}::PHONE::${phone.slice(-10)}`;
  } else if (name && father) {
    key = `${name}::FATHER::${father}`;
  }

  if (key && sri) {
    if (!personMap[key]) personMap[key] = [];
    personMap[key].push({
      rowIndex: idx + 1,
      name: u.name,
      nameBn: u.name_bn,
      sri,
      phone: u.mobile_offline || u.mobile_online || u.father_mobile,
      studentId: u.student_id,
      department: u.student_department || u.department_subject || u.interested_subjects,
      createdAt: u.created_at || u.application_date,
      status: u.selection_status
    });
  }
});

// Filter groups that have MULTIPLE DIFFERENT SRI numbers
const multiSriPeople: any[] = [];

Object.entries(personMap).forEach(([_, list]) => {
  const uniqueSris = new Set(list.map(item => item.sri));
  if (uniqueSris.size > 1) {
    multiSriPeople.push({
      name: list[0].name,
      nameBn: list[0].nameBn,
      phone: list[0].phone,
      sris: Array.from(uniqueSris),
      entries: list
    });
  }
});

console.log('=== INDIVIDUALS WITH MULTIPLE DIFFERENT SRI NUMBERS ===');
console.log('Total people with multiple distinct SRI numbers:', multiSriPeople.length);

multiSriPeople.forEach((p, idx) => {
  console.log(`\n${idx + 1}. ${p.name} (${p.nameBn || 'N/A'})`);
  console.log(`   📱 Mobile: ${p.phone}`);
  console.log(`   🏷️ Assigned SRIs (${p.sris.length}): ${p.sris.join(', ')}`);
  p.entries.forEach((e: any) => {
    console.log(`      ↳ [${e.sri}] Subject: "${e.department || 'N/A'}" | Date: ${e.createdAt || 'N/A'} | Student ID: ${e.studentId || 'None'}`);
  });
});
