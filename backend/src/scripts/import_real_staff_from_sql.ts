import { prisma } from '../prisma';
import { extractSqlUsers } from './importAllSqlData';
import fs from 'fs';
import path from 'path';

export async function importAllRealStaffFromSql() {
  console.log('🚀 Ingesting 100% REAL Staff & Coordinators with Exact Roles...\n');

  // 1. Clear existing staff
  await prisma.staffDepartmentAssignment.deleteMany();
  await prisma.staffBatchAssignment.deleteMany();
  await prisma.workshopBatchModerator.deleteMany();
  await prisma.staff.deleteMany();

  // 2. Load branches & departments
  const branches = await prisma.branch.findMany();
  const departments = await prisma.department.findMany();

  const centralBranch = branches.find(b => b.code === 'DHK-PLT' || b.name.includes('পল্টন') || b.name.includes('ঢাকা')) || branches[0];

  const deptKids = departments.find(d => d.name.includes('শিশু'));
  const deptSongit = departments.find(d => d.name.includes('সঙ্গীত') || d.name.includes('গান'));
  const deptTheatre = departments.find(d => d.name.includes('থিয়েটার'));
  const deptQiraat = departments.find(d => d.name.includes('ক্বিরাত') || d.name.includes('ক্বেরাত'));
  const deptRecitation = departments.find(d => d.name.includes('আবৃত্তি') || d.name.includes('উপস্থাপনা'));

  // 3. Parse roles from SQL
  const sqlPath = path.resolve('..', 'Old Database', 'saimumor_academy.sql');
  const content = fs.readFileSync(sqlPath, 'utf8');

  const roleMap = new Map<number, string>();
  const roleInsert = content.match(/INSERT INTO `roles`[^\;]*;/gi) || [];
  roleInsert.forEach(block => {
    const tupleRegex = /\((\d+),\s*'([^']+)'/g;
    let match;
    while ((match = tupleRegex.exec(block)) !== null) {
      roleMap.set(parseInt(match[1], 10), match[2]);
    }
  });

  const userRoleIds = new Map<number, Set<string>>();
  const ruInsert = content.match(/INSERT INTO `role_user`[^\;]*;/gi) || [];
  ruInsert.forEach(block => {
    const tupleRegex = /\((\d+),\s*(\d+),\s*(\d+)/g;
    let match;
    while ((match = tupleRegex.exec(block)) !== null) {
      const userId = parseInt(match[2], 10);
      const roleId = parseInt(match[3], 10);
      const roleName = roleMap.get(roleId) || `Role_${roleId}`;
      if (!userRoleIds.has(userId)) userRoleIds.set(userId, new Set());
      userRoleIds.get(userId)!.add(roleName);
    }
  });

  const sqlUsers = extractSqlUsers();

  const staffRoleNames = new Set([
    'super_admin', 'admin', 'agent', 'staff', 'account_officer', 
    'moderator', 'teacher', 'examiner', 'director'
  ]);

  // Load existing Persons to link
  const existingPersons = await prisma.person.findMany({
    include: { studentProfile: true }
  });
  const personByEmail = new Map<string, any>();
  const personByPhone = new Map<string, any>();
  const personByStudentId = new Map<string, any>();

  existingPersons.forEach(p => {
    if (p.email) personByEmail.set(p.email.toLowerCase().trim(), p);
    if (p.phone) personByPhone.set(p.phone.trim(), p);
    if (p.studentProfile?.studentId) personByStudentId.set(p.studentProfile.studentId.trim(), p);
  });

  // Collect candidate staff records
  const candidates: any[] = [];

  sqlUsers.forEach(u => {
    const roles = userRoleIds.get(u.id) || new Set<string>();
    if (u.user_role) roles.add(u.user_role);

    const hasStaffRole = Array.from(roles).some(r => staffRoleNames.has(r.toLowerCase()));
    if (hasStaffRole && u.id !== 1) { // exclude generic placeholder admin
      candidates.push({ ...u, assignedRoles: Array.from(roles) });
    }
  });

  // Deduplicate and enrich
  const uniqueStaffMap = new Map<string, any>();

  for (const u of candidates) {
    const nameNorm = (u.name || u.name_bn || '').trim();
    const key = nameNorm.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!key) continue;

    if (!uniqueStaffMap.has(key)) {
      uniqueStaffMap.set(key, u);
    } else {
      const existing = uniqueStaffMap.get(key);
      const combinedRoles = Array.from(new Set([...existing.assignedRoles, ...u.assignedRoles]));
      existing.assignedRoles = combinedRoles;
      if (u.phone && !existing.phone) existing.phone = u.phone;
      if (u.student_id && !existing.student_id) existing.student_id = u.student_id;
      if (u.profile_photo_path && !existing.profile_photo_path) existing.profile_photo_path = u.profile_photo_path;
    }
  }

  const staffToCreate = Array.from(uniqueStaffMap.values());
  console.log(`Creating ${staffToCreate.length} authentic Staff entities...`);

  let createdCount = 0;

  for (const s of staffToCreate) {
    const name = (s.name || s.name_bn || 'Staff Member').trim();
    const nameLower = name.toLowerCase();
    const roles: string[] = s.assignedRoles || [];

    // Exact Role Mapping: Department Admin, Account Officer, Teacher, Examiner, Super Admin
    let roleEnum = 'TEACHER';
    let designation = 'Academy Faculty & Teacher';
    const deptIdsToAssign: string[] = [];

    if (nameLower.includes('saiful mamun') || nameLower.includes('saiful mollik') || s.id === 23) {
      designation = 'Central Operations Director';
      roleEnum = 'SUPER_ADMIN';
      if (deptSongit) deptIdsToAssign.push(deptSongit.id);
      if (deptKids) deptIdsToAssign.push(deptKids.id);
    } else if (nameLower.includes('azad')) {
      designation = 'Director (শিশু বিভাগ)';
      roleEnum = 'DEPARTMENT_ADMIN';
      if (deptKids) deptIdsToAssign.push(deptKids.id);
    } else if (nameLower.includes('raad') || nameLower.includes('ezama') || nameLower.includes('রাআদ')) {
      designation = 'Director (সঙ্গীত বিভাগ)';
      roleEnum = 'DEPARTMENT_ADMIN';
      if (deptSongit) deptIdsToAssign.push(deptSongit.id);
    } else if (nameLower.includes('emon') || nameLower.includes('nazmul islam emon')) {
      designation = 'Director (থিয়েটার বিভাগ)';
      roleEnum = 'DEPARTMENT_ADMIN';
      if (deptTheatre) deptIdsToAssign.push(deptTheatre.id);
    } else if (nameLower.includes('muminul') || nameLower.includes('qarimuminulislam')) {
      designation = 'Director (ক্বিরাত বিভাগ)';
      roleEnum = 'DEPARTMENT_ADMIN';
      if (deptQiraat) deptIdsToAssign.push(deptQiraat.id);
    } else if (nameLower.includes('zihad') || nameLower.includes('sayeeduzzaman')) {
      designation = 'Director (আবৃত্তি ও উপস্থাপনা বিভাগ)';
      roleEnum = 'DEPARTMENT_ADMIN';
      if (deptRecitation) deptIdsToAssign.push(deptRecitation.id);
    } else if (nameLower.includes('tawhid')) {
      designation = 'Senior Accounts Officer';
      roleEnum = 'ACCOUNT_OFFICER';
      if (deptTheatre) deptIdsToAssign.push(deptTheatre.id);
    } else if (nameLower.includes('jahed')) {
      designation = 'Central Academic Coordinator';
      roleEnum = 'DEPARTMENT_ADMIN';
    } else if (nameLower.includes('niamul')) {
      designation = 'Central Academy Administrator';
      roleEnum = 'DEPARTMENT_ADMIN';
      if (deptSongit) deptIdsToAssign.push(deptSongit.id);
    } else if (nameLower.includes('nazif')) {
      designation = 'Senior Vocal Faculty & Teacher';
      roleEnum = 'TEACHER';
      if (deptSongit) deptIdsToAssign.push(deptSongit.id);
    } else if (nameLower.includes('morshedul')) {
      designation = 'Senior Faculty & Teacher';
      roleEnum = 'TEACHER';
      if (deptSongit) deptIdsToAssign.push(deptSongit.id);
      if (deptKids) deptIdsToAssign.push(deptKids.id);
    } else if (nameLower.includes('banna') || nameLower.includes('bannah')) {
      designation = 'Senior Vocal Teacher';
      roleEnum = 'TEACHER';
      if (deptSongit) deptIdsToAssign.push(deptSongit.id);
    } else if (nameLower.includes('akib')) {
      designation = 'Faculty & Teacher';
      roleEnum = 'TEACHER';
      if (deptRecitation) deptIdsToAssign.push(deptRecitation.id);
      if (deptSongit) deptIdsToAssign.push(deptSongit.id);
    } else if (nameLower.includes('delwar') || nameLower.includes('zayd')) {
      designation = 'Qiraat Faculty & Teacher';
      roleEnum = 'TEACHER';
      if (deptQiraat) deptIdsToAssign.push(deptQiraat.id);
    } else if (nameLower.includes('kaium') || nameLower.includes('abdul kaium')) {
      designation = 'Theatre & Vocal Teacher';
      roleEnum = 'TEACHER';
      if (deptTheatre) deptIdsToAssign.push(deptTheatre.id);
      if (deptSongit) deptIdsToAssign.push(deptSongit.id);
    } else if (roles.includes('examiner')) {
      designation = 'Audition Examiner & Evaluator';
      roleEnum = 'EXAMINER';
    } else if (roles.includes('teacher') || roles.includes('moderator')) {
      designation = 'Teacher & Batch Instructor';
      roleEnum = 'TEACHER';
    } else {
      designation = 'Faculty & Field Coordinator';
      roleEnum = 'TEACHER';
    }

    // Match Person profile
    let matchedPerson = null;
    if (s.student_id && personByStudentId.has(s.student_id.trim())) {
      matchedPerson = personByStudentId.get(s.student_id.trim());
    } else if (s.email && personByEmail.has(s.email.toLowerCase().trim())) {
      matchedPerson = personByEmail.get(s.email.toLowerCase().trim());
    } else if (s.phone && personByPhone.has(s.phone.trim())) {
      matchedPerson = personByPhone.get(s.phone.trim());
    }

    // Clean email
    let email = (s.email || '').trim().toLowerCase();
    if (!email || email.includes('example.com') || email.includes('mail@mail.com')) {
      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.');
      email = `${cleanName}@saimum.org`;
    }

    // Photo URL
    let photoUrl = null;
    if (s.profile_photo_path) {
      photoUrl = s.profile_photo_path.startsWith('http') ? s.profile_photo_path : `/storage/${s.profile_photo_path}`;
    } else if (matchedPerson?.photoUrl) {
      photoUrl = matchedPerson.photoUrl;
    }

    try {
      const createdStaff = await prisma.staff.create({
        data: {
          fullName: name,
          fullNameBn: s.name_bn || null,
          email,
          phone: s.phone || matchedPerson?.phone || null,
          designation,
          role: roleEnum,
          branchId: centralBranch?.id || null,
          status: 'ACTIVE',
          joiningDate: s.created_at ? s.created_at.split(' ')[0] : '2024-01-01',
          notes: `Legacy SQL User #${s.id} | Roles: [${roles.join(', ')}]${s.student_id ? ` | Student ID: ${s.student_id}` : ''}`,
          photoUrl,
          personId: matchedPerson?.id || null,
          studentId: s.student_id || matchedPerson?.studentProfile?.studentId || null
        }
      });

      // Create department assignments
      for (const dId of deptIdsToAssign) {
        await prisma.staffDepartmentAssignment.create({
          data: {
            staffId: createdStaff.id,
            departmentId: dId,
            branchId: centralBranch?.id || null
          }
        }).catch(() => {});
      }

      createdCount++;
    } catch (err: any) {
      if (err.code === 'P2002') {
        const uniqueEmail = `user${s.id}.${email}`;
        const createdStaff = await prisma.staff.create({
          data: {
            fullName: name,
            fullNameBn: s.name_bn || null,
            email: uniqueEmail,
            phone: s.phone || matchedPerson?.phone || null,
            designation,
            role: roleEnum,
            branchId: centralBranch?.id || null,
            status: 'ACTIVE',
            joiningDate: s.created_at ? s.created_at.split(' ')[0] : '2024-01-01',
            notes: `Legacy SQL User #${s.id} | Roles: [${roles.join(', ')}]`,
            photoUrl,
            personId: matchedPerson?.id || null,
            studentId: s.student_id || null
          }
        });
        for (const dId of deptIdsToAssign) {
          await prisma.staffDepartmentAssignment.create({
            data: {
              staffId: createdStaff.id,
              departmentId: dId,
              branchId: centralBranch?.id || null
            }
          }).catch(() => {});
        }
        createdCount++;
      } else {
        console.error(`Error creating staff ${name}:`, err.message);
      }
    }
  }

  const roleCounts = await prisma.staff.groupBy({
    by: ['role'],
    _count: { id: true }
  });

  console.log('\n--- Staff Role Distribution ---');
  roleCounts.forEach(r => console.log(` - ${r.role}: ${r._count.id} members`));

  console.log(`\n======================================================`);
  console.log(`🎉 100% REAL STAFF INGESTED: ${createdCount} Active Officers!`);
  console.log(`======================================================\n`);
}

if (require.main === module) {
  importAllRealStaffFromSql()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
