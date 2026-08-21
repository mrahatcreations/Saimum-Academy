import { extractSqlUsers } from './importAllSqlData';
import { loadExcelRows } from './importOldData';
import fs from 'fs';
import path from 'path';

const sqlUsers = extractSqlUsers();
const excelRows = loadExcelRows();

console.log('=== 1. DEPARTMENTS & SUBJECTS FROM SQL DUMP ===');
const deptCounts: Record<string, number> = {};
const subCounts: Record<string, number> = {};

sqlUsers.forEach(u => {
  const d = u.student_department || u.department || 'EMPTY';
  const s = u.student_subjects || u.interested_subjects || u.department_subject || 'EMPTY';
  deptCounts[d] = (deptCounts[d] || 0) + 1;
  subCounts[s] = (subCounts[s] || 0) + 1;
});

console.log('--- SQL student_department column values ---');
Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  "${k}": ${v} users`));

console.log('\n--- SQL student_subjects / interested_subjects column values ---');
Object.entries(subCounts).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([k, v]) => console.log(`  "${k}": ${v} users`));

console.log('\n=== 2. DEPARTMENTS & SUBJECTS FROM EXCEL SHEET ===');
const excelSubs: Record<string, number> = {};
for (let i = 1; i < excelRows.length; i++) {
  const r = excelRows[i];
  const sub = r[15] || r[13] || 'EMPTY';
  excelSubs[sub] = (excelSubs[sub] || 0) + 1;
}

console.log('--- Excel Subject / Course column values ---');
Object.entries(excelSubs).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  "${k}": ${v} rows`));
