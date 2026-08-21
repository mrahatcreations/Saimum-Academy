import { prisma } from '../src/prisma';

async function seedStaff() {
  console.log('Seeding rich staff records...');

  // Clear existing staff & department assignments
  await prisma.staffDepartmentAssignment.deleteMany();
  await prisma.staffBatchAssignment.deleteMany();
  await prisma.staff.deleteMany();

  const branches = await prisma.branch.findMany();
  const depts = await prisma.department.findMany();

  const brPaltan = branches.find(b => b.code === 'PLT' || b.name.includes('Paltan')) || branches[0];
  const brMirpur = branches.find(b => b.code === 'MIR' || b.name.includes('Mirpur')) || branches[1];
  const brCtg = branches.find(b => b.code === 'CTG' || b.name.includes('Chattogram')) || branches[2];
  const brOnline = branches.find(b => b.code === 'ONL' || b.name.includes('Online')) || branches[3];

  const deptMusic = depts.find(d => d.name.includes('Music')) || depts[0];
  const deptDrama = depts.find(d => d.name.includes('Drama') || d.name.includes('Theatre')) || depts[1];
  const deptRecite = depts.find(d => d.name.includes('Recitation')) || depts[2];
  const deptQuran = depts.find(d => d.name.includes('Quran') || d.name.includes('Qiraat')) || depts[3];

  // 1. Central HQ Super Admins (branchId: null)
  await prisma.staff.create({
    data: {
      fullName: 'Ustad Motiur Rahman Mallick',
      email: 'mallick@saimumacademy.org',
      phone: '+880 1970-578220',
      designation: 'Central Director & Chief Mentor',
      role: 'SUPER_ADMIN',
      branchId: null,
      status: 'ACTIVE',
      joiningDate: '1978-01-01',
      notes: 'Central academy leadership and cultural mentor.'
    }
  });

  await prisma.staff.create({
    data: {
      fullName: 'Engr. Tariqul Islam',
      email: 'registrar@saimumacademy.org',
      phone: '+880 1712-345678',
      designation: 'Central Registrar & Executive Director',
      role: 'SUPER_ADMIN',
      branchId: null,
      status: 'ACTIVE',
      joiningDate: '2016-01-15',
      notes: 'Managing central admissions, branch operations, and academy policies.'
    }
  });

  // 2. Paltan Branch Staff
  const noman = await prisma.staff.create({
    data: {
      fullName: 'Ustad Abdullah Al Noman',
      email: 'noman@saimumacademy.org',
      phone: '+880 1711-002233',
      designation: 'Paltan Branch In-Charge & Vocal Faculty Head',
      role: 'STAFF',
      branchId: brPaltan?.id,
      status: 'ACTIVE',
      joiningDate: '2015-03-15',
      notes: 'Conducting and coordinating vocal training and choir batches.'
    }
  });
  if (deptMusic) {
    await prisma.staffDepartmentAssignment.create({
      data: { staffId: noman.id, departmentId: deptMusic.id }
    });
  }

  const asad = await prisma.staff.create({
    data: {
      fullName: 'Qari Muhammad Asadullah',
      email: 'qari.asad@saimumacademy.org',
      phone: '+880 1819-445566',
      designation: 'Quranic Recitation & Tajweed Coordinator',
      role: 'STAFF',
      branchId: brPaltan?.id,
      status: 'ACTIVE',
      joiningDate: '2018-06-01',
      notes: 'Managing Quranic recitation classes and Tajweed training.'
    }
  });
  if (deptQuran) {
    await prisma.staffDepartmentAssignment.create({
      data: { staffId: asad.id, departmentId: deptQuran.id }
    });
  }

  const shams = await prisma.staff.create({
    data: {
      fullName: 'Shamsur Rahman Chowdhury',
      email: 'shams.theatre@saimumacademy.org',
      phone: '+880 1733-889900',
      designation: 'Theatre & Stage Acting Director',
      role: 'STAFF',
      branchId: brPaltan?.id,
      status: 'ACTIVE',
      joiningDate: '2020-02-10',
      notes: 'Directing theatre workshops, drama productions, and stage performance batches.'
    }
  });
  if (deptDrama) {
    await prisma.staffDepartmentAssignment.create({
      data: { staffId: shams.id, departmentId: deptDrama.id }
    });
  }

  // 3. Mirpur Branch Staff
  await prisma.staff.create({
    data: {
      fullName: 'Mahmudul Hasan',
      email: 'mahmud.mirpur@saimumacademy.org',
      phone: '+880 1922-334455',
      designation: 'Mirpur Regional Branch In-Charge',
      role: 'STAFF',
      branchId: brMirpur?.id,
      status: 'ACTIVE',
      joiningDate: '2022-01-10',
      notes: 'Managing Mirpur branch operations and student admissions.'
    }
  });

  const tanvir = await prisma.staff.create({
    data: {
      fullName: 'Kazi Tanvir Ahmed',
      email: 'tanvir.recite@saimumacademy.org',
      phone: '+880 1823-112233',
      designation: 'Recitation & Voice Modulation Trainer',
      role: 'STAFF',
      branchId: brMirpur?.id,
      status: 'ACTIVE',
      joiningDate: '2021-08-01',
      notes: 'Teaching Bengali poetry recitation, pronunciation, and public speaking.'
    }
  });
  if (deptRecite) {
    await prisma.staffDepartmentAssignment.create({
      data: { staffId: tanvir.id, departmentId: deptRecite.id }
    });
  }

  const hafiz = await prisma.staff.create({
    data: {
      fullName: 'Ustad Hafizur Rahman',
      email: 'hafiz.vocal@saimumacademy.org',
      phone: '+880 1744-556677',
      designation: 'Vocal Music & Islamic Song Faculty',
      role: 'STAFF',
      branchId: brMirpur?.id,
      status: 'ACTIVE',
      joiningDate: '2023-03-01',
      notes: 'Taking regular vocal music batches in Mirpur campus.'
    }
  });
  if (deptMusic) {
    await prisma.staffDepartmentAssignment.create({
      data: { staffId: hafiz.id, departmentId: deptMusic.id }
    });
  }

  // 4. Chattogram Branch Staff
  const iftekhar = await prisma.staff.create({
    data: {
      fullName: 'Dr. Iftekharul Alam',
      email: 'ctg.incharge@saimumacademy.org',
      phone: '+880 1811-998877',
      designation: 'Chattogram Divisional Branch In-Charge',
      role: 'STAFF',
      branchId: brCtg?.id,
      status: 'ACTIVE',
      joiningDate: '2022-06-15',
      notes: 'Leading Chattogram zonal operations and cultural workshops.'
    }
  });
  if (deptMusic) {
    await prisma.staffDepartmentAssignment.create({
      data: { staffId: iftekhar.id, departmentId: deptMusic.id }
    });
  }

  // 5. Online Academy Branch Staff
  const saiful = await prisma.staff.create({
    data: {
      fullName: 'Engr. Saiful Islam',
      email: 'online.coordinator@saimumacademy.org',
      phone: '+880 1611-223344',
      designation: 'Virtual Branch & Zoom Class Coordinator',
      role: 'STAFF',
      branchId: brOnline?.id,
      status: 'ACTIVE',
      joiningDate: '2024-01-01',
      notes: 'Managing live Zoom classrooms, international student inquiries, and online evaluations.'
    }
  });
  if (deptRecite) {
    await prisma.staffDepartmentAssignment.create({
      data: { staffId: saiful.id, departmentId: deptRecite.id }
    });
  }
  if (deptQuran) {
    await prisma.staffDepartmentAssignment.create({
      data: { staffId: saiful.id, departmentId: deptQuran.id }
    });
  }

  console.log('✓ Successfully seeded all 10 realistic staff & department assignments!');
}

seedStaff()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
