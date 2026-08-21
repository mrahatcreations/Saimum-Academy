import { loadExcelRows } from './importOldData';

const rows = loadExcelRows();
const directSris: number[] = [];

for (let i = 1; i < rows.length; i++) {
  const regRaw = rows[i][14]?.trim();
  if (regRaw && regRaw.startsWith('SRI-')) {
    const num = parseInt(regRaw.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num)) directSris.push(num);
  }
}

directSris.sort((a, b) => a - b);
console.log('Total original SRI rows in Excel:', directSris.length);
console.log('Lowest Original SRI in Excel:', directSris[0]);
console.log('Highest Original SRI in Excel:', directSris[directSris.length - 1]);
