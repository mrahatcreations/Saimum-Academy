import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const workshopRouter = Router();

// =============================================================================
// SEED DEFAULT 3-MONTH WORKSHOP SESSION & ROTATIONAL SCHEDULE IF EMPTY
// =============================================================================
async function seedDefaultWorkshopIfEmpty() {
  try {
    const sessionCount = await prisma.workshopSession.count();
    if (sessionCount === 0) {
      const branches = await prisma.branch.findMany();
      const centralBranch = branches.find(b => b.code?.includes('DHK') || b.name.includes('Central')) || branches[0];
      const staffList = await prisma.staff.findMany();

      const vocalCoord = staffList.find(s => s.fullName.includes('Noman') || s.designation?.includes('Vocal')) || staffList[0];
      const qiraatCoord = staffList.find(s => s.fullName.includes('Asad') || s.designation?.includes('Quran')) || staffList[1];
      const regionalCoord = staffList.find(s => s.fullName.includes('Mahmudul') || s.designation?.includes('Mirpur')) || staffList[2];

      // 1. Create 3-Month Summer Cultural Workshop Session
      const session = await prisma.workshopSession.create({
        data: {
          title: '৩ মাসের বিশেষ সাংস্কৃতিক কর্মশালা ২০২৬ (Summer Cultural Workshop)',
          code: 'WS-2026-SUMMER',
          year: 2026,
          startDate: '2026-06-01',
          endDate: '2026-08-31',
          targetCapacity: 90,
          status: 'ONGOING',
          description: 'কেন্দ্রীয় অডিশন ও ভাইভায় উত্তীর্ণ নবীন শিল্পীদের জন্য ৩ মাসের নিবিড় বহুমুখী সাংস্কৃতিক প্রশিক্ষণ কর্মশালা।',
          branchId: centralBranch?.id || null
        }
      });

      // 2. Create 3 Synchronized Workshop Batches
      const batch1 = await prisma.workshopBatch.create({
        data: {
          sessionId: session.id,
          name: 'ওয়ার্কশপ ব্যাচ ০১ (সকাল শিফট - Cohort A)',
          shift: 'MORNING',
          roomNo: 'স্টুডিও রুম ১০১ (Central Auditorium)',
          maxCapacity: 30,
          status: 'ACTIVE',
          branchId: centralBranch?.id || null
        }
      });

      const batch2 = await prisma.workshopBatch.create({
        data: {
          sessionId: session.id,
          name: 'ওয়ার্কশপ ব্যাচ ০২ (সকাল শিফট - Cohort B)',
          shift: 'MORNING',
          roomNo: 'রিহার্সাল রুম ২০২',
          maxCapacity: 30,
          status: 'ACTIVE',
          branchId: centralBranch?.id || null
        }
      });

      const batch3 = await prisma.workshopBatch.create({
        data: {
          sessionId: session.id,
          name: 'ওয়ার্কশপ ব্যাচ ০৩ (বিকাল শিফট - Cohort C)',
          shift: 'AFTERNOON',
          roomNo: 'সাংস্কৃতিক ল্যাব ৩০১',
          maxCapacity: 30,
          status: 'ACTIVE',
          branchId: centralBranch?.id || null
        }
      });

      // 3. Assign Staff Batch Moderators directly to Workshop Batches
      if (vocalCoord) {
        await prisma.workshopBatchModerator.create({
          data: {
            workshopBatchId: batch1.id,
            staffId: vocalCoord.id,
            role: 'PRIMARY_MODERATOR'
          }
        }).catch(() => {});
      }

      if (regionalCoord) {
        await prisma.workshopBatchModerator.create({
          data: {
            workshopBatchId: batch1.id,
            staffId: regionalCoord.id,
            role: 'ASSISTANT_MODERATOR'
          }
        }).catch(() => {});

        await prisma.workshopBatchModerator.create({
          data: {
            workshopBatchId: batch2.id,
            staffId: regionalCoord.id,
            role: 'PRIMARY_MODERATOR'
          }
        }).catch(() => {});
      }

      if (qiraatCoord) {
        await prisma.workshopBatchModerator.create({
          data: {
            workshopBatchId: batch3.id,
            staffId: qiraatCoord.id,
            role: 'PRIMARY_MODERATOR'
          }
        }).catch(() => {});
      }

      // 4. Create Rotational Class Timetable Matrix
      await prisma.workshopRotationalSchedule.createMany({
        data: [
          {
            workshopBatchId: batch1.id,
            dayOfWeek: 'FRIDAY',
            timeSlot: '10:00 AM - 11:30 AM',
            subjectName: 'কণ্ঠ সংগীত ও সুর সাধনা',
            guestInstructorName: 'উস্তাদ সাইফুল্লাহ নোমান (আমন্ত্রিত শিক্ষক)',
            roomNo: 'অডিটোরিয়াম স্টুডিও'
          },
          {
            workshopBatchId: batch2.id,
            dayOfWeek: 'FRIDAY',
            timeSlot: '10:00 AM - 11:30 AM',
            subjectName: 'মঞ্চ অভিনয় ও নাট্যকলা',
            guestInstructorName: 'নাট্য নির্দেশক তারিক আনাম',
            roomNo: 'রিহার্সাল রুম ২০২'
          },
          {
            workshopBatchId: batch3.id,
            dayOfWeek: 'FRIDAY',
            timeSlot: '10:00 AM - 11:30 AM',
            subjectName: 'শুদ্ধ উচ্চারণ ও বাচিক শিল্প',
            guestInstructorName: 'প্রখ্যাত বাচিক শিল্পী কামরুল হাসান',
            roomNo: 'সাংস্কৃতিক ল্যাব ৩০১'
          },
          {
            workshopBatchId: batch1.id,
            dayOfWeek: 'FRIDAY',
            timeSlot: '11:45 AM - 01:15 PM',
            subjectName: 'মঞ্চ অভিনয় ও নাট্যকলা',
            guestInstructorName: 'নাট্য নির্দেশক তারিক আনাম',
            roomNo: 'রিহার্সাল রুম ২০২'
          },
          {
            workshopBatchId: batch2.id,
            dayOfWeek: 'FRIDAY',
            timeSlot: '11:45 AM - 01:15 PM',
            subjectName: 'কণ্ঠ সংগীত ও সুর সাধনা',
            guestInstructorName: 'উস্তাদ সাইফুল্লাহ নোমান (আমন্ত্রিত শিক্ষক)',
            roomNo: 'অডিটোরিয়াম স্টুডিও'
          },
          {
            workshopBatchId: batch3.id,
            dayOfWeek: 'FRIDAY',
            timeSlot: '11:45 AM - 01:15 PM',
            subjectName: 'কুরআন তিলাওয়াত ও তাজবীদ',
            guestInstructorName: 'ক্বারী মুফতি শহীদুল ইসলাম',
            roomNo: 'সাংস্কৃতিক ল্যাব ৩০১'
          }
        ]
      });

      // 5. Seed Resources
      await prisma.workshopResource.createMany({
        data: [
          {
            workshopBatchId: batch1.id,
            title: 'হামদ-না\'ত সংকলন ও স্বরলিপি (পর্ব ০১)',
            type: 'LYRICS',
            content: '১. এই সুন্দর ফুল সুন্দর ফল মিঠা নদীর পানি...\n২. ত্রিভুবনের প্রিয় মুহাম্মদ এলোরে দুনিয়ায়...',
            uploadedBy: 'Ustad Abdullah Al Noman'
          },
          {
            workshopBatchId: batch1.id,
            title: 'মঞ্চনাটক "জাগরণ" — দৃশ্য ০১ ও ০২ পাণ্ডুলিপি',
            type: 'SCRIPT',
            content: 'চরিত্রসমূহ: সেলিম, করিম, শিক্ষক ও গ্রামবাসী।\nদৃশ্য ১: বটবৃক্ষের ছায়ায় একদল তরুণের শপথ...',
            uploadedBy: 'Mahmudul Hasan'
          }
        ]
      });

      console.log('✅ Seeded initial Saimum 3-Month Cultural Workshop session.');
    }
  } catch (err) {
    console.error('Failed to seed workshop session:', err);
  }
}

seedDefaultWorkshopIfEmpty();

// =============================================================================
// 1. GET /api/workshops — List workshop sessions
// =============================================================================
workshopRouter.get('/', async (req: Request, res: Response) => {
  try {
    const sessions = await prisma.workshopSession.findMany({
      include: {
        branch: { select: { id: true, name: true, code: true } },
        batches: {
          include: {
            moderators: {
              include: {
                staff: { select: { id: true, fullName: true, phone: true, role: true, designation: true } }
              }
            },
            enrollments: {
              select: { id: true, studentName: true, status: true, attendanceRate: true }
            },
            rotationalSchedules: true,
            resources: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: sessions });
  } catch (error: any) {
    console.error('Fetch workshops error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 2. POST /api/workshops — Create workshop session
// =============================================================================
workshopRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { title, code, year, startDate, endDate, targetCapacity, status, description, branchId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Workshop title is required.' });
    }

    const session = await prisma.workshopSession.create({
      data: {
        title: title.trim(),
        code: code ? code.trim() : `WS-${year || 2026}-${Date.now().toString().slice(-4)}`,
        year: year ? parseInt(year, 10) : 2026,
        startDate: startDate || null,
        endDate: endDate || null,
        targetCapacity: targetCapacity ? parseInt(targetCapacity, 10) : 100,
        status: status || 'ONGOING',
        description: description ? description.trim() : null,
        branchId: branchId && branchId !== 'ALL' && branchId !== 'GLOBAL' ? branchId : null
      },
      include: {
        branch: true,
        batches: true
      }
    });

    res.status(201).json({ success: true, data: session, message: 'Workshop session created successfully.' });
  } catch (error: any) {
    console.error('Create workshop error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 3. GET /api/workshops/:id — Get single session details
// =============================================================================
workshopRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const session = await prisma.workshopSession.findUnique({
      where: { id },
      include: {
        branch: true,
        batches: {
          include: {
            moderators: {
              include: {
                staff: { select: { id: true, fullName: true, phone: true, role: true, designation: true } }
              }
            },
            enrollments: true,
            rotationalSchedules: true,
            resources: true
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Workshop session not found.' });
    }

    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 3.1 PUT /api/workshops/:id — Update workshop session
// =============================================================================
workshopRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, code, year, startDate, endDate, targetCapacity, status, description, branchId } = req.body;

    const updated = await prisma.workshopSession.update({
      where: { id },
      data: {
        ...(title ? { title: title.trim() } : {}),
        ...(code !== undefined ? { code: code ? code.trim() : null } : {}),
        ...(year ? { year: parseInt(year, 10) } : {}),
        ...(startDate !== undefined ? { startDate: startDate || null } : {}),
        ...(endDate !== undefined ? { endDate: endDate || null } : {}),
        ...(targetCapacity !== undefined ? { targetCapacity: parseInt(targetCapacity, 10) } : {}),
        ...(status ? { status } : {}),
        ...(description !== undefined ? { description: description ? description.trim() : null } : {}),
        ...(branchId !== undefined ? { branchId: branchId && branchId !== 'ALL' && branchId !== 'GLOBAL' ? branchId : null } : {})
      },
      include: {
        branch: true,
        batches: true
      }
    });

    res.json({ success: true, data: updated, message: 'Workshop session updated successfully.' });
  } catch (error: any) {
    console.error('Update workshop error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 3.2 DELETE /api/workshops/:id — Delete workshop session (Cascade)
// =============================================================================
workshopRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const batches = await prisma.workshopBatch.findMany({ where: { sessionId: id }, select: { id: true } });
    const batchIds = batches.map(b => b.id);

    if (batchIds.length > 0) {
      await prisma.workshopAssessmentScore.deleteMany({ where: { enrollment: { workshopBatchId: { in: batchIds } } } });
      await prisma.workshopAssessment.deleteMany({ where: { workshopBatchId: { in: batchIds } } });
      await prisma.workshopAttendanceRecord.deleteMany({ where: { workshopBatchId: { in: batchIds } } });
      await prisma.workshopBatchModerator.deleteMany({ where: { workshopBatchId: { in: batchIds } } });
      await prisma.workshopStudentEnrollment.deleteMany({ where: { workshopBatchId: { in: batchIds } } });
      await prisma.workshopRotationalSchedule.deleteMany({ where: { workshopBatchId: { in: batchIds } } });
      await prisma.workshopResource.deleteMany({ where: { workshopBatchId: { in: batchIds } } });
      await prisma.workshopBatch.deleteMany({ where: { sessionId: id } });
    }

    await prisma.workshopSession.delete({ where: { id } });

    res.json({ success: true, message: 'Workshop session deleted successfully.' });
  } catch (error: any) {
    console.error('Delete workshop error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 3.3 PATCH /api/workshops/:id/status — Update workshop session status
// =============================================================================
workshopRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const updated = await prisma.workshopSession.update({
      where: { id },
      data: { status },
      include: { branch: true }
    });

    res.json({ success: true, data: updated, message: `Session status updated to ${status}.` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 4. POST /api/workshops/:id/batches — Create workshop batch
// =============================================================================
workshopRouter.post('/:id/batches', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id as string;
    const { name, scheduleDays, timeSlot, shift, roomNo, maxCapacity, branchId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Batch name is required.' });
    }

    const batch = await prisma.workshopBatch.create({
      data: {
        sessionId,
        name: name.trim(),
        scheduleDays: scheduleDays ? scheduleDays.trim() : null,
        timeSlot: timeSlot ? timeSlot.trim() : null,
        shift: shift || 'MORNING',
        roomNo: roomNo ? roomNo.trim() : null,
        maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : 30,
        status: 'ACTIVE',
        branchId: branchId && branchId !== 'ALL' && branchId !== 'GLOBAL' ? branchId : null
      },
      include: {
        moderators: { include: { staff: true } },
        enrollments: true,
        rotationalSchedules: true,
        resources: true
      }
    });

    res.status(201).json({ success: true, data: batch, message: 'Workshop batch created successfully.' });
  } catch (error: any) {
    console.error('Create workshop batch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 5. POST /api/workshops/batches/:batchId/moderators — Assign staff moderators
// =============================================================================
workshopRouter.post('/batches/:batchId/moderators', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.batchId as string;
    const { staffIds } = req.body;

    if (!Array.isArray(staffIds)) {
      return res.status(400).json({ success: false, message: 'staffIds array is required.' });
    }

    await prisma.workshopBatchModerator.deleteMany({
      where: { workshopBatchId: batchId }
    });

    if (staffIds.length > 0) {
      await prisma.workshopBatchModerator.createMany({
        data: staffIds.map((staffId: string, idx: number) => ({
          workshopBatchId: batchId,
          staffId,
          role: idx === 0 ? 'PRIMARY_MODERATOR' : 'ASSISTANT_MODERATOR'
        }))
      });
    }

    const updatedModerators = await prisma.workshopBatchModerator.findMany({
      where: { workshopBatchId: batchId },
      include: {
        staff: { select: { id: true, fullName: true, phone: true, role: true, designation: true } }
      }
    });

    res.json({ success: true, data: updatedModerators, message: 'Staff moderators assigned successfully.' });
  } catch (error: any) {
    console.error('Assign moderators error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 6. POST /api/workshops/batches/:batchId/enroll — Bulk enroll candidates
// =============================================================================
workshopRouter.post('/batches/:batchId/enroll', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.batchId as string;
    const { candidates } = req.body;

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ success: false, message: 'Candidates array is required.' });
    }

    const createdEnrollments = await prisma.workshopStudentEnrollment.createMany({
      data: candidates.map(c => ({
        workshopBatchId: batchId,
        studentName: c.studentName || c.fullName || 'Candidate',
        studentPhone: c.studentPhone || c.phone || null,
        registrationNo: c.registrationNo || null,
        personId: c.personId || null,
        status: 'ENROLLED',
        attendanceRate: 100,
        classTestScore: 0,
        vivaScore: 0
      }))
    });

    res.json({ success: true, data: createdEnrollments, message: `${candidates.length} candidates enrolled into batch.` });
  } catch (error: any) {
    console.error('Enroll candidates error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 7. GET /api/workshops/:id/rotation-matrix — Get rotational matrix
// =============================================================================
workshopRouter.get('/:id/rotation-matrix', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id as string;
    const batches = await prisma.workshopBatch.findMany({
      where: { sessionId },
      include: {
        moderators: { include: { staff: true } },
        rotationalSchedules: true
      }
    });

    res.json({ success: true, data: batches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 8. POST /api/workshops/rotation-matrix — Add/update schedule slot
// =============================================================================
workshopRouter.post('/rotation-matrix', async (req: Request, res: Response) => {
  try {
    const { workshopBatchId, dayOfWeek, timeSlot, subjectName, guestInstructorName, roomNo } = req.body;

    if (!workshopBatchId || !timeSlot || !subjectName) {
      return res.status(400).json({ success: false, message: 'workshopBatchId, timeSlot, and subjectName are required.' });
    }

    const slot = await prisma.workshopRotationalSchedule.create({
      data: {
        workshopBatchId,
        dayOfWeek: dayOfWeek || 'FRIDAY',
        timeSlot: timeSlot.trim(),
        subjectName: subjectName.trim(),
        guestInstructorName: guestInstructorName ? guestInstructorName.trim() : null,
        roomNo: roomNo ? roomNo.trim() : null
      }
    });

    res.status(201).json({ success: true, data: slot, message: 'Rotational schedule slot created.' });
  } catch (error: any) {
    console.error('Create rotation schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 9. GET & POST /api/workshops/batches/:batchId/resources — Lyrics & Scripts
// =============================================================================
workshopRouter.get('/batches/:batchId/resources', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.batchId as string;
    const resources = await prisma.workshopResource.findMany({
      where: { workshopBatchId: batchId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: resources });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

workshopRouter.post('/batches/:batchId/resources', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.batchId as string;
    const { title, type, content, uploadedBy } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Resource title is required.' });
    }

    const resource = await prisma.workshopResource.create({
      data: {
        workshopBatchId: batchId,
        title: title.trim(),
        type: type || 'LYRICS',
        content: content ? content.trim() : null,
        uploadedBy: uploadedBy || 'Batch Moderator'
      }
    });

    res.status(201).json({ success: true, data: resource, message: 'Resource published.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 10. PUT /api/workshops/batches/:batchId — Update workshop batch
// =============================================================================
workshopRouter.put('/batches/:batchId', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.batchId as string;
    const { name, scheduleDays, timeSlot, shift, roomNo, maxCapacity, status, branchId } = req.body;

    const updated = await prisma.workshopBatch.update({
      where: { id: batchId },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(scheduleDays !== undefined ? { scheduleDays: scheduleDays ? scheduleDays.trim() : null } : {}),
        ...(timeSlot !== undefined ? { timeSlot: timeSlot ? timeSlot.trim() : null } : {}),
        ...(shift ? { shift } : {}),
        ...(roomNo !== undefined ? { roomNo: roomNo ? roomNo.trim() : null } : {}),
        ...(maxCapacity ? { maxCapacity: parseInt(maxCapacity, 10) } : {}),
        ...(status ? { status } : {}),
        ...(branchId !== undefined ? { branchId: branchId && branchId !== 'ALL' ? branchId : null } : {})
      },
      include: {
        moderators: { include: { staff: true } },
        enrollments: true,
        rotationalSchedules: true,
        resources: true
      }
    });

    res.json({ success: true, data: updated, message: 'Batch updated successfully.' });
  } catch (error: any) {
    console.error('Update batch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 11. DELETE /api/workshops/batches/:batchId — Delete workshop batch
// =============================================================================
workshopRouter.delete('/batches/:batchId', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.batchId as string;

    // Delete relations first
    await prisma.workshopAssessmentScore.deleteMany({ where: { enrollment: { workshopBatchId: batchId } } });
    await prisma.workshopAssessment.deleteMany({ where: { workshopBatchId: batchId } });
    await prisma.workshopAttendanceRecord.deleteMany({ where: { workshopBatchId: batchId } });
    await prisma.workshopBatchModerator.deleteMany({ where: { workshopBatchId: batchId } });
    await prisma.workshopStudentEnrollment.deleteMany({ where: { workshopBatchId: batchId } });
    await prisma.workshopRotationalSchedule.deleteMany({ where: { workshopBatchId: batchId } });
    await prisma.workshopResource.deleteMany({ where: { workshopBatchId: batchId } });

    await prisma.workshopBatch.delete({
      where: { id: batchId }
    });

    res.json({ success: true, message: 'Batch deleted successfully.' });
  } catch (error: any) {
    console.error('Delete batch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 12. POST /api/workshops/batches/:batchId/assign-applicant — Assign Single Applicant
// =============================================================================
workshopRouter.post('/batches/:batchId/assign-applicant', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.batchId as string;
    const { registrationId, personId, studentName, studentPhone } = req.body;

    const batch = await prisma.workshopBatch.findUnique({
      where: { id: batchId },
      include: { enrollments: true }
    });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Workshop batch not found.' });
    }

    if (batch.enrollments.length >= batch.maxCapacity) {
      return res.status(400).json({ success: false, message: `Batch ${batch.name} is already full (Capacity: ${batch.maxCapacity}).` });
    }

    // Check if already enrolled in this batch
    const existing = await prisma.workshopStudentEnrollment.findFirst({
      where: {
        workshopBatchId: batchId,
        OR: [
          ...(registrationId ? [{ registrationNo: registrationId }] : []),
          ...(personId ? [{ personId }] : [])
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Student is already enrolled in this workshop batch.' });
    }

    const reg = registrationId ? await prisma.registration.findUnique({ where: { id: registrationId } }) : null;
    const regNo = reg?.registrationNo || `REG-${Date.now().toString().slice(-4)}`;
    const qrPayload = `SA-QR-WS-${batchId.slice(0, 4)}-${regNo}`;

    const enrollment = await prisma.workshopStudentEnrollment.create({
      data: {
        workshopBatchId: batchId,
        personId: personId || reg?.personId || null,
        registrationNo: regNo,
        studentName: studentName || regNo,
        studentPhone: studentPhone || null,
        qrCodePayload: qrPayload,
        status: 'ENROLLED'
      }
    });

    // Update Registration status to WORKSHOP
    if (registrationId) {
      await prisma.registration.update({
        where: { id: registrationId },
        data: { status: 'WORKSHOP' }
      });
    }

    res.status(201).json({ success: true, data: enrollment, message: 'Applicant successfully enrolled in workshop batch.' });
  } catch (error: any) {
    console.error('Assign applicant error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 12.1 POST /api/workshops/batches/:batchId/bulk-assign — Bulk Assign Applicants
// =============================================================================
workshopRouter.post('/batches/:batchId/bulk-assign', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.batchId as string;
    const { registrationIds } = req.body;

    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'registrationIds array is required.' });
    }

    const batch = await prisma.workshopBatch.findUnique({
      where: { id: batchId },
      include: { enrollments: true }
    });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Workshop batch not found.' });
    }

    const availableSeats = batch.maxCapacity - batch.enrollments.length;
    if (availableSeats <= 0) {
      return res.status(400).json({ success: false, message: `Batch ${batch.name} is already full (Capacity: ${batch.maxCapacity}).` });
    }

    const registrations = await prisma.registration.findMany({
      where: { id: { in: registrationIds } },
      include: { person: true }
    });

    let assignedCount = 0;
    for (const reg of registrations) {
      if (batch.enrollments.length + assignedCount >= batch.maxCapacity) break;

      const existing = await prisma.workshopStudentEnrollment.findFirst({
        where: {
          workshopBatchId: batchId,
          OR: [
            { registrationNo: reg.registrationNo },
            { personId: reg.personId }
          ]
        }
      });

      if (!existing) {
        const qrPayload = `SA-QR-WS-${batchId.slice(0, 4)}-${reg.registrationNo}`;
        await prisma.workshopStudentEnrollment.create({
          data: {
            workshopBatchId: batchId,
            personId: reg.personId,
            registrationNo: reg.registrationNo,
            studentName: reg.person.fullNameEn,
            studentPhone: reg.person.phone,
            qrCodePayload: qrPayload,
            status: 'ENROLLED'
          }
        });

        await prisma.registration.update({
          where: { id: reg.id },
          data: { status: 'WORKSHOP' }
        });

        assignedCount++;
      }
    }

    res.json({
      success: true,
      message: `Successfully enrolled ${assignedCount} candidate(s) into workshop batch ${batch.name}.`,
      data: { assignedCount }
    });
  } catch (error: any) {
    console.error('Bulk assign error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 13. POST /api/workshops/sessions/:sessionId/auto-allocate — Auto-Allocate by Quota
// =============================================================================
workshopRouter.post('/sessions/:sessionId/auto-allocate', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;

    // 1. Find all SELECTED and PAID applicants in the admission session
    const applicants = await prisma.registration.findMany({
      where: {
        status: 'SELECTED',
        paymentStatus: 'PAID'
      },
      include: { person: true }
    });

    if (applicants.length === 0) {
      return res.status(400).json({ success: false, message: 'No selected and fee-paid applicants found for allocation.' });
    }

    // 2. Find batches under this workshop session with available seats
    const batches = await prisma.workshopBatch.findMany({
      where: { sessionId, status: 'ACTIVE' },
      include: { enrollments: true },
      orderBy: { createdAt: 'asc' }
    });

    if (batches.length === 0) {
      return res.status(400).json({ success: false, message: 'No active workshop batches available in this session.' });
    }

    let allocatedCount = 0;
    let batchIndex = 0;

    for (const app of applicants) {
      // Find a batch that has available capacity
      while (batchIndex < batches.length && batches[batchIndex].enrollments.length >= batches[batchIndex].maxCapacity) {
        batchIndex++;
      }

      if (batchIndex >= batches.length) {
        break; // All batches are full
      }

      const targetBatch = batches[batchIndex];
      const qrPayload = `SA-QR-WS-${targetBatch.id.slice(0, 4)}-${app.registrationNo}`;

      await prisma.workshopStudentEnrollment.create({
        data: {
          workshopBatchId: targetBatch.id,
          personId: app.personId,
          registrationNo: app.registrationNo,
          studentName: app.person.fullNameEn,
          studentPhone: app.person.phone,
          qrCodePayload: qrPayload,
          status: 'ENROLLED'
        }
      });

      await prisma.registration.update({
        where: { id: app.id },
        data: { status: 'WORKSHOP' }
      });

      targetBatch.enrollments.push({} as any);
      allocatedCount++;
    }

    res.json({
      success: true,
      message: `Successfully allocated ${allocatedCount} students across workshop batches.`,
      data: { allocatedCount }
    });
  } catch (error: any) {
    console.error('Auto allocate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 14. POST /api/workshops/attendance/scan-qr — Secure Time-Gated QR Code Scanner
// =============================================================================
workshopRouter.post('/attendance/scan-qr', async (req: Request, res: Response) => {
  try {
    const { qrCodePayload, staffId, scanTime, scanDate } = req.body;

    if (!qrCodePayload) {
      return res.status(400).json({ success: false, message: 'QR Code payload is required.' });
    }

    const enrollment = await prisma.workshopStudentEnrollment.findFirst({
      where: { qrCodePayload },
      include: { workshopBatch: { include: { moderators: true } } }
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Invalid Student QR Code / Not found in any active workshop.' });
    }

    const batch = enrollment.workshopBatch;
    const todayStr = scanDate || new Date().toISOString().split('T')[0];
    const timeStr = scanTime || new Date().toTimeString().split(' ')[0];

    // Day & Schedule validation
    const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const scheduleDays = (batch.scheduleDays || '').toLowerCase();
    
    // Check if everyday or matching day
    const isEveryday = scheduleDays.includes('everyday') || scheduleDays.includes('প্রতিদিন') || scheduleDays.includes('daily');
    
    // Bengali day mapping
    const BENGALI_DAYS: Record<string, string> = {
      'friday': 'শুক্র',
      'saturday': 'শনি',
      'sunday': 'রবি',
      'monday': 'সোম',
      'tuesday': 'মঙ্গল',
      'wednesday': 'বুধ',
      'thursday': 'বৃহস্পতি'
    };
    const bnDay = BENGALI_DAYS[currentDayName.toLowerCase()] || '';
    
    const dayMatches = isEveryday || 
      scheduleDays.includes(currentDayName.toLowerCase()) || 
      scheduleDays.includes(currentDayName.slice(0, 3).toLowerCase()) ||
      (bnDay && scheduleDays.includes(bnDay));

    if (!dayMatches && process.env.NODE_ENV === 'production') {
      return res.status(400).json({
        success: false,
        message: `Attendance rejected: Today (${currentDayName}) is not a scheduled class day for ${batch.name} (Schedule: ${batch.scheduleDays}).`
      });
    }

    // Check if staff is an assigned moderator for this batch
    if (staffId) {
      const isAssigned = batch.moderators.some(m => m.staffId === staffId);
      if (!isAssigned && process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You are not an assigned moderator for this workshop batch.'
        });
      }
    }

    // Check if already scanned today
    const existing = await prisma.workshopAttendanceRecord.findUnique({
      where: {
        workshopBatchId_enrollmentId_date: {
          workshopBatchId: batch.id,
          enrollmentId: enrollment.id,
          date: todayStr
        }
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `${enrollment.studentName} has already been scanned present for today (${todayStr}) at ${existing.time}.`
      });
    }

    // Record attendance
    const record = await prisma.workshopAttendanceRecord.create({
      data: {
        workshopBatchId: batch.id,
        enrollmentId: enrollment.id,
        date: todayStr,
        time: timeStr,
        status: 'PRESENT',
        scanMethod: 'QR_SCAN',
        scannedByStaffId: staffId || null
      }
    });

    // Update student's attendance rate
    const totalRecords = await prisma.workshopAttendanceRecord.count({
      where: { workshopBatchId: batch.id, enrollmentId: enrollment.id }
    });
    const presentRecords = await prisma.workshopAttendanceRecord.count({
      where: { workshopBatchId: batch.id, enrollmentId: enrollment.id, status: 'PRESENT' }
    });

    const newRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 100;
    const attScore = (newRate / 100) * 30; // 30% weight for attendance

    await prisma.workshopStudentEnrollment.update({
      where: { id: enrollment.id },
      data: {
        attendanceRate: Math.round(newRate),
        attendanceScore: Math.round(attScore * 10) / 10,
        compositeScore: Math.round((attScore + enrollment.classTestScore + enrollment.finalExamScore) * 10) / 10
      }
    });

    res.json({
      success: true,
      data: {
        record,
        studentName: enrollment.studentName,
        registrationNo: enrollment.registrationNo,
        batchName: batch.name,
        timestamp: `${todayStr} ${timeStr}`
      },
      message: `Verified: ${enrollment.studentName} attendance recorded successfully!`
    });
  } catch (error: any) {
    console.error('Scan QR attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 15. GET & POST /api/workshops/batches/:batchId/assessments — Exam Scheduler
// =============================================================================
workshopRouter.get('/batches/:batchId/assessments', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.batchId as string;
    const assessments = await prisma.workshopAssessment.findMany({
      where: { workshopBatchId: batchId },
      include: {
        scores: {
          include: { enrollment: true }
        }
      },
      orderBy: { date: 'asc' }
    });
    res.json({ success: true, data: assessments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

workshopRouter.post('/batches/:batchId/assessments', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.batchId as string;
    const { title, type, date, totalMarks, weightPercentage } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Assessment title is required.' });
    }

    const assessment = await prisma.workshopAssessment.create({
      data: {
        workshopBatchId: batchId,
        title: title.trim(),
        type: type || 'CLASS_TEST',
        date: date || new Date().toISOString().split('T')[0],
        totalMarks: Number(totalMarks) || 100,
        weightPercentage: Number(weightPercentage) || (type === 'FINAL_PRACTICAL' ? 40 : 30)
      }
    });

    res.status(201).json({ success: true, data: assessment, message: 'Assessment scheduled successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 16. POST /api/workshops/assessments/:assessmentId/scores — Marksheet Entry
// =============================================================================
workshopRouter.post('/assessments/:assessmentId/scores', async (req: Request, res: Response) => {
  try {
    const assessmentId = req.params.assessmentId as string;
    const { scores } = req.body; // Array of { enrollmentId, marksObtained, feedback }

    if (!Array.isArray(scores)) {
      return res.status(400).json({ success: false, message: 'Scores must be an array.' });
    }

    const assessment = await prisma.workshopAssessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    for (const item of scores) {
      await prisma.workshopAssessmentScore.upsert({
        where: {
          assessmentId_enrollmentId: {
            assessmentId,
            enrollmentId: item.enrollmentId
          }
        },
        update: {
          marksObtained: Number(item.marksObtained) || 0,
          feedback: item.feedback || null
        },
        create: {
          assessmentId,
          enrollmentId: item.enrollmentId,
          marksObtained: Number(item.marksObtained) || 0,
          feedback: item.feedback || null
        }
      });

      // Update student's composite score
      const enrollment = await prisma.workshopStudentEnrollment.findUnique({
        where: { id: item.enrollmentId },
        include: {
          assessmentScores: { include: { assessment: true } }
        }
      });

      if (enrollment) {
        let classTestTotal = 0;
        let finalExamScore = 0;

        for (const s of enrollment.assessmentScores) {
          if (s.assessment.type === 'FINAL_PRACTICAL') {
            finalExamScore = (s.marksObtained / s.assessment.totalMarks) * 40; // 40% weight
          } else {
            classTestTotal += (s.marksObtained / s.assessment.totalMarks) * 30; // 30% weight
          }
        }

        const totalScore = Math.round((enrollment.attendanceScore + classTestTotal + finalExamScore) * 10) / 10;
        const isPassed = totalScore >= 60;
        const grade = totalScore >= 80 ? 'A+' : totalScore >= 70 ? 'A' : totalScore >= 60 ? 'B' : 'Fail';

        await prisma.workshopStudentEnrollment.update({
          where: { id: item.enrollmentId },
          data: {
            classTestScore: Math.round(classTestTotal * 10) / 10,
            finalExamScore: Math.round(finalExamScore * 10) / 10,
            compositeScore: totalScore,
            finalGrade: grade,
            isQualifiedRegular: isPassed
          }
        });
      }
    }

    res.json({ success: true, message: 'Marksheet saved and composite scores updated successfully.' });
  } catch (error: any) {
    console.error('Save assessment scores error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 16.1 POST /api/workshops/batches/:batchId/marksheet — Direct Batch Marksheet Update
// =============================================================================
workshopRouter.post('/batches/:batchId/marksheet', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.batchId as string;
    const { marks } = req.body; // Array of { enrollmentId, classTestScore, finalExamScore }

    if (!Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({ success: false, message: 'marks array is required.' });
    }

    for (const item of marks) {
      const classTest = Math.min(Math.max(Number(item.classTestScore) || 0, 0), 30);
      const finalExam = Math.min(Math.max(Number(item.finalExamScore) || 0, 0), 40);

      const enrollment = await prisma.workshopStudentEnrollment.findUnique({
        where: { id: item.enrollmentId }
      });

      if (enrollment) {
        const composite = Math.round((enrollment.attendanceScore + classTest + finalExam) * 10) / 10;
        const isPassed = composite >= 60;
        const finalGrade = composite >= 85 ? 'A+' : composite >= 75 ? 'A' : composite >= 60 ? 'Pass' : 'Fail';

        await prisma.workshopStudentEnrollment.update({
          where: { id: item.enrollmentId },
          data: {
            classTestScore: classTest,
            finalExamScore: finalExam,
            compositeScore: composite,
            finalGrade,
            isQualifiedRegular: isPassed
          }
        });
      }
    }

    res.json({ success: true, message: 'Batch marksheet and composite scores saved successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// 17. POST /api/workshops/batches/:batchId/graduate-to-regular — Promote Trainee
// =============================================================================
workshopRouter.post('/batches/:batchId/graduate-to-regular', async (req: Request, res: Response) => {
  try {
    const batchId = req.params.batchId as string;
    const { enrollmentId, regularBatchId } = req.body;

    const enrollment = await prisma.workshopStudentEnrollment.findUnique({
      where: { id: enrollmentId }
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Trainee enrollment not found.' });
    }

    let personId = enrollment.personId;

    if (!personId) {
      // Create permanent person profile if not exists
      const p = await prisma.person.create({
        data: {
          fullNameEn: enrollment.studentName,
          phone: enrollment.studentPhone,
          gender: 'MALE'
        }
      });
      personId = p.id;
    }

    // 1. Create or get Student record
    let student = await prisma.student.findUnique({
      where: { personId }
    });

    if (!student) {
      const studentCode = `STU-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      student = await prisma.student.create({
        data: {
          studentId: studentCode,
          personId,
          status: 'ACTIVE'
        }
      });
    }

    // 2. Enroll student into the ongoing regular batch
    if (regularBatchId) {
      await prisma.batchMembership.upsert({
        where: {
          studentId_batchId: {
            studentId: student.id,
            batchId: regularBatchId
          }
        },
        update: { status: 'ACTIVE' },
        create: {
          studentId: student.id,
          batchId: regularBatchId,
          status: 'ACTIVE'
        }
      });
    }

    // 3. Mark workshop enrollment as GRADUATED
    await prisma.workshopStudentEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'GRADUATED',
        isQualifiedRegular: true
      }
    });

    res.json({
      success: true,
      message: `Trainee ${enrollment.studentName} has successfully graduated and enrolled as a Regular Student!`,
      data: { studentId: student.studentId }
    });
  } catch (error: any) {
    console.error('Graduate to regular error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
