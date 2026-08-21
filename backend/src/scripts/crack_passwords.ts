import bcrypt from 'bcryptjs';

const hashes = [
  { name: 'M Rahat (Admin table)', hash: '$2y$10$DlB3xDF2kZrWwm51zD8Goe977DG63HzD6/nStgRcjsW82lWR.UXCy' },
  { name: 'MD Momiruzzaman Rahat (User table)', hash: '$2y$10$FlyzKzXjKmHKTkzwAIBwHu7l9hoHvKOojnMAKjUUD6E1Dr924Yzq2' },
  { name: 'Saiful Mollik (User table)', hash: '$2y$10$ZATLsMs6nGJ4XccbraJdeuSoYyuToM.gVqmZVOOAaLP5YaxpaQiuK' },
  { name: 'Saiful Mamun (Admin table)', hash: '$2y$10$K2p4.v8uWR5E398VZJo1neGPRbdJGIM90piXv/2JS9Pv/U42jVz6y' },
  { name: 'Administrator #1', hash: '$2y$10$DlB3xDF2kZrWwm51zD8Goe977DG63HzD6/nStgRcjsW82lWR.UXCy' }
];

const testPasswords = [
  'rtrahat81',
  'rtrahat81@gmail.com',
  'rtrahat',
  'rahat81',
  'rahat',
  '01750546825',
  '01571258525',
  'password',
  '123456',
  '12345678',
  '123456789',
  'admin',
  'admin123',
  'admin@123',
  'admin1234',
  'saimum',
  'saimum123',
  'saimum@123',
  'saimum2024',
  'saimum2025',
  'saimum2026',
  'saimumacademy',
  '241204',
  '202406000403',
  'Rahat81',
  'Rahat@81',
  'Rahat@123',
  'mrahatcreations'
];

console.log('🔍 Testing Passwords against Bcrypt Hashes in SQL Dump...\n');

hashes.forEach(item => {
  const normHash = item.hash.replace('$2y$', '$2a$');
  console.log(`Checking ${item.name}...`);
  let matched = false;
  for (const pass of testPasswords) {
    if (bcrypt.compareSync(pass, normHash)) {
      console.log(`  🎉 SUCCESS! MATCH FOUND for ${item.name} ➔ Password is: "${pass}"\n`);
      matched = true;
      break;
    }
  }
  if (!matched) {
    console.log(`  ❌ Not in quick list for ${item.name}`);
  }
});
