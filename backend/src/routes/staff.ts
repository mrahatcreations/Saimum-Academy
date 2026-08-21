import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const staffRouter = Router();

// =============================================================================
// SEED DEFAULT STAFF & COORDINATORS IF EMPTY
// =============================================================================
async function seedDefaultStaffIfEmpty() {
  try {
    const count = await prisma.staff.count();
    if (count === 0) {
      // Find branches and batches
      const branches = await prisma.branch.findMany();
      const batches = await prisma.batch.findMany({
        include: {
          branchSubject: {
            include: { branch: true, subject: true }
          }
        }
      });

      const central = branches.find(b => b.code?.includes('DHK') || b.name.includes('Central')) || branches[0];
      const mirpur = branches.find(b => b.code?.includes('MIR') || b.name.includes('Mirpur')) || branches[1];

      // 1. Super Admin
      await prisma.staff.create({
        data: {
          fullName: 'Ustad Motiur Rahman Mallick (Founder Inspiration)',
          email: 'mallick@saimumacademy.org',
          phone: '+880 1970-578220',
          designation: 'Central Director & Chief Mentor',
          role: 'SUPER_ADMIN',
          branchId: central?.id || null,
          status: 'ACTIVE',
          joiningDate: '1978-01-01',
          notes: 'Central academy leadership and cultural mentor.'
        }
      });

      // 2. Vocal Coordinator (assigned to multiple batches/branches)
      const vocalCoordinator = await prisma.staff.create({
        data: {
          fullName: 'Ustad Abdullah Al Noman',
          email: 'noman@saimumacademy.org',
          phone: '+880 1711-002233',
          designation: 'Vocal Music & Hamd-Naat Faculty Coordinator',
          role: 'COORDINATOR',
          branchId: central?.id || null,
          status: 'ACTIVE',
          joiningDate: '2015-03-15',
          notes: 'Conducting and coordinating vocal training batches across Central and Mirpur branches.'
        }
      });

      // 3. Quranic Recitation Coordinator
      const qiraatCoordinator = await prisma.staff.create({
        data: {
          fullName: 'Qari Muhammad Asadullah',
          email: 'qari.asad@saimumacademy.org',
          phone: '+880 1819-445566',
          designation: 'Quranic Recitation & Tajweed Coordinator',
          role: 'COORDINATOR',
          branchId: central?.id || null,
          status: 'ACTIVE',
          joiningDate: '2018-06-01',
          notes: 'Managing Quranic recitation classes and Tajweed training.'
        }
      });

      // 4. Regional Coordinator (Mirpur)
      const mirpurCoordinator = await prisma.staff.create({
        data: {
          fullName: 'Mahmudul Hasan',
          email: 'mirpur.coordinator@saimumacademy.org',
          phone: '+880 1922-334455',
          designation: 'Mirpur Regional Branch Coordinator',
          role: 'COORDINATOR',
          branchId: mirpur?.id || null,
          status: 'ACTIVE',
          joiningDate: '2022-01-10',
          notes: 'Coordinating admissions, classes, and batch operations for Mirpur campus.'
        }
      });

      // Assign initial batches to coordinators if batches exist
      if (batches.length > 0) {
        if (batches[0]) {
          await prisma.staffBatchAssignment.create({
            data: { staffId: vocalCoordinator.id, batchId: batches[0].id }
          }).catch(() => {});
        }
        if (batches[1]) {
          await prisma.staffBatchAssignment.create({
            data: { staffId: vocalCoordinator.id, batchId: batches[1].id }
          }).catch(() => {});
          await prisma.staffBatchAssignment.create({
            data: { staffId: mirpurCoordinator.id, batchId: batches[1].id }
          }).catch(() => {});
        }
        if (batches[2]) {
          await prisma.staffBatchAssignment.create({
            data: { staffId: qiraatCoordinator.id, batchId: batches[2].id }
          }).catch(() => {});
        }
      }

      console.log('✅ Seeded initial Saimum Academy staff & coordinators.');
    }
  } catch (err) {
    console.error('Failed to seed staff:', err);
  }
}

seedDefaultStaffIfEmpty();

// =============================================================================
// 1. GET /api/staff — List staff with search, filters, and batch assignments
// =============================================================================
staffRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { role, branchId, status, search } = req.query;

    const where: any = {};

    if (role && role !== 'ALL') {
      where.role = String(role);
    }

    if (branchId && branchId !== 'ALL') {
      where.OR = [
        { branchId: String(branchId) },
        { assignedBatches: { some: { batch: { branchSubject: { branchId: String(branchId) } } } } }
      ];
    }

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { fullName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { designation: { contains: q } }
      ];
    }

    const staffList = await prisma.staff.findMany({
      where,
      include: {
        branch: {
          select: { id: true, name: true, code: true, type: true }
        },
        assignedDepartments: {
          include: {
            department: {
              select: { id: true, name: true, status: true }
            }
          }
        },
        assignedBatches: {
          include: {
            batch: {
              select: {
                id: true,
                name: true,
                status: true,
                branchSubject: {
                  select: {
                    branch: { select: { id: true, name: true, code: true } },
                    subject: { select: { id: true, name: true, code: true } }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: staffList
    });
  } catch (error: any) {
    console.error('Fetch staff error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 2. POST /api/staff — Create staff member / coordinator
// =============================================================================
staffRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, designation, role, branchId, status, joiningDate, notes, departmentIds, batchIds } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    const cleanName = fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '.');
    const finalEmail = (email && email.trim()) 
      ? email.trim().toLowerCase() 
      : `${cleanName}.${Math.floor(1000 + Math.random() * 9000)}@saimumacademy.org`;

    const existing = await prisma.staff.findUnique({
      where: { email: finalEmail }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'A staff member with this email already exists.' });
    }

    const newStaff = await prisma.staff.create({
      data: {
        fullName: fullName.trim(),
        email: finalEmail,
        phone: phone ? phone.trim() : null,
        designation: designation ? designation.trim() : null,
        role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'STAFF',
        branchId: branchId && branchId !== 'GLOBAL' && branchId !== 'ALL' ? branchId : null,
        status: status || 'ACTIVE',
        joiningDate: joiningDate || new Date().toISOString().split('T')[0],
        notes: notes ? notes.trim() : null
      }
    });

    // Handle department assignments
    if (Array.isArray(departmentIds) && departmentIds.length > 0) {
      await prisma.staffDepartmentAssignment.createMany({
        data: departmentIds.map((dId: string) => ({
          staffId: newStaff.id,
          departmentId: dId,
          branchId: branchId && branchId !== 'GLOBAL' && branchId !== 'ALL' ? branchId : null
        }))
      });
    }

    // Handle batch assignments (if any)
    if (Array.isArray(batchIds) && batchIds.length > 0) {
      await prisma.staffBatchAssignment.createMany({
        data: batchIds.map((bId: string) => ({
          staffId: newStaff.id,
          batchId: bId
        }))
      });
    }

    const completeStaff = await prisma.staff.findUnique({
      where: { id: newStaff.id },
      include: {
        branch: { select: { id: true, name: true, code: true, type: true } },
        assignedDepartments: {
          include: {
            department: { select: { id: true, name: true, status: true } }
          }
        },
        assignedBatches: {
          include: {
            batch: {
              select: {
                id: true,
                name: true,
                status: true,
                branchSubject: {
                  select: {
                    branch: { select: { id: true, name: true, code: true } },
                    subject: { select: { id: true, name: true, code: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: completeStaff,
      message: 'Staff member created successfully.'
    });
  } catch (error: any) {
    console.error('Create staff error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 3. GET /api/staff/:id — Get staff details
// =============================================================================
staffRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        branch: true,
        assignedDepartments: {
          include: {
            department: true
          }
        },
        assignedBatches: {
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
      }
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    res.json({ success: true, data: staff });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 4. PUT /api/staff/:id — Update staff member & department assignments
// =============================================================================
staffRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { fullName, email, phone, designation, role, branchId, status, joiningDate, notes, departmentIds, batchIds } = req.body;

    const dataToUpdate: any = {};
    if (fullName !== undefined) dataToUpdate.fullName = fullName.trim();
    if (email !== undefined) dataToUpdate.email = email.trim().toLowerCase();
    if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null;
    if (designation !== undefined) dataToUpdate.designation = designation ? designation.trim() : null;
    if (role !== undefined) dataToUpdate.role = role;
    if (branchId !== undefined) {
      dataToUpdate.branchId = branchId && branchId !== 'GLOBAL' && branchId !== 'ALL' ? branchId : null;
    }
    if (status !== undefined) dataToUpdate.status = status;
    if (joiningDate !== undefined) dataToUpdate.joiningDate = joiningDate;
    if (notes !== undefined) dataToUpdate.notes = notes;

    await prisma.staff.update({
      where: { id },
      data: dataToUpdate
    });

    // Update department assignments if provided
    if (Array.isArray(departmentIds)) {
      await prisma.staffDepartmentAssignment.deleteMany({
        where: { staffId: id }
      });
      if (departmentIds.length > 0) {
        await prisma.staffDepartmentAssignment.createMany({
          data: departmentIds.map((dId: string) => ({
            staffId: id,
            departmentId: dId,
            branchId: branchId && branchId !== 'GLOBAL' && branchId !== 'ALL' ? branchId : null
          }))
        });
      }
    }

    // Update batch assignments if provided (legacy support)
    if (Array.isArray(batchIds)) {
      await prisma.staffBatchAssignment.deleteMany({
        where: { staffId: id }
      });
      if (batchIds.length > 0) {
        await prisma.staffBatchAssignment.createMany({
          data: batchIds.map((bId: string) => ({
            staffId: id,
            batchId: bId
          }))
        });
      }
    }

    const updated = await prisma.staff.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true, code: true, type: true } },
        assignedDepartments: {
          include: {
            department: { select: { id: true, name: true, status: true } }
          }
        },
        assignedBatches: {
          include: {
            batch: {
              select: {
                id: true,
                name: true,
                status: true,
                branchSubject: {
                  select: {
                    branch: { select: { id: true, name: true, code: true } },
                    subject: { select: { id: true, name: true, code: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: updated,
      message: 'Staff member updated successfully.'
    });
  } catch (error: any) {
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 5. POST /api/staff/:id/toggle-status — Toggle status
// =============================================================================
staffRouter.post('/:id/toggle-status', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const current = await prisma.staff.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    const nextStatus = current.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = await prisma.staff.update({
      where: { id },
      data: { status: nextStatus },
      include: {
        branch: { select: { id: true, name: true, code: true, type: true } },
        assignedDepartments: {
          include: {
            department: { select: { id: true, name: true, status: true } }
          }
        },
        assignedBatches: {
          include: {
            batch: {
              select: {
                id: true,
                name: true,
                status: true,
                branchSubject: {
                  select: {
                    branch: { select: { id: true, name: true, code: true } },
                    subject: { select: { id: true, name: true, code: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 6. DELETE /api/staff/:id — Delete staff member
// =============================================================================
staffRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.staff.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Staff member deleted successfully.'
    });
  } catch (error: any) {
    console.error('Delete staff error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
