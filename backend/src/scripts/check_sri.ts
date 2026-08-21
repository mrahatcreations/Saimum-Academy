import { prisma } from '../prisma';

async function checkSriRange() {
  const registrations = await prisma.registration.findMany({
    select: {
      registrationNo: true,
      person: { select: { fullNameEn: true, fullNameBn: true } },
      session: { select: { title: true, year: true } }
    },
    orderBy: { registrationNo: 'asc' }
  });

  const numericSri: number[] = [];
  const allRegs: string[] = [];

  registrations.forEach(r => {
    allRegs.push(r.registrationNo);
    const match = r.registrationNo.match(/SRI-0*([0-9]+)/);
    if (match) {
      numericSri.push(parseInt(match[1], 10));
    }
  });

  numericSri.sort((a, b) => a - b);

  console.log('=== SRI REGISTRATION NUMBER RANGE ===');
  console.log('Total Registrations:', registrations.length);
  console.log('Lowest SRI Number:', `SRI-${String(numericSri[0]).padStart(5, '0')} (${numericSri[0]})`);
  console.log('Highest SRI Number:', `SRI-${String(numericSri[numericSri.length - 1]).padStart(5, '0')} (${numericSri[numericSri.length - 1]})`);

  console.log('\n=== TOP 10 HIGHEST SRI NUMBERS ===');
  const top10 = registrations
    .filter(r => r.registrationNo.startsWith('SRI-'))
    .sort((a, b) => {
      const numA = parseInt(a.registrationNo.replace(/[^0-9]/g, ''), 10);
      const numB = parseInt(b.registrationNo.replace(/[^0-9]/g, ''), 10);
      return numB - numA;
    })
    .slice(0, 10);

  top10.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.registrationNo}] ${r.person.fullNameEn} (${r.person.fullNameBn}) | ${r.session?.title}`);
  });
}

checkSriRange()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
