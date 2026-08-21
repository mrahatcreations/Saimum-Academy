import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

// Let's count rows in `users` table
const usersSection = content.split('INSERT INTO `users`');
let totalUserRows = 0;
const userList: any[] = [];

for (let i = 1; i < usersSection.length; i++) {
  const statement = usersSection[i].split(';')[0];
  // split by row tuples e.g. (1, '...', ...)
  const rows = statement.split(/\),\s*\(/);
  totalUserRows += rows.length;
}

console.log('=== TOTAL USER ROWS IN SQL ===');
console.log('Total user rows in SQL dump:', totalUserRows);

// Let's check SRI numbers in `users` table
const regNoMatches = content.matchAll(/`registration_number`|'SRI-[0-9]+'/g);
const srisInUsers = new Set<string>();
for (const match of content.matchAll(/'(SRI-[0-9]+)'/g)) {
  srisInUsers.add(match[1]);
}
console.log('Unique SRI registration codes found in SQL dump:', srisInUsers.size);

// Check minimum and maximum SRI numbers in SQL dump
const sriNums = Array.from(srisInUsers).map(s => parseInt(s.replace(/[^0-9]/g, ''), 10)).filter(n => !isNaN(n));
sriNums.sort((a, b) => a - b);
console.log('Lowest SRI in SQL dump:', sriNums[0]);
console.log('Highest SRI in SQL dump:', sriNums[sriNums.length - 1]);
console.log('Total unique SRI in SQL:', sriNums.length);

// Check payments count
const paymentsSection = content.split('INSERT INTO `payments`');
let totalPaymentRows = 0;
for (let i = 1; i < paymentsSection.length; i++) {
  const statement = paymentsSection[i].split(';')[0];
  const rows = statement.split(/\),\s*\(/);
  totalPaymentRows += rows.length;
}
console.log('Total Payment rows in SQL:', totalPaymentRows);
