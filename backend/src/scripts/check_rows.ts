import { loadExcelRows } from './importOldData';

// Let's inspect rows length
const rows = loadExcelRows();
console.log('Total rows loaded:', rows.length);
let emptyCount = 0;
for (let i = 1; i < rows.length; i++) {
  if (!rows[i] || rows[i].length === 0 || (!rows[i][2] && !rows[i][3])) {
    emptyCount++;
  }
}
console.log('Valid applicant rows:', rows.length - 1 - emptyCount);
