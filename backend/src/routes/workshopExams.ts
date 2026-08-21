import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const workshopExamsRouter = Router();
const db: any = prisma;

// =============================================================================
// WORKSHOP FINAL EXAMINATIONS & 3-DAY MERIT / WAITING LIST ENGINE
// =============================================================================

// 1. GET /api/workshop-exams — List all workshop exams
workshopExamsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { branchId, sessionId, subjectId } = req.query;

    const where: any = {};
    if (branchId && branchId !== 'ALL') where.branchId = String(branchId);
    if (sessionId && sessionId !== 'ALL') where.sessionId = String(sessionId);
    if (subjectId && subjectId !== 'ALL') where.subjectId = String(subjectId);

    const exams = await db.workshopExam.findMany({
      where,
      include: {
        branch: true,
        subject: true,
        results: {
          include: {
            person: true,
            registration: true
          },
          orderBy: { marks: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = exams.map((exam: any) => {
      const totalExaminees = exam.results.length;
      const passedCount = exam.results.filter((r: any) => r.isPassed).length;
      const meritOfferedCount = exam.results.filter((r: any) => r.admissionStatus === 'MERIT_OFFERED').length;
      const admittedCount = exam.results.filter((r: any) => r.admissionStatus === 'ADMITTED').length;
      const waitingCount = exam.results.filter((r: any) => r.admissionStatus === 'WAITING_LIST').length;
      const expiredCount = exam.results.filter((r: any) => r.admissionStatus === 'OFFER_EXPIRED').length;

      return {
        id: exam.id,
        sessionId: exam.sessionId,
        branchId: exam.branchId,
        branchName: exam.branch?.name || '',
        subjectId: exam.subjectId,
        subjectName: exam.subject?.name || '',
        title: exam.title,
        examDate: exam.examDate,
        totalMarks: exam.totalMarks,
        passMarks: exam.passMarks,
        availableSeats: exam.availableSeats,
        admissionWindowDays: exam.admissionWindowDays,
        status: exam.status,
        stats: {
          totalExaminees,
          passedCount,
          meritOfferedCount,
          admittedCount,
          waitingCount,
          expiredCount,
          vacantSeats: Math.max(0, exam.availableSeats - admittedCount - meritOfferedCount)
        }
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Failed to fetch workshop exams:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. POST /api/workshop-exams — Create a new workshop final exam
workshopExamsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      sessionId, 
      branchId, 
      subjectId, 
      title, 
      examDate, 
      totalMarks = 100, 
      passMarks = 60, 
      availableSeats = 50, 
      admissionWindowDays = 3 
    } = req.body;

    if (!sessionId || !branchId || !subjectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session, Branch, and Subject are required to create an exam.' 
      });
    }

    const branch = await db.branch.findUnique({ where: { id: branchId } });
    const subject = await db.subject.findUnique({ where: { id: subjectId } });

    const examTitle = title || `${subject?.name || 'Subject'} Workshop Final Exam (${branch?.name || 'Branch'})`;

    const created = await db.workshopExam.create({
      data: {
        sessionId,
        branchId,
        subjectId,
        title: examTitle,
        examDate: examDate || new Date().toISOString().split('T')[0],
        totalMarks: parseFloat(String(totalMarks)) || 100,
        passMarks: parseFloat(String(passMarks)) || 60,
        availableSeats: parseInt(String(availableSeats), 10) || 50,
        admissionWindowDays: parseInt(String(admissionWindowDays), 10) || 3,
        status: 'PUBLISHED'
      },
      include: {
        branch: true,
        subject: true
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Workshop Final Exam created successfully.', 
      data: created 
    });
  } catch (error: any) {
    console.error('Failed to create workshop exam:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. GET /api/workshop-exams/:id — Get single exam details and merit list
workshopExamsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const exam = await db.workshopExam.findUnique({
      where: { id },
      include: {
        branch: true,
        subject: true,
        results: {
          include: {
            person: true,
            registration: true
          },
          orderBy: [
            { isPassed: 'desc' },
            { marks: 'desc' }
          ]
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    res.json({ success: true, data: exam });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. POST /api/workshop-exams/:id/results — Batch input marks & Auto-Generate Merit/Waiting List
workshopExamsRouter.post('/:id/results', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { studentMarks } = req.body; // Array of { registrationId, personId, marks, feedback }

    if (!Array.isArray(studentMarks) || studentMarks.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide array of studentMarks.' });
    }

    const exam = await db.workshopExam.findUnique({ where: { id } });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    // Sort by marks descending
    const sorted = [...studentMarks].sort((a, b) => (parseFloat(b.marks) || 0) - (parseFloat(a.marks) || 0));

    const windowDays = exam.admissionWindowDays || 3;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + windowDays);

    let currentMeritRank = 1;
    let currentWaitingRank = 1;

    // Process inside transaction
    const results = [];
    for (const item of sorted) {
      const marks = parseFloat(item.marks) || 0;
      const isPassed = marks >= exam.passMarks;

      let meritRank: number | null = null;
      let waitingRank: number | null = null;
      let admissionStatus: string = 'FAILED';
      let offerExpires: Date | null = null;

      if (isPassed) {
        meritRank = currentMeritRank;

        if (currentMeritRank <= exam.availableSeats) {
          admissionStatus = 'MERIT_OFFERED';
          offerExpires = expiresAt;
        } else {
          admissionStatus = 'WAITING_LIST';
          waitingRank = currentWaitingRank;
          currentWaitingRank++;
        }

        currentMeritRank++;
      } else {
        admissionStatus = 'FAILED';
      }

      // Upsert result
      const upserted = await db.workshopExamResult.upsert({
        where: {
          examId_registrationId: {
            examId: id,
            registrationId: item.registrationId
          }
        },
        update: {
          marks,
          isPassed,
          meritRank,
          waitingRank,
          admissionStatus,
          offerExpiresAt: offerExpires,
          examinerFeedback: item.feedback || null
        },
        create: {
          examId: id,
          registrationId: item.registrationId,
          personId: item.personId,
          marks,
          isPassed,
          meritRank,
          waitingRank,
          admissionStatus,
          offerExpiresAt: offerExpires,
          examinerFeedback: item.feedback || null
        }
      });

      results.push(upserted);
    }

    res.json({
      success: true,
      message: `Successfully graded ${results.length} examinees. Top ${Math.min(currentMeritRank - 1, exam.availableSeats)} placed on 3-day Merit Offer list.`,
      data: results
    });
  } catch (error: any) {
    console.error('Failed to submit exam results:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. POST /api/workshop-exams/:id/expire-and-release — 3-Day Expiry & Waiting List Auto-Release Engine
workshopExamsRouter.post('/:id/expire-and-release', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { forceExpireRegIds } = req.body; // Optional specific registration IDs to expire

    const exam = await db.workshopExam.findUnique({
      where: { id },
      include: {
        results: {
          orderBy: [
            { isPassed: 'desc' },
            { marks: 'desc' }
          ]
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    const now = new Date();

    // 1. Identify all expired candidates
    const expiredCandidates = exam.results.filter((r: any) => {
      if (r.admissionStatus !== 'MERIT_OFFERED') return false;
      if (forceExpireRegIds && forceExpireRegIds.includes(r.registrationId)) return true;
      if (r.offerExpiresAt && new Date(r.offerExpiresAt) <= now) return true;
      return false;
    });

    // Mark as OFFER_EXPIRED
    if (expiredCandidates.length > 0) {
      await db.workshopExamResult.updateMany({
        where: {
          examId: id,
          id: { in: expiredCandidates.map((r: any) => r.id) }
        },
        data: {
          admissionStatus: 'OFFER_EXPIRED'
        }
      });
    }

    // 2. Count currently occupied / active seats (ADMITTED + still valid MERIT_OFFERED)
    const activeAdmitted = exam.results.filter((r: any) => r.admissionStatus === 'ADMITTED').length;
    const activeMeritOffered = exam.results.filter((r: any) => 
      r.admissionStatus === 'MERIT_OFFERED' && 
      !expiredCandidates.some((e: any) => e.id === r.id)
    ).length;

    const vacantSeats = Math.max(0, exam.availableSeats - activeAdmitted - activeMeritOffered);

    // 3. Promote top waiting list candidates into the vacant seats!
    const waitingCandidates = exam.results
      .filter((r: any) => r.admissionStatus === 'WAITING_LIST')
      .sort((a: any, b: any) => (a.waitingRank || 999) - (b.waitingRank || 999));

    const newlyPromoted = waitingCandidates.slice(0, vacantSeats);

    const windowDays = exam.admissionWindowDays || 3;
    const freshExpiry = new Date();
    freshExpiry.setDate(freshExpiry.getDate() + windowDays);

    for (const cand of newlyPromoted) {
      await db.workshopExamResult.update({
        where: { id: cand.id },
        data: {
          admissionStatus: 'MERIT_OFFERED',
          offerExpiresAt: freshExpiry
        }
      });
    }

    res.json({
      success: true,
      message: `Expired ${expiredCandidates.length} seat(s). Released and offered seats to ${newlyPromoted.length} candidate(s) from Waiting List with a fresh 3-Day deadline.`,
      expiredCount: expiredCandidates.length,
      promotedCount: newlyPromoted.length,
      vacantSeats: vacantSeats - newlyPromoted.length
    });
  } catch (error: any) {
    console.error('Failed to run 3-day expiry engine:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. POST /api/workshop-exams/:id/confirm-admission — Confirm student into regular batch
workshopExamsRouter.post('/:id/confirm-admission', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { registrationId, targetBatchId } = req.body;

    if (!registrationId) {
      return res.status(400).json({ success: false, message: 'registrationId is required.' });
    }

    const exam = await db.workshopExam.findUnique({ where: { id } });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

    const result = await db.workshopExamResult.findUnique({
      where: {
        examId_registrationId: {
          examId: id,
          registrationId
        }
      },
      include: { person: true, registration: true }
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Student exam result not found.' });
    }

    // 1. Mark exam result as ADMITTED
    await db.workshopExamResult.update({
      where: { id: result.id },
      data: { admissionStatus: 'ADMITTED' }
    });

    // 2. Update Registration status to REGULAR_STUDENT
    await db.registration.update({
      where: { id: registrationId },
      data: { status: 'REGULAR_STUDENT' }
    });

    // 3. Ensure Student profile exists
    let student = await db.student.findUnique({ where: { personId: result.personId } });
    if (!student) {
      const studentCount = await db.student.count();
      const studentId = `STD-${exam.branchId ? exam.branchId.slice(0, 3).toUpperCase() : 'DHK'}-${new Date().getFullYear()}-${1001 + studentCount}`;
      
      student = await db.student.create({
        data: {
          studentId,
          personId: result.personId,
          status: 'ACTIVE'
        }
      });
    }

    // 4. Enroll into Regular Batch if provided
    if (targetBatchId) {
      await db.batchMembership.upsert({
        where: {
          studentId_batchId: {
            studentId: student.id,
            batchId: targetBatchId
          }
        },
        update: { status: 'ACTIVE' },
        create: {
          studentId: student.id,
          batchId: targetBatchId,
          status: 'ACTIVE'
        }
      });
    }

    res.json({
      success: true,
      message: `Student confirmed and admitted successfully as Regular Student.`,
      studentId: student.studentId
    });
  } catch (error: any) {
    console.error('Failed to confirm regular admission:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
