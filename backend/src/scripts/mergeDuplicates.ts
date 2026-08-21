import { prisma } from '../prisma';

export async function mergeAndCleanDuplicates() {
  console.log('🚀 Starting Intelligent Person & Registration Merge Engine...\n');

  const allPeople = await prisma.person.findMany({
    include: {
      registrations: {
        include: {
          session: true,
          branch: true
        }
      },
      studentProfile: {
        include: {
          batchMemberships: true
        }
      }
    }
  });

  console.log(`Analyzing ${allPeople.length} total Person records...`);

  // 1. Group people by normalized Name + Phone (or Name + NID)
  function norm(s: string | null | undefined): string {
    if (!s) return '';
    return s.trim().toUpperCase().replace(/\s+/g, ' ');
  }

  const personClusters: Record<string, typeof allPeople> = {};

  allPeople.forEach(p => {
    const name = norm(p.fullNameEn);
    const phone = (p.phone || '').replace(/[^0-9]/g, '').slice(-10);
    const father = norm(p.fatherName);
    const nid = (p.nidBirthCert || '').replace(/[^0-9]/g, '');

    let clusterKey = '';
    if (name && phone && phone.length >= 10 && !phone.startsWith('017110')) {
      clusterKey = `NAME_PHONE:::${name}:::${phone}`;
    } else if (name && nid && nid.length >= 6) {
      clusterKey = `NAME_NID:::${name}:::${nid}`;
    } else if (name && father) {
      clusterKey = `NAME_FATHER:::${name}:::${father}`;
    }

    if (clusterKey) {
      if (!personClusters[clusterKey]) personClusters[clusterKey] = [];
      personClusters[clusterKey].push(p);
    }
  });

  let mergedPersonsCount = 0;
  let deletedDuplicateRegsCount = 0;
  let preservedMultiSubjectRegsCount = 0;

  for (const [key, cluster] of Object.entries(personClusters)) {
    if (cluster.length <= 1) continue;

    console.log(`\n📦 Merging cluster: [${cluster[0].fullNameEn}] (${cluster.length} person records)`);

    // Pick primary person: One with studentProfile or most complete data
    cluster.sort((a, b) => {
      const aScore = (a.studentProfile ? 100 : 0) + a.registrations.length * 10 + (a.fullNameBn ? 5 : 0) + (a.email ? 5 : 0);
      const bScore = (b.studentProfile ? 100 : 0) + b.registrations.length * 10 + (b.fullNameBn ? 5 : 0) + (b.email ? 5 : 0);
      return bScore - aScore;
    });

    const primaryPerson = cluster[0];
    const duplicates = cluster.slice(1);

    // Merge biometrics into primary if primary was missing anything
    let needsPersonUpdate = false;
    const updateData: any = {};

    duplicates.forEach(d => {
      if (!primaryPerson.fullNameBn && d.fullNameBn) { updateData.fullNameBn = d.fullNameBn; needsPersonUpdate = true; }
      if (!primaryPerson.email && d.email) { updateData.email = d.email; needsPersonUpdate = true; }
      if (!primaryPerson.fatherName && d.fatherName) { updateData.fatherName = d.fatherName; needsPersonUpdate = true; }
      if (!primaryPerson.fatherPhone && d.fatherPhone) { updateData.fatherPhone = d.fatherPhone; needsPersonUpdate = true; }
      if (!primaryPerson.motherName && d.motherName) { updateData.motherName = d.motherName; needsPersonUpdate = true; }
      if (!primaryPerson.nidBirthCert && d.nidBirthCert) { updateData.nidBirthCert = d.nidBirthCert; needsPersonUpdate = true; }
      if (!primaryPerson.presentAddressLine && d.presentAddressLine) { updateData.presentAddressLine = d.presentAddressLine; needsPersonUpdate = true; }
      if (!primaryPerson.academicInstitution && d.academicInstitution) { updateData.academicInstitution = d.academicInstitution; needsPersonUpdate = true; }
      if (!primaryPerson.currentClass && d.currentClass) { updateData.currentClass = d.currentClass; needsPersonUpdate = true; }
      if (!primaryPerson.photoUrl && d.photoUrl) { updateData.photoUrl = d.photoUrl; needsPersonUpdate = true; }
    });

    if (needsPersonUpdate) {
      await prisma.person.update({
        where: { id: primaryPerson.id },
        data: updateData
      });
    }

    // Now inspect all registrations across primary + duplicates
    const allClusterRegs = cluster.flatMap(p => p.registrations);
    const uniqueSubjectsSeen = new Set<string>();

    for (const reg of allClusterRegs) {
      const subKey = `${reg.sessionId}:::${reg.subjectId || 'DEFAULT'}`;

      if (uniqueSubjectsSeen.has(subKey)) {
        // Redundant accidental re-submission for the same subject in same session
        console.log(`   ✂️ Removing redundant re-submission: [${reg.registrationNo}]`);
        await prisma.registration.delete({ where: { id: reg.id } });
        deletedDuplicateRegsCount++;
      } else {
        // Legitimate registration for this subject/session
        uniqueSubjectsSeen.add(subKey);
        if (reg.personId !== primaryPerson.id) {
          // Re-link to primary person
          await prisma.registration.update({
            where: { id: reg.id },
            data: { personId: primaryPerson.id }
          });
          preservedMultiSubjectRegsCount++;
        }
      }
    }

    // Move workshop enrollments to primary person
    for (const d of duplicates) {
      await prisma.workshopStudentEnrollment.updateMany({
        where: { personId: d.id },
        data: { personId: primaryPerson.id }
      });
    }

    // Delete redundant duplicate Person records
    for (const d of duplicates) {
      if (d.studentProfile) {
        // Re-link studentProfile if primary didn't have one
        if (!primaryPerson.studentProfile) {
          await prisma.student.update({
            where: { id: d.studentProfile.id },
            data: { personId: primaryPerson.id }
          });
        } else {
          // Both had student records, remove duplicate student record
          await prisma.batchMembership.deleteMany({ where: { studentId: d.studentProfile.id } });
          await prisma.student.delete({ where: { id: d.studentProfile.id } });
        }
      }
      await prisma.person.delete({ where: { id: d.id } });
      mergedPersonsCount++;
    }
  }

  // 2. Also clean up any lingering registrations with duplicate base SRI for the same subject
  const remainingPeople = await prisma.person.findMany({
    include: {
      registrations: true
    }
  });

  for (const p of remainingPeople) {
    if (p.registrations.length > 1) {
      const seen = new Set<string>();
      for (const reg of p.registrations) {
        const key = `${reg.sessionId}:::${reg.subjectId}`;
        if (seen.has(key)) {
          console.log(`   ✂️ Cleaning exact duplicate subject registration on person ${p.fullNameEn}: [${reg.registrationNo}]`);
          await prisma.registration.delete({ where: { id: reg.id } });
          deletedDuplicateRegsCount++;
        } else {
          seen.add(key);
        }
      }
    }
  }

  console.log('\n======================================================');
  console.log('🎉 MERGE & DEDUPLICATION COMPLETED SUCCESSFULLY!');
  console.log(`👤 Redundant Duplicate Person Profiles Merged & Removed: ${mergedPersonsCount}`);
  console.log(`🗑️ Accidental Duplicate Registrations Removed: ${deletedDuplicateRegsCount}`);
  console.log(`🎵 Legitimate Multi-Subject Registrations Consolidated: ${preservedMultiSubjectRegsCount}`);
  console.log('======================================================\n');
}

// Self execute if run directly
if (require.main === module) {
  mergeAndCleanDuplicates()
    .catch(err => {
      console.error('❌ Merge Failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
