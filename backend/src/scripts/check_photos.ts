import { extractSqlUsers } from './importAllSqlData';
import { loadExcelRows } from './importOldData';
import fs from 'fs';
import path from 'path';

const sqlUsers = extractSqlUsers();
const excelRows = loadExcelRows();

console.log('=== 1. CHECKING PHOTO FIELDS IN SQL DUMP ===');
let sqlPhotosCount = 0;
const sampleSqlPhotos: any[] = [];

sqlUsers.forEach((u, idx) => {
  const photo = u.photo || u.student_photo || u.image || u.profile_picture || u.avatar;
  if (photo && photo !== 'null' && photo.trim().length > 0) {
    sqlPhotosCount++;
    if (sampleSqlPhotos.length < 10) {
      sampleSqlPhotos.push({ name: u.name, photo, sri: u.workshop_registration_no });
    }
  }
});

console.log(`Total users with photo in SQL dump: ${sqlPhotosCount} / ${sqlUsers.length}`);
sampleSqlPhotos.forEach((s, idx) => {
  console.log(`   ${idx + 1}. [${s.sri || 'No SRI'}] ${s.name} -> Photo: "${s.photo}"`);
});

console.log('\n=== 2. CHECKING PHOTO COLUMNS IN EXCEL SHEET ===');
const header = excelRows[0] || [];
console.log('Excel Header columns:');
header.forEach((col: any, idx: number) => {
  if (col && (col.toLowerCase().includes('photo') || col.toLowerCase().includes('ছবি') || col.toLowerCase().includes('image') || col.toLowerCase().includes('drive'))) {
    console.log(`   Col ${idx}: "${col}"`);
  }
});

let excelPhotosCount = 0;
const sampleExcelPhotos: any[] = [];

for (let i = 1; i < excelRows.length; i++) {
  const row = excelRows[i];
  // Check any column with link or filename
  row.forEach((cell: any, cIdx: number) => {
    if (cell && typeof cell === 'string' && (cell.includes('http') || cell.includes('.jpg') || cell.includes('.png') || cell.includes('.jpeg') || cell.includes('drive.google.com'))) {
      excelPhotosCount++;
      if (sampleExcelPhotos.length < 10) {
        sampleExcelPhotos.push({ row: i, colName: header[cIdx] || `Col ${cIdx}`, value: cell });
      }
    }
  });
}

console.log(`\nTotal photo links/files found in Excel: ${excelPhotosCount}`);
sampleExcelPhotos.forEach((s, idx) => {
  console.log(`   ${idx + 1}. Row ${s.row} [${s.colName}] -> "${s.value}"`);
});

console.log('\n=== 3. CHECKING OLD DATABASE DIRECTORY FOR IMAGE FILES ===');
const oldDbDir = path.join(__dirname, '../../../Old Database');
if (fs.existsSync(oldDbDir)) {
  const files = fs.readdirSync(oldDbDir);
  console.log('Files in Old Database directory:', files);
}
