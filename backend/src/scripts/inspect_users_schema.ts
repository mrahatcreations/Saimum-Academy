import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

// Find CREATE TABLE `users`
const usersTableMatch = content.match(/CREATE TABLE `users`\s*\((.*?)\)\s*ENGINE/s);
if (usersTableMatch) {
  console.log('=== USERS TABLE SCHEMA ===');
  console.log(usersTableMatch[1]);
}

// Sample 5 user rows
const usersInsert = content.match(/INSERT INTO `users`[^;]+;/);
if (usersInsert) {
  console.log('\n=== SAMPLE INSERT USERS ===');
  console.log(usersInsert[0].slice(0, 1500));
}
