import { loadExcelRows } from './importOldData';

const rows = loadExcelRows();
const list: { row: number; sri: string; name: string }[] = [];

for (let i = 1; i < rows.length; i++) {
  const regRaw = rows[i][14]?.trim();
  if (regRaw) {
    list.push({ row: i, sri: regRaw, name: rows[i][3] || rows[i][2] || '' });
  }
}

list.sort((a, b) => {
  const numA = parseInt(a.sri.replace(/[^0-9]/g, ''), 10) || 0;
  const numB = parseInt(b.sri.replace(/[^0-9]/g, ''), 10) || 0;
  return numB - numA;
});

console.log('Top 15 highest SRI in original responses:');
list.slice(0, 15).forEach((item, idx) => {
  console.log(`${idx + 1}. [${item.sri}] ${item.name} (Row ${item.row})`);
});
