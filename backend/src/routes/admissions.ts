import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const admissionsRouter = Router();

// Helper to format Registration response matching frontend interfaces
function formatRegistration(reg: any, departmentsMap: Map<string, string>, subjectsMap: Map<string, string>) {
  const deptName = reg.departmentId ? (departmentsMap.get(reg.departmentId) || null) : null;
  const subName = reg.subjectId ? (subjectsMap.get(reg.subjectId) || null) : null;

  return {
    id: reg.id,
    registrationNo: reg.registrationNo,
    personId: reg.personId,
    sessionId: reg.sessionId,
    sessionTitle: reg.session?.title || '',
    sessionCode: reg.session?.sessionCode || '',
    person: {
      id: reg.person.id,
      fullNameEn: reg.person.fullNameEn,
      fullNameBn: reg.person.fullNameBn || reg.person.fullNameEn,
      phone: reg.person.phone || '',
      email: reg.person.email || '',
      dob: reg.person.dateOfBirth || '',
      gender: reg.person.gender || 'MALE',
      bloodGroup: reg.person.bloodGroup || 'B+',
      nidBirthCert: reg.person.nidBirthCert || '',
      photoUrl: reg.person.photoUrl,
      fatherName: reg.person.fatherName || '',
      fatherPhone: reg.person.fatherPhone || '',
      motherName: reg.person.motherName || '',
      emergencyContact: reg.person.emergencyContactName ? {
        name: reg.person.emergencyContactName,
        relation: reg.person.emergencyContactRelation || 'পিতা',
        phone: reg.person.emergencyContactPhone || reg.person.fatherPhone || ''
      } : {
        name: `${reg.person.fatherName || ''} (পিতা)`,
        relation: 'পিতা',
        phone: reg.person.fatherPhone || reg.person.phone || ''
      },
      presentAddress: {
        division: reg.person.presentAddressDivision || 'Dhaka',
        district: reg.person.presentAddressDistrict || 'Dhaka',
        thana: reg.person.presentAddressThana || '',
        addressLine: reg.person.presentAddressLine || ''
      },
      permanentAddress: {
        division: reg.person.permanentAddressDivision || reg.person.presentAddressDivision || 'Dhaka',
        district: reg.person.permanentAddressDistrict || reg.person.presentAddressDistrict || 'Dhaka',
        thana: reg.person.permanentAddressThana || reg.person.presentAddressThana || '',
        addressLine: reg.person.permanentAddressLine || reg.person.presentAddressLine || ''
      },
      academicInstitution: reg.person.academicInstitution || '',
      currentClass: reg.person.currentClass || '',
      previousCulturalTraining: reg.person.previousCulturalTraining || ''
    },
    branchId: reg.branchId,
    branchName: reg.branch?.name || '',
    branchType: reg.branch?.type || 'PHYSICAL',
    departmentId: reg.departmentId || null,
    departmentName: deptName,
    subjectId: reg.subjectId || null,
    subjectName: subName,
    applicationYear: reg.applicationYear,
    appliedDate: reg.createdAt ? reg.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: reg.status,
    viva: reg.vivaDate ? {
      scheduledDate: reg.vivaDate,
      scheduledTime: reg.vivaTime || '10:00 AM',
      room: reg.vivaRoom || '',
      examinerPanel: reg.vivaExaminer || '',
      score: reg.vivaScore,
      notes: reg.vivaNotes
    } : undefined,
    vivaSchedule: reg.vivaDate ? {
      date: reg.vivaDate,
      time: reg.vivaTime || '10:00 AM',
      room: reg.vivaRoom || '',
      examinerPanel: reg.vivaExaminer || '',
      score: reg.vivaScore,
      notes: reg.vivaNotes
    } : undefined,
    payment: {
      status: reg.paymentStatus,
      amount: reg.paymentAmount,
      method: reg.paymentMethod,
      transactionId: reg.paymentTrxId || '',
      paidAt: reg.paymentDate ? reg.paymentDate.toISOString().split('T')[0] : ''
    },
    history: reg.person.registrations?.map((r: any) => ({
      id: r.id,
      registrationNo: r.registrationNo,
      year: r.applicationYear,
      branchName: r.branch?.name || '',
      subjectId: r.subjectId,
      subjectName: r.subjectId ? (subjectsMap.get(r.subjectId) || 'কোর্স') : 'কোর্স',
      status: r.status,
      vivaDate: r.vivaDate,
      vivaTime: r.vivaTime,
      vivaRoom: r.vivaRoom,
      vivaScore: r.vivaScore
    })) || []
  };
}

// Helper to get lookups map
async function getLookupsMap() {
  const [departments, subjects] = await Promise.all([
    prisma.department.findMany(),
    prisma.subject.findMany()
  ]);
  const deptsMap = new Map<string, string>(departments.map((d: any) => [d.id, d.name]));
  const subsMap = new Map<string, string>(subjects.map((s: any) => [s.id, s.name]));
  return { deptsMap, subsMap };
}

// =============================================================================
// ADMISSION SESSIONS / CIRCULARS API
// =============================================================================

// GET /api/admissions/sessions — List all admission sessions
admissionsRouter.get('/sessions', async (_req: Request, res: Response) => {
  try {
    const sessions = await prisma.admissionSession.findMany({
      include: {
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = sessions.map((s: any) => ({
      id: s.id,
      title: s.title,
      sessionCode: s.sessionCode,
      year: s.year,
      startDate: s.startDate,
      endDate: s.endDate,
      applicationFee: s.applicationFee,
      isActive: s.isActive,
      status: s.status,
      targetBranches: s.targetBranches ? (typeof s.targetBranches === 'string' ? JSON.parse(s.targetBranches) : s.targetBranches) : ['All Branches'],
      targetSubjects: s.targetSubjects ? (typeof s.targetSubjects === 'string' ? JSON.parse(s.targetSubjects) : s.targetSubjects) : [],
      targetBatches: s.targetBatches ? (typeof s.targetBatches === 'string' ? JSON.parse(s.targetBatches) : s.targetBatches) : [],
      regPrefix: s.regPrefix || 'SA-2026-',
      regStartNumber: s.regStartNumber || 1001,
      regCounter: s.regCounter || 0,
      totalApplicants: s._count?.registrations || 0,
      createdAt: s.createdAt ? s.createdAt.toISOString().split('T')[0] : ''
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admissions/sessions — Create new admission session / circular
admissionsRouter.post('/sessions', async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      sessionCode, 
      year, 
      startDate, 
      endDate, 
      applicationFee, 
      isActive,
      targetBranches,
      targetSubjects,
      targetBatches,
      regPrefix,
      regStartNumber
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Session Title is required.' });
    }

    // Auto-generate code if missing
    let code = (sessionCode && sessionCode.trim()) ? sessionCode.trim() : `${year || 2026}-S${Math.floor(10 + Math.random() * 90)}`;

    // Check duplicate sessionCode
    const existing = await prisma.admissionSession.findUnique({ where: { sessionCode: code } });
    if (existing) {
      code = `${code}-${Date.now().toString().slice(-4)}`;
    }

    // Sessions can independently be active simultaneously (branch-wise or central)
    const newSession = await prisma.admissionSession.create({
      data: {
        title: title.trim(),
        sessionCode: code,
        year: Number(year) || 2026,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || '2026-03-31',
        applicationFee: applicationFee ? parseFloat(applicationFee) : 200,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        status: isActive ? 'ACTIVE' : 'UPCOMING',
        targetBranches: Array.isArray(targetBranches) ? JSON.stringify(targetBranches) : (targetBranches || '["All Branches"]'),
        targetSubjects: Array.isArray(targetSubjects) ? JSON.stringify(targetSubjects) : (targetSubjects || '[]'),
        targetBatches: Array.isArray(targetBatches) ? JSON.stringify(targetBatches) : (targetBatches || '[]'),
        regPrefix: (regPrefix && regPrefix.trim()) ? regPrefix.trim() : 'SA-2026-',
        regStartNumber: regStartNumber ? parseInt(regStartNumber) : 1001,
        regCounter: 0
      } as any
    });

    res.status(201).json({ success: true, message: 'Admission session created successfully', data: newSession });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admissions/sessions/:id — Update session details
admissionsRouter.put('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { 
      title, 
      sessionCode, 
      year, 
      startDate, 
      endDate, 
      applicationFee, 
      isActive, 
      status,
      targetBranches,
      targetSubjects,
      targetBatches,
      regPrefix,
      regStartNumber
    } = req.body;

    const updated = await prisma.admissionSession.update({
      where: { id },
      data: {
        title: title ? title.trim() : undefined,
        sessionCode: sessionCode ? sessionCode.trim() : undefined,
        year: year ? Number(year) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        applicationFee: applicationFee ? parseFloat(applicationFee) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        status: status || (isActive !== undefined ? (isActive ? 'ACTIVE' : 'CLOSED') : undefined),
        targetBranches: targetBranches ? (Array.isArray(targetBranches) ? JSON.stringify(targetBranches) : targetBranches) : undefined,
        targetSubjects: targetSubjects ? (Array.isArray(targetSubjects) ? JSON.stringify(targetSubjects) : targetSubjects) : undefined,
        targetBatches: targetBatches ? (Array.isArray(targetBatches) ? JSON.stringify(targetBatches) : targetBatches) : undefined,
        regPrefix: regPrefix ? regPrefix.trim() : undefined,
        regStartNumber: regStartNumber ? parseInt(regStartNumber) : undefined
      } as any
    });

    res.json({ success: true, message: 'Session updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admissions/sessions/:id — Delete a session
admissionsRouter.delete('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const regCount = await prisma.registration.count({ where: { sessionId: id } });
    if (regCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete session because it has ${regCount} associated applicant registrations.`
      });
    }

    await prisma.admissionSession.delete({ where: { id } });
    res.json({ success: true, message: 'Admission session deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admissions/sessions/:id/toggle-active — Toggle active circular
admissionsRouter.patch('/sessions/:id/toggle-active', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const current = await prisma.admissionSession.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const nextState = !current.isActive;

    const updated = await prisma.admissionSession.update({
      where: { id },
      data: {
        isActive: nextState,
        status: nextState ? 'ACTIVE' : 'CLOSED'
      }
    });

    res.json({ success: true, message: `Session is now ${nextState ? 'Active' : 'Closed'}`, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// ADMISSIONS REGISTRATIONS API
// =============================================================================

// 1. GET /api/admissions — Filtered list of registrations
admissionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { status, branchId, search, year, sessionId, vivaDate } = req.query;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = String(status);
    }
    if (branchId && branchId !== 'ALL') {
      where.branchId = String(branchId);
    }
    if (year && year !== 'ALL') {
      where.applicationYear = Number(year);
    }
    if (sessionId && sessionId !== 'ALL') {
      where.sessionId = String(sessionId);
    }
    if (vivaDate && vivaDate !== 'ALL') {
      where.vivaDate = String(vivaDate);
    }

    if (search) {
      const q = String(search).toLowerCase();
      where.OR = [
        { registrationNo: { contains: q } },
        { person: { fullNameEn: { contains: q } } },
        { person: { fullNameBn: { contains: q } } },
        { person: { phone: { contains: q } } }
      ];
    }

    const [registrations, { deptsMap, subsMap }] = await Promise.all([
      prisma.registration.findMany({
        where,
        include: {
          person: {
            include: {
              registrations: {
                include: { branch: true, session: true }
              }
            }
          },
          branch: true,
          session: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      getLookupsMap()
    ]);

    const formatted = registrations.map(r => formatRegistration(r, deptsMap, subsMap));
    res.json({ success: true, data: formatted, total: formatted.length });
  } catch (error: any) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET /api/admissions/:id — Single registration with full lifetime history
admissionsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const [reg, { deptsMap, subsMap }] = await Promise.all([
      prisma.registration.findUnique({
        where: { id },
        include: {
          person: {
            include: {
              registrations: {
                include: { branch: true, session: true }
              }
            }
          },
          branch: true,
          session: true
        }
      }),
      getLookupsMap()
    ]);

    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration record not found' });
    }

    res.json({ success: true, data: formatRegistration(reg, deptsMap, subsMap) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const BANGLA_NUMERALS: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

function convertBanglaToEnglishDigits(str: string): string {
  return str.replace(/[০-৯]/g, match => BANGLA_NUMERALS[match] || match);
}

// Helper to normalize Bangladeshi phone numbers (e.g. +88017..., 88017..., ০১৭...) to standard 11 digits
function normalizePhone(raw: string | undefined | null): string {
  if (!raw) return '';
  let str = convertBanglaToEnglishDigits(String(raw).trim());
  let digits = str.replace(/[^0-9]/g, '');
  if (digits.startsWith('880')) {
    // 88017XXXXXXXX (13 digits) -> slice 2 leaves '017XXXXXXXX' (11 digits)
    digits = digits.slice(2);
  }
  if (digits.startsWith('00')) {
    digits = digits.slice(1);
  }
  if (digits.length === 10 && digits.startsWith('1')) {
    digits = '0' + digits;
  }
  return digits;
}

// Helper to extract person details from both nested { person: {...} } and flat { fullNameEn, phone, ... } payloads
function extractPersonData(body: any): any {
  const p = body.person || {};
  return {
    fullNameEn: p.fullNameEn || body.fullNameEn || body.name || body.studentName || '',
    fullNameBn: p.fullNameBn || body.fullNameBn || '',
    phone: p.phone || body.phone || body.phoneNumber || body.mobile || '',
    email: p.email || body.email || '',
    dob: p.dob || p.dateOfBirth || body.dob || body.dateOfBirth || '',
    gender: p.gender || body.gender || 'MALE',
    bloodGroup: p.bloodGroup || body.bloodGroup || 'B+',
    nidBirthCert: p.nidBirthCert || body.nidBirthCert || body.nid || '',
    fatherName: p.fatherName || body.fatherName || '',
    fatherPhone: p.fatherPhone || body.fatherPhone || '',
    motherName: p.motherName || body.motherName || '',
    emergencyContact: p.emergencyContact || body.emergencyContact,
    emergencyName: p.emergencyName || body.emergencyName,
    emergencyRelation: p.emergencyRelation || body.emergencyRelation,
    emergencyPhone: p.emergencyPhone || body.emergencyPhone,
    presentAddress: p.presentAddress || body.presentAddress,
    permanentAddress: p.permanentAddress || body.permanentAddress,
    academicInstitution: p.academicInstitution || body.academicInstitution || '',
    currentClass: p.currentClass || body.currentClass || '',
    previousCulturalTraining: p.previousCulturalTraining || body.previousCulturalTraining || ''
  };
}

// 3. POST /api/admissions — New Walk-in / Online Admission Registration
admissionsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const personData = extractPersonData(body);

    const cleanPhone = normalizePhone(personData.phone);
    const cleanNid = personData.nidBirthCert ? personData.nidBirthCert.trim() : '';

    // Check if Person already exists by Phone, NID or Name + Father + DOB
    let existingPerson = null;
    if (cleanPhone) {
      existingPerson = await prisma.person.findFirst({ where: { phone: cleanPhone } });
    }

    if (!existingPerson && cleanNid) {
      existingPerson = await prisma.person.findFirst({ where: { nidBirthCert: cleanNid } });
    }

    if (!existingPerson && personData.fullNameEn && personData.fatherName && personData.dob) {
      existingPerson = await prisma.person.findFirst({
        where: {
          fullNameEn: personData.fullNameEn.trim(),
          fatherName: personData.fatherName.trim(),
          dateOfBirth: personData.dob
        }
      });
    }

    let personId: string;

    const emergencyName = personData.emergencyContact?.name || personData.emergencyName || (personData.fatherName ? `${personData.fatherName} (পিতা)` : '');
    const emergencyRelation = personData.emergencyContact?.relation || personData.emergencyRelation || 'পিতা';
    const emergencyPhone = personData.emergencyContact?.phone || personData.emergencyPhone || personData.fatherPhone || cleanPhone;

    if (existingPerson) {
      personId = existingPerson.id;
      await prisma.person.update({
        where: { id: personId },
        data: {
          fullNameEn: personData.fullNameEn !== undefined && personData.fullNameEn !== '' ? personData.fullNameEn : existingPerson.fullNameEn,
          fullNameBn: personData.fullNameBn !== undefined && personData.fullNameBn !== '' ? personData.fullNameBn : existingPerson.fullNameBn,
          email: personData.email !== undefined ? personData.email : existingPerson.email,
          dateOfBirth: personData.dob !== undefined ? personData.dob : existingPerson.dateOfBirth,
          gender: personData.gender !== undefined && personData.gender !== '' ? personData.gender : existingPerson.gender,
          bloodGroup: personData.bloodGroup !== undefined && personData.bloodGroup !== '' ? personData.bloodGroup : existingPerson.bloodGroup,
          fatherName: personData.fatherName !== undefined ? personData.fatherName : existingPerson.fatherName,
          fatherPhone: personData.fatherPhone !== undefined ? personData.fatherPhone : existingPerson.fatherPhone,
          motherName: personData.motherName !== undefined ? personData.motherName : existingPerson.motherName,
          emergencyContactName: emergencyName !== undefined ? emergencyName : existingPerson.emergencyContactName,
          emergencyContactRelation: emergencyRelation !== undefined ? emergencyRelation : existingPerson.emergencyContactRelation,
          emergencyContactPhone: emergencyPhone !== undefined ? emergencyPhone : existingPerson.emergencyContactPhone,
          presentAddressDivision: personData.presentAddress?.division !== undefined ? personData.presentAddress.division : existingPerson.presentAddressDivision,
          presentAddressDistrict: personData.presentAddress?.district !== undefined ? personData.presentAddress.district : existingPerson.presentAddressDistrict,
          presentAddressThana: personData.presentAddress?.thana !== undefined ? personData.presentAddress.thana : existingPerson.presentAddressThana,
          presentAddressLine: personData.presentAddress?.addressLine !== undefined ? personData.presentAddress.addressLine : existingPerson.presentAddressLine,
          permanentAddressDivision: personData.permanentAddress?.division !== undefined ? personData.permanentAddress.division : existingPerson.permanentAddressDivision,
          permanentAddressDistrict: personData.permanentAddress?.district !== undefined ? personData.permanentAddress.district : existingPerson.permanentAddressDistrict,
          permanentAddressThana: personData.permanentAddress?.thana !== undefined ? personData.permanentAddress.thana : existingPerson.permanentAddressThana,
          permanentAddressLine: personData.permanentAddress?.addressLine !== undefined ? personData.permanentAddress.addressLine : existingPerson.permanentAddressLine,
          academicInstitution: personData.academicInstitution !== undefined ? personData.academicInstitution : existingPerson.academicInstitution,
          currentClass: personData.currentClass !== undefined ? personData.currentClass : existingPerson.currentClass,
          previousCulturalTraining: personData.previousCulturalTraining !== undefined ? personData.previousCulturalTraining : existingPerson.previousCulturalTraining
        }
      });
    } else {
      const createdPerson = await prisma.person.create({
        data: {
          fullNameEn: personData.fullNameEn,
          fullNameBn: personData.fullNameBn || personData.fullNameEn,
          phone: cleanPhone || null,
          email: personData.email || null,
          dateOfBirth: personData.dob || null,
          gender: personData.gender || 'MALE',
          bloodGroup: personData.bloodGroup || 'B+',
          nidBirthCert: cleanNid || null,
          fatherName: personData.fatherName || null,
          fatherPhone: personData.fatherPhone || null,
          motherName: personData.motherName || null,
          emergencyContactName: emergencyName || null,
          emergencyContactRelation: emergencyRelation || 'পিতা',
          emergencyContactPhone: emergencyPhone || null,
          presentAddressDivision: personData.presentAddress?.division || 'Dhaka',
          presentAddressDistrict: personData.presentAddress?.district || 'Dhaka',
          presentAddressThana: personData.presentAddress?.thana || '',
          presentAddressLine: personData.presentAddress?.addressLine || '',
          permanentAddressDivision: personData.permanentAddress?.division || personData.presentAddress?.division || 'Dhaka',
          permanentAddressDistrict: personData.permanentAddress?.district || personData.presentAddress?.district || 'Dhaka',
          permanentAddressThana: personData.permanentAddress?.thana || personData.presentAddress?.thana || '',
          permanentAddressLine: personData.permanentAddress?.addressLine || personData.presentAddress?.addressLine || '',
          academicInstitution: personData.academicInstitution || null,
          currentClass: personData.currentClass || null,
          previousCulturalTraining: personData.previousCulturalTraining || null
        }
      });
      personId = createdPerson.id;
    }

    // Resolve Branch ID
    let targetBranch = null;
    if (body.branchId) {
      targetBranch = await prisma.branch.findUnique({ where: { id: body.branchId } });
    }
    if (!targetBranch && (body.branchName || body.branch)) {
      targetBranch = await prisma.branch.findFirst({
        where: { name: { contains: body.branchName || body.branch } }
      });
    }
    if (!targetBranch) {
      targetBranch = await prisma.branch.findFirst();
    }

    // Resolve Department & Subject
    let deptId = body.departmentId;
    let subjId = body.subjectId;

    if (!deptId && body.departmentName) {
      const d = await prisma.department.findFirst({ where: { name: { contains: body.departmentName } } });
      if (d) deptId = d.id;
    }
    if (!subjId && (body.subjectName || body.subject)) {
      const s = await prisma.subject.findFirst({ where: { name: { contains: body.subjectName || body.subject } } });
      if (s) subjId = s.id;
    }

    // Resolve Active Admission Session
    let activeSession = null;
    if (body.sessionId) {
      activeSession = await prisma.admissionSession.findUnique({ where: { id: body.sessionId } });
    }
    if (!activeSession) {
      activeSession = await prisma.admissionSession.findFirst({ where: { isActive: true } });
    }

    // Validate Department & Subject exist if provided
    if (deptId) {
      const deptExists = await prisma.department.findUnique({ where: { id: deptId } });
      if (!deptExists) {
        return res.status(400).json({ success: false, message: `Department with ID '${deptId}' not found.` });
      }
    }
    if (subjId) {
      const subjExists = await prisma.subject.findUnique({ where: { id: subjId } });
      if (!subjExists) {
        return res.status(400).json({ success: false, message: `Subject with ID '${subjId}' not found.` });
      }
    }

    // Generate dynamic Registration Number inside a transaction to prevent race conditions
    let regNo = '';
    if (activeSession) {
      const sessionData = activeSession as any;
      // Atomic increment inside transaction — prevents two concurrent requests from reading the same counter
      const updatedSession = await prisma.admissionSession.update({
        where: { id: sessionData.id },
        data: { regCounter: { increment: 1 } } as any
      });
      const prefix = sessionData.regPrefix || 'SA-2026-';
      const startNum = sessionData.regStartNumber || 1001;
      // updatedSession.regCounter is the value AFTER increment, so subtract 1 for current sequence
      const nextNum = startNum + ((updatedSession as any).regCounter - 1);
      regNo = `${prefix}${nextNum}`;
    } else {
      const totalRegs = await prisma.registration.count();
      regNo = `SA-2026-${1000 + totalRegs + 1}`;
    }

    const customAnswersStr = body.customAnswers ? (typeof body.customAnswers === 'string' ? body.customAnswers : JSON.stringify(body.customAnswers)) : null;

    // Create Registration
    const newReg = await prisma.registration.create({
      data: {
        registrationNo: regNo,
        personId,
        sessionId: activeSession?.id || null,
        branchId: targetBranch!.id,
        departmentId: deptId || null,
        subjectId: subjId || null,
        applicationYear: activeSession?.year || 2026,
        status: 'PENDING_VIVA',
        paymentStatus: 'PAID',
        paymentAmount: body.payment?.amount || activeSession?.applicationFee || 200,
        paymentMethod: body.payment?.method || 'Cash / Desk',
        paymentTrxId: body.payment?.transactionId || `TXN-${Date.now()}`,
        customAnswers: customAnswersStr
      },
      include: {
        person: {
          include: {
            registrations: {
              include: { branch: true, session: true }
            }
          }
        },
        branch: true,
        session: true
      }
    });

    const { deptsMap, subsMap } = await getLookupsMap();

    res.status(201).json({
      success: true,
      message: 'Admission registration created successfully',
      data: formatRegistration(newReg, deptsMap, subsMap)
    });
  } catch (error: any) {
    console.error('Error creating admission:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. PUT /api/admissions/:id — Update applicant details
admissionsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const body = req.body;
    const personData = body.person;

    const existingReg = await prisma.registration.findUnique({
      where: { id },
      include: { person: true }
    });

    if (!existingReg) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (personData) {
      const emergencyName = personData.emergencyContact?.name || personData.emergencyName;
      const emergencyRelation = personData.emergencyContact?.relation || personData.emergencyRelation;
      const emergencyPhone = personData.emergencyContact?.phone || personData.emergencyPhone;

      await prisma.person.update({
        where: { id: existingReg.personId },
        data: {
          fullNameEn: personData.fullNameEn !== undefined && personData.fullNameEn !== '' ? personData.fullNameEn : existingReg.person.fullNameEn,
          fullNameBn: personData.fullNameBn !== undefined && personData.fullNameBn !== '' ? personData.fullNameBn : existingReg.person.fullNameBn,
          phone: personData.phone !== undefined ? personData.phone : existingReg.person.phone,
          email: personData.email !== undefined ? personData.email : existingReg.person.email,
          dateOfBirth: personData.dob !== undefined ? personData.dob : existingReg.person.dateOfBirth,
          gender: personData.gender !== undefined && personData.gender !== '' ? personData.gender : existingReg.person.gender,
          bloodGroup: personData.bloodGroup !== undefined && personData.bloodGroup !== '' ? personData.bloodGroup : existingReg.person.bloodGroup,
          nidBirthCert: personData.nidBirthCert !== undefined ? personData.nidBirthCert : existingReg.person.nidBirthCert,
          fatherName: personData.fatherName !== undefined ? personData.fatherName : existingReg.person.fatherName,
          fatherPhone: personData.fatherPhone !== undefined ? personData.fatherPhone : existingReg.person.fatherPhone,
          motherName: personData.motherName !== undefined ? personData.motherName : existingReg.person.motherName,
          emergencyContactName: emergencyName !== undefined ? emergencyName : existingReg.person.emergencyContactName,
          emergencyContactRelation: emergencyRelation !== undefined ? emergencyRelation : existingReg.person.emergencyContactRelation,
          emergencyContactPhone: emergencyPhone !== undefined ? emergencyPhone : existingReg.person.emergencyContactPhone,
          presentAddressDivision: personData.presentAddress?.division !== undefined ? personData.presentAddress.division : existingReg.person.presentAddressDivision,
          presentAddressDistrict: personData.presentAddress?.district !== undefined ? personData.presentAddress.district : existingReg.person.presentAddressDistrict,
          presentAddressThana: personData.presentAddress?.thana !== undefined ? personData.presentAddress.thana : existingReg.person.presentAddressThana,
          presentAddressLine: personData.presentAddress?.addressLine !== undefined ? personData.presentAddress.addressLine : existingReg.person.presentAddressLine,
          permanentAddressDivision: personData.permanentAddress?.division !== undefined ? personData.permanentAddress.division : existingReg.person.permanentAddressDivision,
          permanentAddressDistrict: personData.permanentAddress?.district !== undefined ? personData.permanentAddress.district : existingReg.person.permanentAddressDistrict,
          permanentAddressThana: personData.permanentAddress?.thana !== undefined ? personData.permanentAddress.thana : existingReg.person.permanentAddressThana,
          permanentAddressLine: personData.permanentAddress?.addressLine !== undefined ? personData.permanentAddress.addressLine : existingReg.person.permanentAddressLine,
          academicInstitution: personData.academicInstitution !== undefined ? personData.academicInstitution : existingReg.person.academicInstitution,
          currentClass: personData.currentClass !== undefined ? personData.currentClass : existingReg.person.currentClass,
          previousCulturalTraining: personData.previousCulturalTraining !== undefined ? personData.previousCulturalTraining : existingReg.person.previousCulturalTraining
        }
      });
    }

    const [updatedReg, { deptsMap, subsMap }] = await Promise.all([
      prisma.registration.findUnique({
        where: { id },
        include: {
          person: {
            include: {
              registrations: {
                include: { branch: true, session: true }
              }
            }
          },
          branch: true,
          session: true
        }
      }),
      getLookupsMap()
    ]);

    res.json({
      success: true,
      message: 'Admission details updated successfully',
      data: formatRegistration(updatedReg!, deptsMap, subsMap)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. POST /api/admissions/:id/schedule-viva — Schedule Viva exam for single candidate
admissionsRouter.post('/:id/schedule-viva', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { vivaDate, vivaTime, room, examinerPanel } = req.body;

    const updated = await prisma.registration.update({
      where: { id },
      data: {
        status: 'VIVA_SCHEDULED',
        vivaDate,
        vivaTime,
        vivaRoom: room,
        vivaExaminer: examinerPanel
      },
      include: {
        person: {
          include: {
            registrations: {
              include: { branch: true, session: true }
            }
          }
        },
        branch: true,
        session: true
      }
    });

    const { deptsMap, subsMap } = await getLookupsMap();

    res.json({
      success: true,
      message: 'Viva scheduled successfully',
      data: formatRegistration(updated, deptsMap, subsMap)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5b. POST /api/admissions/bulk-schedule-viva — Schedule Viva exam for multiple candidates
admissionsRouter.post('/bulk-schedule-viva', async (req: Request, res: Response) => {
  try {
    const { registrationIds, vivaDate, vivaTime, room, examinerPanel } = req.body;

    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of registrationIds.' });
    }

    if (!vivaDate) {
      return res.status(400).json({ success: false, message: 'Viva date is required.' });
    }

    // Bulk update in Prisma
    await prisma.registration.updateMany({
      where: { id: { in: registrationIds } },
      data: {
        status: 'VIVA_SCHEDULED',
        vivaDate,
        vivaTime: vivaTime || '10:00 AM',
        vivaRoom: room || 'Dhaka Central Academy Room 102',
        vivaExaminer: examinerPanel || 'Ustadh Mahbubur Rahman'
      }
    });

    res.json({
      success: true,
      message: `Successfully scheduled viva for ${registrationIds.length} candidates on ${vivaDate}.`,
      count: registrationIds.length
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5c. POST /api/admissions/bulk-update-status — Bulk Select / Reject / Move to Workshop
admissionsRouter.post('/bulk-update-status', async (req: Request, res: Response) => {
  try {
    const { registrationIds, status, vivaScore, vivaNotes } = req.body;

    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of registrationIds.' });
    }

    const dataToUpdate: any = { status };
    if (vivaScore !== undefined) dataToUpdate.vivaScore = parseFloat(vivaScore);
    if (vivaNotes !== undefined) dataToUpdate.vivaNotes = vivaNotes;

    await prisma.registration.updateMany({
      where: { id: { in: registrationIds } },
      data: dataToUpdate
    });

    res.json({
      success: true,
      message: `Successfully updated status to ${status} for ${registrationIds.length} candidates.`,
      count: registrationIds.length
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. PATCH /api/admissions/:id/status — Pass/Select or Reject for single candidate
admissionsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, vivaScore, vivaNotes } = req.body;

    const dataToUpdate: any = { status };
    if (vivaScore !== undefined) dataToUpdate.vivaScore = parseFloat(vivaScore);
    if (vivaNotes !== undefined) dataToUpdate.vivaNotes = vivaNotes;

    const updated = await prisma.registration.update({
      where: { id },
      data: dataToUpdate,
      include: {
        person: {
          include: {
            registrations: {
              include: { branch: true, session: true }
            }
          }
        },
        branch: true,
        session: true
      }
    });

    const { deptsMap, subsMap } = await getLookupsMap();

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: formatRegistration(updated, deptsMap, subsMap)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. POST /api/admissions/:id/viva-evaluation — Multi-Subject Viva Board Evaluation
admissionsRouter.post('/:id/viva-evaluation', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { examiner, overallNotes, passedSubjectIds, evaluations } = req.body;

    const currentReg = await prisma.registration.findUnique({
      where: { id },
      include: { person: true, session: true, branch: true }
    });

    if (!currentReg) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    const passedIds: string[] = Array.isArray(passedSubjectIds) ? passedSubjectIds : [];
    const isPrimaryPassed = currentReg.subjectId ? passedIds.includes(currentReg.subjectId) : passedIds.length > 0;
    const primaryStatus = passedIds.length > 0 ? 'SELECTED' : 'REJECTED';

    // Primary score
    const primaryEval = evaluations?.find((e: any) => e.subjectId === currentReg.subjectId);
    const vivaScore = primaryEval?.score || (evaluations?.[0]?.score ? evaluations[0].score : null);

    const notesPayload = JSON.stringify({
      overallNotes: overallNotes || '',
      examiner: examiner || 'Ustadh Mahbubur Rahman',
      evaluations: evaluations || [],
      passedSubjectIds: passedIds
    });

    // Update primary registration
    const updatedPrimary = await prisma.registration.update({
      where: { id },
      data: {
        status: primaryStatus,
        vivaExaminer: examiner || 'Ustadh Mahbubur Rahman',
        vivaScore: vivaScore ? parseFloat(vivaScore) : null,
        vivaNotes: notesPayload
      },
      include: {
        person: {
          include: {
            registrations: {
              include: { branch: true, session: true }
            }
          }
        },
        branch: true,
        session: true
      }
    });

    // For any additional passed subjects, ensure active registration exists
    for (const subId of passedIds) {
      if (subId !== currentReg.subjectId) {
        const existingSubReg = await prisma.registration.findFirst({
          where: {
            personId: currentReg.personId,
            subjectId: subId,
            sessionId: currentReg.sessionId
          }
        });

        if (!existingSubReg) {
          // Resolve Department for this subject
          const subjectObj = await prisma.subject.findUnique({ where: { id: subId } });
          const deptBranch = await prisma.branchSubject.findFirst({
            where: { branchId: currentReg.branchId, subjectId: subId },
            include: { departmentBranch: true }
          });

          // Generate reg number
          let nextRegNo = '';
          if (currentReg.session) {
            const sess = currentReg.session as any;
            const updatedSess = await prisma.admissionSession.update({
              where: { id: sess.id },
              data: { regCounter: { increment: 1 } } as any
            });
            const prefix = sess.regPrefix || 'SA-2026-';
            const startNum = sess.regStartNumber || 1001;
            const nextNum = startNum + ((updatedSess as any).regCounter - 1);
            nextRegNo = `${prefix}${nextNum}`;
          } else {
            const count = await prisma.registration.count();
            nextRegNo = `SA-2026-${1000 + count + 1}`;
          }

          const subEval = evaluations?.find((e: any) => e.subjectId === subId);

          await prisma.registration.create({
            data: {
              registrationNo: nextRegNo,
              personId: currentReg.personId,
              sessionId: currentReg.sessionId,
              branchId: currentReg.branchId,
              departmentId: deptBranch?.departmentBranch?.departmentId || null,
              subjectId: subId,
              applicationYear: currentReg.applicationYear,
              status: 'SELECTED',
              vivaDate: currentReg.vivaDate,
              vivaTime: currentReg.vivaTime,
              vivaRoom: currentReg.vivaRoom,
              vivaExaminer: examiner || 'Ustadh Mahbubur Rahman',
              vivaScore: subEval?.score ? parseFloat(subEval.score) : null,
              vivaNotes: notesPayload,
              paymentStatus: 'PAID',
              paymentAmount: 0,
              paymentMethod: 'Viva Multi-Subject Pass'
            }
          });
        } else if (existingSubReg.status !== 'SELECTED' && existingSubReg.status !== 'REGULAR_STUDENT') {
          await prisma.registration.update({
            where: { id: existingSubReg.id },
            data: {
              status: 'SELECTED',
              vivaExaminer: examiner || 'Ustadh Mahbubur Rahman',
              vivaNotes: notesPayload
            }
          });
        }
      }
    }

    const { deptsMap, subsMap } = await getLookupsMap();

    res.json({
      success: true,
      message: `Viva evaluation submitted. Qualified in ${passedIds.length} subject(s).`,
      data: formatRegistration(updatedPrimary, deptsMap, subsMap)
    });
  } catch (error: any) {
    console.error('Failed to process viva evaluation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. DELETE /api/admissions/:id — Delete applicant record
admissionsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.registration.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Applicant registration not found.' });
    }

    await prisma.registration.delete({ where: { id } });
    res.json({ success: true, message: 'Applicant registration successfully deleted.' });
  } catch (error: any) {
    console.error('Failed to delete applicant registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

