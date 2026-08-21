import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const paymentsRouter = Router();

// 1. GET /api/payments/metrics
paymentsRouter.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const totalCollected = await prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { paidAmount: true }
    });

    const totalDue = await prisma.payment.aggregate({
      _sum: { dueAmount: true }
    });

    const admissionCollected = await prisma.payment.aggregate({
      where: { category: 'ADMISSION_FEE', status: 'PAID' },
      _sum: { paidAmount: true }
    });

    const tuitionCollected = await prisma.payment.aggregate({
      where: { category: 'MONTHLY_TUITION', status: 'PAID' },
      _sum: { paidAmount: true }
    });

    const totalVouchersCount = await prisma.payment.count();
    const paidCount = await prisma.payment.count({ where: { status: 'PAID' } });
    const dueCount = await prisma.payment.count({ where: { status: 'DUE' } });

    res.json({
      success: true,
      data: {
        totalCollected: totalCollected._sum.paidAmount || 0,
        totalDue: totalDue._sum.dueAmount || 0,
        admissionCollected: admissionCollected._sum.paidAmount || 0,
        tuitionCollected: tuitionCollected._sum.paidAmount || 0,
        totalVouchersCount,
        paidCount,
        dueCount
      }
    });
  } catch (error: any) {
    console.error('Error fetching payment metrics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET /api/payments (with filtering, search, pagination)
paymentsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      status,
      paymentMethod,
      departmentName,
      branchName,
      limit = '50',
      offset = '0'
    } = req.query;

    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = String(category);
    }

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = String(paymentMethod);
    }

    if (departmentName && departmentName !== 'ALL') {
      where.departmentName = { contains: String(departmentName) };
    }

    if (branchName && branchName !== 'ALL') {
      where.branchName = { contains: String(branchName) };
    }

    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [
        { voucherNo: { contains: q } },
        { studentName: { contains: q } },
        { studentId: { contains: q } },
        { studentPhone: { contains: q } },
        { trxId: { contains: q } },
        { remarks: { contains: q } }
      ];
    }

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        orderBy: { paymentDate: 'desc' },
        take: parseInt(String(limit), 10),
        skip: parseInt(String(offset), 10)
      })
    ]);

    res.json({
      success: true,
      data: payments,
      meta: {
        total,
        limit: parseInt(String(limit), 10),
        offset: parseInt(String(offset), 10)
      }
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. POST /api/payments (Collect Fee / Create Voucher)
paymentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      studentName,
      studentPhone,
      studentPhoto,
      departmentName,
      branchName,
      category,
      month,
      amount,
      discountAmount = 0,
      paidAmount,
      paymentMethod = 'Cash / Desk',
      trxId,
      status = 'PAID',
      collectedBy = 'Accounts Officer',
      remarks
    } = req.body;

    if (!studentName || amount === undefined || paidAmount === undefined) {
      return res.status(400).json({ success: false, message: 'Student Name, Amount and Paid Amount are required.' });
    }

    const payableAmount = Math.max(0, Number(amount) - Number(discountAmount));
    const dueAmount = Math.max(0, payableAmount - Number(paidAmount));
    const finalStatus = dueAmount === 0 ? 'PAID' : (Number(paidAmount) > 0 ? 'PARTIAL' : 'DUE');

    // Generate next voucher number
    const lastPayment = await prisma.payment.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    const currentYear = new Date().getFullYear();
    let nextNum = 1;
    if (lastPayment && lastPayment.voucherNo) {
      const parts = lastPayment.voucherNo.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) nextNum = lastSeq + 1;
    }
    const voucherNo = `VCH-${currentYear}-${String(nextNum).padStart(5, '0')}`;

    const newPayment = await prisma.payment.create({
      data: {
        voucherNo,
        studentId: studentId || null,
        studentName,
        studentPhone: studentPhone || null,
        studentPhoto: studentPhoto || null,
        departmentName: departmentName || 'সাধারণ বিভাগ',
        branchName: branchName || 'ঢাকা পল্টন শাখা',
        category: category || 'MONTHLY_TUITION',
        month: month || null,
        amount: Number(amount),
        discountAmount: Number(discountAmount),
        payableAmount,
        paidAmount: Number(paidAmount),
        dueAmount,
        paymentMethod,
        trxId: trxId || null,
        status: finalStatus,
        collectedBy,
        remarks: remarks || null,
        paymentDate: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment voucher created successfully.',
      data: newPayment
    });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. GET /api/payments/:id
paymentsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id }
    });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment voucher not found.' });
    }
    res.json({ success: true, data: payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. PATCH /api/payments/:id
paymentsRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { paidAmount, status, paymentMethod, trxId, remarks } = req.body;
    const existing = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Payment not found.' });

    let updateData: any = {};
    if (paidAmount !== undefined) {
      const newPaid = Number(paidAmount);
      const newDue = Math.max(0, existing.payableAmount - newPaid);
      updateData.paidAmount = newPaid;
      updateData.dueAmount = newDue;
      updateData.status = newDue === 0 ? 'PAID' : (newPaid > 0 ? 'PARTIAL' : 'DUE');
    }
    if (status) updateData.status = status;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (trxId !== undefined) updateData.trxId = trxId;
    if (remarks !== undefined) updateData.remarks = remarks;

    const updated = await prisma.payment.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ success: true, message: 'Payment updated successfully.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. DELETE /api/payments/:id
paymentsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.payment.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Payment voucher deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
