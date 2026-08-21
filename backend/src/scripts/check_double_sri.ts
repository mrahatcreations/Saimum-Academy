import { prisma } from '../prisma';

async function checkDoubleSri() {
  const people = await prisma.person.findMany({
    include: {
      registrations: true,
      studentProfile: true
    }
  });

  // 1. Check if any Person entity has multiple Registrations
  const multiRegPeople = people.filter(p => p.registrations.length > 1);
  console.log('=== PEOPLE WITH MULTIPLE REGISTRATIONS IN CURRENT DB ===');
  console.log('Total people with >1 registration:', multiRegPeople.length);
  multiRegPeople.slice(0, 10).forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.fullNameEn}] Phone: ${p.phone} -> Regs:`, p.registrations.map(r => r.registrationNo));
  });

  // 2. Check if multiple people have the same base SRI (e.g. SRI-00666, SRI-00666-2)
  const allRegs = await prisma.registration.findMany({
    select: {
      registrationNo: true,
      person: {
        select: {
          fullNameEn: true,
          fullNameBn: true,
          phone: true
        }
      }
    }
  });

  const baseMap: Record<string, any[]> = {};
  allRegs.forEach(r => {
    const base = r.registrationNo.replace(/-[0-9]+$/, '');
    if (!baseMap[base]) baseMap[base] = [];
    baseMap[base].push(r);
  });

  const duplicateSris = Object.entries(baseMap).filter(([_, list]) => list.length > 1);
  console.log('\n=== SRI NUMBERS THAT APPEARED MORE THAN ONCE ===');
  console.log('Total SRI codes with duplicates/multiple entries:', duplicateSris.length);

  duplicateSris.slice(0, 15).forEach(([base, list], idx) => {
    console.log(`\n${idx + 1}. Base SRI: [${base}] (${list.length} entries)`);
    list.forEach(item => {
      console.log(`   - RegNo: ${item.registrationNo} | Name: ${item.person.fullNameEn} (${item.person.fullNameBn || ''}) | Phone: ${item.person.phone}`);
    });
  });

  // 3. Check duplicate phone numbers across different persons
  const phoneMap: Record<string, any[]> = {};
  people.forEach(p => {
    if (p.phone && p.phone.length >= 10 && !p.phone.startsWith('017110')) {
      if (!phoneMap[p.phone]) phoneMap[p.phone] = [];
      phoneMap[p.phone].push(p);
    }
  });

  const multiPhonePeople = Object.entries(phoneMap).filter(([_, list]) => list.length > 1);
  console.log('\n=== SAME PHONE NUMBER USED BY MULTIPLE ENTRIES ===');
  console.log('Total phone numbers shared across multiple applicant records:', multiPhonePeople.length);
  multiPhonePeople.slice(0, 10).forEach(([phone, list], idx) => {
    console.log(`\nPhone: ${phone} (${list.length} records):`);
    list.forEach(p => {
      console.log(`   - Name: ${p.fullNameEn} (${p.fullNameBn || ''}) | Regs:`, p.registrations.map((r: any) => r.registrationNo));
    });
  });
}

checkDoubleSri()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
