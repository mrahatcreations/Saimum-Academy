import { prisma } from '../src/prisma';

async function seedWorkshops() {
  console.log('Seeding workshop sessions and batches...');
  const branches = await prisma.branch.findMany();
  const centralBranch = branches.find(b => b.code?.includes('PLT') || b.name.includes('Paltan')) || branches[0];
  const mirpurBranch = branches.find(b => b.code?.includes('MIR') || b.name.includes('Mirpur')) || branches[1];
  const staffList = await prisma.staff.findMany();

  const vocalCoord = staffList.find(s => s.fullName.includes('Noman')) || staffList[0];
  const qiraatCoord = staffList.find(s => s.fullName.includes('Asad')) || staffList[1];
  const dramaCoord = staffList.find(s => s.fullName.includes('Shams')) || staffList[2];

  // 1. Create Summer Workshop Session
  const session = await prisma.workshopSession.create({
    data: {
      id: 'ws-sess-2026',
      title: 'Summer Cultural Workshop 2026',
      code: 'WS-2026-SUMMER',
      year: 2026,
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      targetCapacity: 120,
      status: 'ONGOING',
      description: 'Intensive multi-disciplinary cultural training workshop for viva-selected applicants.',
      branchId: centralBranch?.id || null
    }
  });

  // 2. Create Batches
  const b1 = await prisma.workshopBatch.create({
    data: {
      id: 'ws-batch-01',
      sessionId: session.id,
      name: 'Workshop Batch 01 (Friday Morning)',
      scheduleDays: 'Friday & Saturday',
      timeSlot: '09:00 AM - 12:00 PM',
      shift: 'MORNING',
      roomNo: 'Studio Room 101 (Auditorium)',
      maxCapacity: 30,
      status: 'ACTIVE',
      branchId: centralBranch?.id || null
    }
  });

  const b2 = await prisma.workshopBatch.create({
    data: {
      id: 'ws-batch-02',
      sessionId: session.id,
      name: 'Workshop Batch 02 (Saturday Morning)',
      scheduleDays: 'Friday & Saturday',
      timeSlot: '09:00 AM - 12:00 PM',
      shift: 'MORNING',
      roomNo: 'Studio Room 102 (Lab)',
      maxCapacity: 30,
      status: 'ACTIVE',
      branchId: centralBranch?.id || null
    }
  });

  const b3 = await prisma.workshopBatch.create({
    data: {
      id: 'ws-batch-03',
      sessionId: session.id,
      name: 'Workshop Batch 03 (Mirpur Campus)',
      scheduleDays: 'Friday & Saturday',
      timeSlot: '03:00 PM - 06:00 PM',
      shift: 'AFTERNOON',
      roomNo: 'Mirpur Cultural Hall',
      maxCapacity: 30,
      status: 'ACTIVE',
      branchId: mirpurBranch?.id || null
    }
  });

  // 3. Assign Moderators
  if (vocalCoord) {
    await prisma.workshopBatchModerator.create({
      data: { workshopBatchId: b1.id, staffId: vocalCoord.id, role: 'PRIMARY_MODERATOR' }
    }).catch(() => {});
  }
  if (qiraatCoord) {
    await prisma.workshopBatchModerator.create({
      data: { workshopBatchId: b1.id, staffId: qiraatCoord.id, role: 'ASSISTANT_MODERATOR' }
    }).catch(() => {});
    await prisma.workshopBatchModerator.create({
      data: { workshopBatchId: b2.id, staffId: qiraatCoord.id, role: 'PRIMARY_MODERATOR' }
    }).catch(() => {});
  }
  if (dramaCoord) {
    await prisma.workshopBatchModerator.create({
      data: { workshopBatchId: b3.id, staffId: dramaCoord.id, role: 'PRIMARY_MODERATOR' }
    }).catch(() => {});
  }

  // 4. Enroll Students into Workshop Batches
  const registrations = await prisma.registration.findMany();
  for (let i = 0; i < registrations.length; i++) {
    const targetBatch = i === 0 ? b1 : i === 1 ? b2 : b3;
    await prisma.workshopStudentEnrollment.create({
      data: {
        workshopBatchId: targetBatch.id,
        registrationId: registrations[i].id,
        status: 'ENROLLED'
      }
    }).catch(() => {});
  }

  console.log('✓ Workshop session and batches seeded successfully!');
}

seedWorkshops()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
