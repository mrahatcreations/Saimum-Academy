import bcrypt from 'bcryptjs';

const targetHash = '$2y$10$DlB3xDF2kZrWwm51zD8Goe977DG63HzD6/nStgRcjsW82lWR.UXCy'.replace('$2y$', '$2a$');
const saifulHash = '$2y$10$ZATLsMs6nGJ4XccbraJdeuSoYyuToM.gVqmZVOOAaLP5YaxpaQiuK'.replace('$2y$', '$2a$');

// Let's generate common patterns:
const words = [
  'admin', 'administrator', 'saimum', 'saimumacademy', 'academy', 'shilpigosthi',
  'rahat', 'mrahat', 'rtrahat', 'mrahatcreations', 'saiful', 'saifulmamun', 'mollik',
  '123456', '12345678', 'password', 'pass', 'bangladesh', 'dhaka', 'paltan',
  'admin@saimum', 'admin@12345', 'saimum@12345', 'saimum#123', 'admin#123'
];

const suffixes = ['', '123', '@123', '1234', '12345', '123456', '2024', '2025', '2026', '@2025', '@2026', '!', '@', '#', '$', '81', '@81'];

const allCandidates: string[] = [];
words.forEach(w => {
  suffixes.forEach(s => {
    allCandidates.push(w + s);
    allCandidates.push(w.toUpperCase() + s);
    allCandidates.push(w.charAt(0).toUpperCase() + w.slice(1) + s);
  });
});

console.log(`Testing ${allCandidates.length} generated candidate passwords...\n`);

for (const p of allCandidates) {
  if (bcrypt.compareSync(p, targetHash)) {
    console.log(`🎉 MATCH FOUND for Admin Hash! Password is: "${p}"`);
    break;
  }
  if (bcrypt.compareSync(p, saifulHash)) {
    console.log(`🎉 MATCH FOUND for Saiful Hash! Password is: "${p}"`);
  }
}
