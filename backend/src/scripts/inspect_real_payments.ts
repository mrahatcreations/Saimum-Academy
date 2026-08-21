import fs from 'fs';
import path from 'path';

const sqlPath = path.resolve('..', 'Old Database', 'saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

function inspectTable(tableName: string) {
  console.log(`\n======================================================`);
  console.log(`🔍 TABLE: ${tableName}`);
  console.log(`======================================================`);

  // Find CREATE TABLE
  const createRegex = new RegExp(`CREATE TABLE \`${tableName}\`\\s*\\(([\\s\\S]*?)\\)\\s*ENGINE`, 'i');
  const createMatch = content.match(createRegex);
  if (createMatch) {
    console.log('Schema Definition:\n' + createMatch[1].split('\n').map(l => '  ' + l.trim()).join('\n'));
  }

  // Find INSERT INTO
  const insertRegex = new RegExp(`INSERT INTO \`${tableName}\`[^;]*;`, 'gi');
  const insertMatches = content.match(insertRegex);
  if (insertMatches) {
    console.log(`\nFound ${insertMatches.length} INSERT statements.`);
    let totalRows = 0;
    insertMatches.forEach((m, idx) => {
      // count tuples
      const count = (m.match(/\),/g) || []).length + 1;
      totalRows += count;
      if (idx === 0) {
        console.log(`Sample Insert Snippet:\n`, m.substring(0, 500) + '...\n');
      }
    });
    console.log(`Total rows estimated: ${totalRows}`);
  } else {
    console.log(`No INSERT INTO statements found for ${tableName}.`);
  }
}

inspectTable('payments');
inspectTable('payment_definitions');
inspectTable('student_department_fees');
inspectTable('payment_statuses');
inspectTable('payment_activity_logs');
