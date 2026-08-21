import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const academicRouter = Router();

// =============================================================================
// BRANCHES, DEPARTMENTS & MASTER SUBJECTS
// =============================================================================

// GET /api/academic/branches
academicRouter.get('/branches', async (_req: Request, res: Response) => {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        departments: {
          include: { department: true }
        },
        staff: {
          select: { id: true, fullName: true, phone: true, role: true, designation: true, status: true }
        },
        _count: {
          select: { registrations: true, subjects: true, workshopBatches: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: branches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/academic/branches — Create branch with active departments
academicRouter.post('/branches', async (req: Request, res: Response) => {
  try {
    const { name, code, type, status, departmentIds } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Branch name is required' });
    }

    const branch = await prisma.branch.create({
      data: {
        name: name.trim(),
        code: code ? code.trim() : null,
        type: type || 'PHYSICAL',
        status: status || 'ACTIVE'
      }
    });

    // Link initial departments if provided
    if (Array.isArray(departmentIds) && departmentIds.length > 0) {
      for (const deptId of departmentIds) {
        await prisma.departmentBranch.create({
          data: { branchId: branch.id, departmentId: deptId }
        }).catch(() => {});
      }
    }

    const createdBranch = await prisma.branch.findUnique({
      where: { id: branch.id },
      include: {
        departments: { include: { department: true } },
        staff: true
      }
    });

    res.status(201).json({ success: true, message: 'Branch created successfully', data: createdBranch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/academic/branches/:id — Update branch and synchronize active departments
academicRouter.put('/branches/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, code, type, status, departmentIds } = req.body;

    await prisma.branch.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        code: code !== undefined ? (code ? code.trim() : null) : undefined,
        type: type !== undefined ? type : undefined,
        status: status !== undefined ? status : undefined
      }
    });

    // Synchronize active departments if departmentIds array is supplied
    if (Array.isArray(departmentIds)) {
      // 1. Delete relations not in departmentIds
      await prisma.departmentBranch.deleteMany({
        where: {
          branchId: id,
          departmentId: { notIn: departmentIds }
        }
      });

      // 2. Create missing relations
      for (const deptId of departmentIds) {
        await prisma.departmentBranch.upsert({
          where: {
            branchId_departmentId: {
              branchId: id,
              departmentId: deptId
            }
          },
          create: {
            branchId: id,
            departmentId: deptId
          },
          update: {}
        }).catch(() => {});
      }
    }

    const updated = await prisma.branch.findUnique({
      where: { id },
      include: {
        departments: { include: { department: true } },
        staff: true
      }
    });

    res.json({ success: true, message: 'Branch updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/academic/branches/:id — Delete branch
academicRouter.delete('/branches/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const regCount = await prisma.registration.count({ where: { branchId: id } });
    if (regCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete branch with ${regCount} linked applicant registrations.`
      });
    }

    await prisma.branch.delete({ where: { id } });
    res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/academic/departments
academicRouter.get('/departments', async (_req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        branches: {
          include: { branch: true }
        },
        assignedStaff: {
          include: {
            staff: {
              select: { id: true, fullName: true, phone: true, role: true, designation: true, branchId: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const formatted = departments.map(d => ({
      id: d.id,
      name: d.name,
      status: d.status,
      branchCount: d.branches.length,
      branches: d.branches.map(b => ({ id: b.branch.id, name: b.branch.name, code: b.branch.code, type: b.branch.type })),
      staffCount: d.assignedStaff.length,
      faculty: d.assignedStaff.map(as => ({
        id: as.staff.id,
        fullName: as.staff.fullName,
        phone: as.staff.phone,
        role: as.staff.role,
        designation: as.staff.designation,
        branchId: as.branchId || as.staff.branchId
      }))
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/academic/departments — Create department with branches
academicRouter.post('/departments', async (req: Request, res: Response) => {
  try {
    const { name, status, branchIds } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const dept = await prisma.department.create({
      data: {
        name: name.trim(),
        status: status || 'ACTIVE'
      }
    });

    // Link initial branches if provided
    if (Array.isArray(branchIds) && branchIds.length > 0) {
      for (const bId of branchIds) {
        await prisma.departmentBranch.create({
          data: { departmentId: dept.id, branchId: bId }
        }).catch(() => {});
      }
    }

    const created = await prisma.department.findUnique({
      where: { id: dept.id },
      include: {
        branches: { include: { branch: true } },
        assignedStaff: { include: { staff: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: {
        id: created?.id,
        name: created?.name,
        status: created?.status,
        branchCount: created?.branches.length || 0,
        branches: created?.branches.map(b => ({ id: b.branch.id, name: b.branch.name })) || [],
        faculty: created?.assignedStaff.map(as => ({ id: as.staff.id, fullName: as.staff.fullName })) || []
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/academic/departments/:id — Update department and synchronize active branches
academicRouter.put('/departments/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, status, branchIds } = req.body;

    await prisma.department.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        status: status !== undefined ? status : undefined
      }
    });

    // Synchronize active branches if branchIds is supplied
    if (Array.isArray(branchIds)) {
      // 1. Delete relations not in branchIds
      await prisma.departmentBranch.deleteMany({
        where: {
          departmentId: id,
          branchId: { notIn: branchIds }
        }
      });

      // 2. Create missing relations
      for (const bId of branchIds) {
        await prisma.departmentBranch.upsert({
          where: {
            branchId_departmentId: {
              branchId: bId,
              departmentId: id
            }
          },
          create: {
            branchId: bId,
            departmentId: id
          },
          update: {}
        }).catch(() => {});
      }
    }

    const updated = await prisma.department.findUnique({
      where: { id },
      include: {
        branches: { include: { branch: true } },
        assignedStaff: { include: { staff: true } }
      }
    });

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: {
        id: updated?.id,
        name: updated?.name,
        status: updated?.status,
        branchCount: updated?.branches.length || 0,
        branches: updated?.branches.map(b => ({ id: b.branch.id, name: b.branch.name })) || [],
        faculty: updated?.assignedStaff.map(as => ({ id: as.staff.id, fullName: as.staff.fullName })) || []
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/academic/departments/:id — Delete department
academicRouter.delete('/departments/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.department.delete({ where: { id } });
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/academic/subjects
academicRouter.get('/subjects', async (_req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: subjects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/academic/subjects — Create subject
academicRouter.post('/subjects', async (req: Request, res: Response) => {
  try {
    const { name, code, status } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required' });
    }

    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        code: code ? code.trim() : null,
        status: status || 'ACTIVE'
      }
    });

    res.status(201).json({ success: true, message: 'Subject created successfully', data: subject });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/academic/subjects/:id — Update subject
academicRouter.put('/subjects/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, code, status } = req.body;

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        code: code !== undefined ? (code ? code.trim() : null) : undefined,
        status: status !== undefined ? status : undefined
      }
    });

    res.json({ success: true, message: 'Subject updated successfully', data: subject });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/academic/subjects/:id — Delete subject
academicRouter.delete('/subjects/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.subject.delete({ where: { id } });
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// STUDENTS DIRECTORY API
// =============================================================================

// GET /api/academic/students — List all enrolled students
academicRouter.get('/students', async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    const where: any = {
      person: {
        staffProfile: null
      }
    };

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      where.AND = [
        { person: { staffProfile: null } },
        {
          OR: [
            { studentId: { contains: q } },
            { person: { fullNameEn: { contains: q } } },
            { person: { fullNameBn: { contains: q } } },
            { person: { phone: { contains: q } } }
          ]
        }
      ];
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        person: true,
        batchMemberships: {
          include: {
            batch: {
              include: {
                branchSubject: {
                  include: { branch: true, subject: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = students.map(s => ({
      id: s.id,
      studentId: s.studentId,
      fullName: s.person.fullNameEn,
      fullNameBn: s.person.fullNameBn,
      phone: s.person.phone || '',
      email: s.person.email || '',
      gender: s.person.gender,
      bloodGroup: s.person.bloodGroup,
      photoUrl: s.person.photoUrl,
      status: s.status,
      personId: s.personId,
      enrolledBatches: s.batchMemberships.map(bm => ({
        batchId: bm.batchId,
        batchName: bm.batch.name,
        branchName: bm.batch.branchSubject.branch.name,
        subjectName: bm.batch.branchSubject.subject.name,
        joinedAt: bm.joinedAt.toISOString().split('T')[0]
      }))
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/academic/students — Register new student
academicRouter.post('/students', async (req: Request, res: Response) => {
  try {
    const { fullName, phone, email, status } = req.body;
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Student full name is required' });
    }

    // Create Person
    const person = await prisma.person.create({
      data: {
        fullNameEn: fullName.trim(),
        fullNameBn: fullName.trim(),
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        gender: 'MALE',
        bloodGroup: 'B+'
      }
    });

    // Auto-generate student ID: SA-26001, SA-26002 ...
    const totalStudents = await prisma.student.count();
    const studentSeq = String(totalStudents + 1).padStart(4, '0');
    const studentId = `SA-${new Date().getFullYear().toString().slice(-2)}${studentSeq}`;

    const newStudent = await prisma.student.create({
      data: {
        studentId,
        personId: person.id,
        status: status || 'ACTIVE'
      },
      include: { person: true }
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        id: newStudent.id,
        studentId: newStudent.studentId,
        fullName: newStudent.person.fullNameEn,
        phone: newStudent.person.phone || '',
        email: newStudent.person.email || '',
        status: newStudent.status,
        personId: newStudent.personId,
        enrolledBatches: []
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/academic/students/:id — Update student
academicRouter.put('/students/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { fullName, phone, email, status } = req.body;

    const student = await prisma.student.findUnique({
      where: { id },
      include: { person: true }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (fullName !== undefined || phone !== undefined || email !== undefined) {
      await prisma.person.update({
        where: { id: student.personId },
        data: {
          fullNameEn: fullName !== undefined ? fullName.trim() : undefined,
          fullNameBn: fullName !== undefined ? fullName.trim() : undefined,
          phone: phone !== undefined ? phone.trim() : undefined,
          email: email !== undefined ? (email ? email.trim() : null) : undefined
        }
      });
    }

    const updated = await prisma.student.update({
      where: { id },
      data: {
        status: status !== undefined ? status : undefined
      },
      include: { person: true }
    });

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: {
        id: updated.id,
        studentId: updated.studentId,
        fullName: updated.person.fullNameEn,
        phone: updated.person.phone || '',
        email: updated.person.email || '',
        status: updated.status,
        personId: updated.personId
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/academic/students/:id — Delete student
academicRouter.delete('/students/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.student.delete({ where: { id } });
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// BATCHES MANAGEMENT API
// =============================================================================

// Helper to format Batch item
function formatBatch(b: any) {
  return {
    id: b.id,
    name: b.name,
    status: b.status,
    createdAt: b.createdAt.toISOString().split('T')[0],
    branchSubjectId: b.branchSubjectId,
    branchId: b.branchSubject.branchId,
    branchName: b.branchSubject.branch.name,
    branchType: b.branchSubject.branch.type,
    subjectId: b.branchSubject.subjectId,
    subjectName: b.branchSubject.subject.name,
    departmentId: b.branchSubject.departmentBranch.departmentId,
    departmentName: b.branchSubject.departmentBranch.department.name,
    totalStudents: b._count?.memberships || 0,
    coordinators: b.coordinators?.map((c: any) => ({
      id: c.staff.id,
      fullName: c.staff.fullName,
      email: c.staff.email,
      phone: c.staff.phone,
      designation: c.staff.designation
    })) || [],
    memberships: b.memberships?.map((m: any) => ({
      id: m.id,
      studentId: m.student.studentId,
      fullNameEn: m.student.person.fullNameEn,
      fullNameBn: m.student.person.fullNameBn,
      phone: m.student.person.phone,
      joinedAt: m.joinedAt.toISOString().split('T')[0],
      status: m.status
    })) || []
  };
}

// GET /api/academic/batches — List all batches with branch, department, subject & student count
academicRouter.get('/batches', async (req: Request, res: Response) => {
  try {
    const { branchId, subjectId, status, search } = req.query;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = String(status);
    }
    if (branchId && branchId !== 'ALL') {
      where.branchSubject = { branchId: String(branchId) };
    }
    if (subjectId && subjectId !== 'ALL') {
      where.branchSubject = {
        ...(where.branchSubject || {}),
        subjectId: String(subjectId)
      };
    }
    if (search) {
      where.name = { contains: String(search) };
    }

    const batches = await prisma.batch.findMany({
      where,
      include: {
        branchSubject: {
          include: {
            branch: true,
            subject: true,
            departmentBranch: {
              include: { department: true }
            }
          }
        },
        coordinators: {
          include: { staff: true }
        },
        _count: {
          select: { memberships: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = batches.map(formatBatch);
    res.json({ success: true, data: formatted, total: formatted.length });
  } catch (error: any) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/academic/batches/:id — Get batch details
academicRouter.get('/batches/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        branchSubject: {
          include: {
            branch: true,
            subject: true,
            departmentBranch: {
              include: { department: true }
            }
          }
        },
        memberships: {
          include: {
            student: {
              include: { person: true }
            }
          }
        },
        _count: {
          select: { memberships: true }
        }
      }
    });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    res.json({ success: true, data: formatBatch(batch) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/academic/batches — Create new batch
academicRouter.post('/batches', async (req: Request, res: Response) => {
  try {
    const { name, branchId, departmentId, subjectId, status } = req.body;

    if (!name || !branchId || !subjectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Batch name, branchId, and subjectId are required.' 
      });
    }

    // 1. Resolve or create DepartmentBranch
    let deptBranch = null;
    if (departmentId) {
      deptBranch = await prisma.departmentBranch.findUnique({
        where: {
          branchId_departmentId: {
            branchId,
            departmentId
          }
        }
      });

      if (!deptBranch) {
        deptBranch = await prisma.departmentBranch.create({
          data: { branchId, departmentId }
        });
      }
    } else {
      deptBranch = await prisma.departmentBranch.findFirst({
        where: { branchId }
      });
    }

    if (!deptBranch) {
      const defaultDept = await prisma.department.findFirst();
      if (!defaultDept) {
        return res.status(400).json({ success: false, message: 'No department found in academy.' });
      }
      deptBranch = await prisma.departmentBranch.create({
        data: { branchId, departmentId: defaultDept.id }
      });
    }

    // 2. Resolve or create BranchSubject
    let branchSubject = await prisma.branchSubject.findUnique({
      where: {
        branchId_subjectId: {
          branchId,
          subjectId
        }
      }
    });

    if (!branchSubject) {
      branchSubject = await prisma.branchSubject.create({
        data: {
          branchId,
          subjectId,
          departmentBranchId: deptBranch.id,
          status: 'ACTIVE'
        }
      });
    }

    // 3. Create the Batch
    const newBatch = await prisma.batch.create({
      data: {
        name: name.trim(),
        branchSubjectId: branchSubject.id,
        status: status || 'ACTIVE'
      },
      include: {
        branchSubject: {
          include: {
            branch: true,
            subject: true,
            departmentBranch: {
              include: { department: true }
            }
          }
        },
        _count: {
          select: { memberships: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: formatBatch(newBatch)
    });
  } catch (error: any) {
    console.error('Error creating batch:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/academic/batches/:id — Update batch
academicRouter.put('/batches/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, status } = req.body;

    const updated = await prisma.batch.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        status: status || undefined
      },
      include: {
        branchSubject: {
          include: {
            branch: true,
            subject: true,
            departmentBranch: {
              include: { department: true }
            }
          }
        },
        _count: {
          select: { memberships: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Batch updated successfully',
      data: formatBatch(updated)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/academic/batches/:id — Delete batch
academicRouter.delete('/batches/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Guard: prevent deletion if students are enrolled in this batch
    const memberCount = await prisma.batchMembership.count({ where: { batchId: id } });
    if (memberCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete batch because it has ${memberCount} enrolled student(s). Remove student enrollments first.`
      });
    }

    await prisma.batch.delete({ where: { id } });
    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/academic/batches/:id/students — Get students in batch
academicRouter.get('/batches/:id/students', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const memberships = await prisma.batchMembership.findMany({
      where: { batchId: id },
      include: {
        student: {
          include: {
            person: {
              include: {
                registrations: {
                  include: { branch: true }
                }
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    const students = memberships.map(m => ({
      membershipId: m.id,
      studentId: m.student.studentId,
      id: m.student.id,
      personId: m.student.personId,
      fullNameEn: m.student.person.fullNameEn,
      fullNameBn: m.student.person.fullNameBn,
      phone: m.student.person.phone,
      email: m.student.person.email,
      dateOfBirth: m.student.person.dateOfBirth,
      gender: m.student.person.gender,
      bloodGroup: m.student.person.bloodGroup,
      photoUrl: m.student.person.photoUrl,
      joinedAt: m.joinedAt.toISOString().split('T')[0],
      status: m.status
    }));

    res.json({ success: true, data: students });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/academic/batches/:id/students — Enroll student into batch
academicRouter.post('/batches/:id/students', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.id as string;
    const { personId, studentId } = req.body;

    let studentTargetId = studentId;

    // If personId was given instead of studentId, find or create Student profile
    if (!studentTargetId && personId) {
      let existingStudent = await prisma.student.findUnique({
        where: { personId }
      });

      if (!existingStudent) {
        const totalStudents = await prisma.student.count();
        const stdNo = `STD-${new Date().getFullYear()}-${String(totalStudents + 1).padStart(4, '0')}`;
        existingStudent = await prisma.student.create({
          data: {
            studentId: stdNo,
            personId,
            status: 'ACTIVE'
          }
        });
      }
      studentTargetId = existingStudent.id;
    }

    if (!studentTargetId) {
      return res.status(400).json({ success: false, message: 'studentId or personId is required' });
    }

    // Upsert membership
    const membership = await prisma.batchMembership.upsert({
      where: {
        studentId_batchId: {
          studentId: studentTargetId,
          batchId
        }
      },
      update: {
        status: 'ACTIVE'
      },
      create: {
        studentId: studentTargetId,
        batchId,
        status: 'ACTIVE'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Student enrolled in batch successfully',
      data: membership
    });
  } catch (error: any) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/academic/batches/:id/bulk-enroll — Bulk enroll registrations/persons into batch with strict Branch & Subject isolation
academicRouter.post('/batches/:id/bulk-enroll', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.id as string;
    const { registrationIds, personIds } = req.body;

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        branchSubject: {
          include: { branch: true, subject: true }
        }
      }
    });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found.' });
    }

    const batchBranchId = batch.branchSubject?.branchId;
    const batchSubjectId = batch.branchSubject?.subjectId;

    let targetPersonIds: string[] = [];

    if (Array.isArray(registrationIds) && registrationIds.length > 0) {
      const registrations = await prisma.registration.findMany({
        where: { id: { in: registrationIds } }
      });

      // Strict Branch & Subject Isolation Verification
      const mismatched = registrations.filter(r => 
        (batchBranchId && r.branchId !== batchBranchId) || 
        (batchSubjectId && r.subjectId !== batchSubjectId)
      );

      if (mismatched.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Branch/Subject mismatch: ${mismatched.length} candidate(s) do not belong to ${batch.branchSubject?.branch?.name} - ${batch.branchSubject?.subject?.name}. Strict isolation enforced.`
        });
      }

      targetPersonIds = registrations.map(r => r.personId);

      // Update registrations status to regular student
      await prisma.registration.updateMany({
        where: { id: { in: registrationIds } },
        data: { status: 'CONFIRMED' }
      });
    } else if (Array.isArray(personIds) && personIds.length > 0) {
      targetPersonIds = personIds;
    } else {
      return res.status(400).json({ success: false, message: 'registrationIds or personIds array is required.' });
    }

    // Process each person: ensure Student record, then upsert batch membership
    let enrolledCount = 0;
    for (const pId of targetPersonIds) {
      let student = await prisma.student.findUnique({ where: { personId: pId } });
      if (!student) {
        const total = await prisma.student.count();
        const stdNo = `STD-${new Date().getFullYear()}-${String(total + 1).padStart(4, '0')}`;
        student = await prisma.student.create({
          data: { studentId: stdNo, personId: pId, status: 'ACTIVE' }
        });
      }

      await prisma.batchMembership.upsert({
        where: {
          studentId_batchId: { studentId: student.id, batchId }
        },
        update: { status: 'ACTIVE' },
        create: { studentId: student.id, batchId, status: 'ACTIVE' }
      });
      enrolledCount++;
    }

    res.json({
      success: true,
      message: `Successfully enrolled ${enrolledCount} student(s) into batch "${batch.name}".`,
      count: enrolledCount
    });
  } catch (error: any) {
    console.error('Error in bulk-enroll:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
