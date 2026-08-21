import fs from 'fs';
import path from 'path';

const sqlPath = path.join(__dirname, '../../../Old Database/saimumor_academy.sql');
const buffer = fs.readFileSync(sqlPath);

console.log('File size in bytes:', buffer.length);
console.log('First 10 bytes:', buffer.slice(0, 10));

let encoding = 'utf8';
if (buffer[0] === 0xff && buffer[1] === 0xfe) {
  encoding = 'utf16le';
} else if (buffer[0] === 0xfe && buffer[1] === 0xff) {
  encoding = 'utf16be';
}

console.log('Detected encoding:', encoding);
const text = buffer.toString(encoding as BufferEncoding);
console.log('First 200 characters:');
console.log(text.slice(0, 200));

// Count INSERT INTO `users`
const userInsertMatches = text.match(/INSERT INTO `users`/gi);
console.log('INSERT INTO `users` count with correct encoding:', userInsertMatches?.length || 0);
