import fs from 'fs';
import path from 'path';

export interface SqlUser {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  application_date?: string;
  admission_date?: string;
  name_bn?: string;
  father_name_bn?: string;
  father_name_en?: string;
  father_mobile?: string;
  mother_name_bn?: string;
  mother_name_en?: string;
  mother_mobile?: string;
  workshop_completion_date?: string;
  workshop_completion_subject?: string;
  workshop_registration_no?: string;
  student_id?: string;
  student_department?: string;
  interested_subjects?: string;
  student_subjects?: string;
  user_role?: string;
  batch_id?: string;
  selection_status?: string;
  examiner_decision?: string;
  national_id_birth_reg_no?: string;
  current_address?: string;
  permanent_address?: string;
  current_district?: string;
  permanent_district?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  educational_institution?: string;
  class_year?: string;
  mobile_offline?: string;
  mobile_online?: string;
  payment_method?: string;
  transaction_id?: string;
  payment_status?: string;
}

export function parseSqlUsers(): SqlUser[] {
  const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
  const content = fs.readFileSync(sqlPath, 'utf8');

  // Extract column list
  const usersTableMatch = content.match(/CREATE TABLE `users`\s*\((.*?)\)\s*ENGINE/s);
  const colLines = usersTableMatch![1].split('\n').filter(l => l.trim().startsWith('`'));
  const colNames = colLines.map(l => l.trim().match(/`([^`]+)`/)![1]);

  const users: SqlUser[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (!line.startsWith('INSERT INTO `users`')) continue;

    // The line has: INSERT INTO `users` (...) VALUES (1, '...', ...), (2, '...', ...);
    const valStart = line.indexOf('VALUES');
    if (valStart === -1) continue;
    const rawData = line.slice(valStart + 6).trim();

    let i = 0;
    while (i < rawData.length) {
      // Find start of tuple '('
      while (i < rawData.length && rawData[i] !== '(') i++;
      if (i >= rawData.length) break;
      i++; // skip '('

      const rowValues: string[] = [];
      let currentVal = '';
      let inString = false;
      let escape = false;

      while (i < rawData.length) {
        const char = rawData[i];

        if (escape) {
          currentVal += char;
          escape = false;
          i++;
          continue;
        }

        if (char === '\\') {
          escape = true;
          i++;
          continue;
        }

        if (char === "'") {
          inString = !inString;
          i++;
          continue;
        }

        if (!inString) {
          if (char === ',') {
            rowValues.push(currentVal === 'NULL' ? '' : currentVal);
            currentVal = '';
            i++;
            continue;
          }
          if (char === ')') {
            rowValues.push(currentVal === 'NULL' ? '' : currentVal);
            currentVal = '';
            i++;
            break; // end of tuple
          }
        }

        currentVal += char;
        i++;
      }

      if (rowValues.length === colNames.length) {
        const rowObj: any = {};
        colNames.forEach((col, idx) => {
          rowObj[col] = rowValues[idx];
        });
        users.push(rowObj);
      }
    }
  }

  return users;
}

// Run test if executed directly
if (require.main === module) {
  const start = Date.now();
  const users = parseSqlUsers();
  const dur = Date.now() - start;
  console.log(`⚡ Parsed ${users.length} SQL users in ${dur}ms!`);

  let withStudentId = 0;
  let withSri = 0;
  let withWorkshopComp = 0;
  const statusMap: Record<string, number> = {};

  users.forEach(u => {
    if (u.student_id && u.student_id.trim()) withStudentId++;
    if (u.workshop_registration_no && u.workshop_registration_no.trim()) withSri++;
    if (u.workshop_completion_date && u.workshop_completion_date.trim()) withWorkshopComp++;
    const sel = u.selection_status || 'empty';
    statusMap[sel] = (statusMap[sel] || 0) + 1;
  });

  console.log('Total Users:', users.length);
  console.log('With SRI Registration Number:', withSri);
  console.log('With Student ID (Regular Students):', withStudentId);
  console.log('With Workshop Completion Date:', withWorkshopComp);
  console.log('Selection Status Breakdown:', statusMap);

  console.log('\n=== SAMPLE PARSED USER WITH REGULAR STUDENT ID ===');
  const regSamples = users.filter(u => u.student_id && u.student_id.trim()).slice(0, 5);
  regSamples.forEach(u => {
    console.log(`SRI: [${u.workshop_registration_no}] | Student ID: [${u.student_id}] | Name: ${u.name} (${u.name_bn}) | Dept: ${u.student_department} | Status: ${u.selection_status}`);
  });
}
