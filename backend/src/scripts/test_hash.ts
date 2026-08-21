import bcrypt from 'bcryptjs';

const hashes = [
  '$2y$10$ZATLsMs6nGJ4XccbraJdeuSoYyuToM.gVqmZVOOAaLP5YaxpaQiuK',
  '$2y$10$K2p4.v8uWR5E398VZJo1neGPRbdJGIM90piXv/2JS9Pv/U42jVz6y'
];

const candidates = [
  'password',
  '123456',
  '12345678',
  '123456789',
  'admin',
  'admin123',
  'admin1234',
  'saiful',
  'saiful123',
  'saiful@123',
  'saimum',
  'saimum123',
  'saimum@123',
  'saimumacademy',
  'saimum@2025',
  'saimum@2026',
  '01571258525',
  'shilpigosthi',
  'shilpigosthi123',
  'academy123',
  'secret',
  '11223344',
  '12345678@',
  'Admin@123',
  'Admin123',
  'Saiful@123'
];

console.log('Testing common passwords against Bcrypt hashes...');

hashes.forEach((hash, hIdx) => {
  // Replace $2y$ with $2a$ for standard JS bcrypt compatibility if needed
  const normalizedHash = hash.replace('$2y$', '$2a$');
  candidates.forEach(pass => {
    try {
      if (bcrypt.compareSync(pass, normalizedHash)) {
        console.log(`🎉 MATCH FOUND for Hash #${hIdx + 1}! Password is: "${pass}"`);
      }
    } catch (e) {}
  });
});
