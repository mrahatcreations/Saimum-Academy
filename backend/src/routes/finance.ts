import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const financeRouter = Router();

// 1. GET /api/finance/summary (Executive Financial Dashboard Data)
financeRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const { branchName, dateRange } = req.query;

    const paymentWhere: any = {};
    const expenseWhere: any = {};

    if (branchName && branchName !== 'ALL') {
      paymentWhere.branchName = { contains: String(branchName) };
      expenseWhere.branchName = { contains: String(branchName) };
    }

    // 1. Aggregates
    const [
      totalIncomeAgg,
      totalDueAgg,
      totalExpenseAgg,
      paymentsByCategory,
      expensesByCategory,
      paymentsByMethod,
      paymentsByDept,
      recentPayments,
      recentExpenses
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: paymentWhere,
        _sum: { paidAmount: true, payableAmount: true }
      }),
      prisma.payment.aggregate({
        where: paymentWhere,
        _sum: { dueAmount: true }
      }),
      prisma.expense.aggregate({
        where: expenseWhere,
        _sum: { amount: true }
      }),
      // Income by Category
      prisma.payment.groupBy({
        by: ['category'],
        where: paymentWhere,
        _sum: { paidAmount: true, payableAmount: true },
        _count: { id: true }
      }),
      // Expenses by Category
      prisma.expense.groupBy({
        by: ['category'],
        where: expenseWhere,
        _sum: { amount: true },
        _count: { id: true }
      }),
      // Income by Payment Method
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: paymentWhere,
        _sum: { paidAmount: true },
        _count: { id: true }
      }),
      // Income by Department
      prisma.payment.groupBy({
        by: ['departmentName'],
        where: paymentWhere,
        _sum: { paidAmount: true, dueAmount: true },
        _count: { id: true }
      }),
      // Recent Payments
      prisma.payment.findMany({
        where: paymentWhere,
        orderBy: { paymentDate: 'desc' },
        take: 5
      }),
      // Recent Expenses
      prisma.expense.findMany({
        where: expenseWhere,
        orderBy: { date: 'desc' },
        take: 5
      })
    ]);

    const totalIncome = totalIncomeAgg._sum.paidAmount || 0;
    const totalPayable = totalIncomeAgg._sum.payableAmount || 0;
    const totalDue = totalDueAgg._sum.dueAmount || 0;
    const totalExpenses = totalExpenseAgg._sum.amount || 0;
    const netMargin = totalIncome - totalExpenses;
    const profitMarginPercentage = totalIncome > 0 ? Math.round((netMargin / totalIncome) * 100) : 0;

    res.json({
      success: true,
      data: {
        kpi: {
          totalIncome,
          totalPayable,
          totalDue,
          totalExpenses,
          netMargin,
          profitMarginPercentage
        },
        breakdowns: {
          incomeByCategory: paymentsByCategory.map(p => ({
            category: p.category,
            totalCollected: p._sum.paidAmount || 0,
            count: p._count.id
          })),
          expenseByCategory: expensesByCategory.map(e => ({
            category: e.category,
            totalAmount: e._sum.amount || 0,
            count: e._count.id
          })),
          incomeByMethod: paymentsByMethod.map(m => ({
            method: m.paymentMethod,
            totalCollected: m._sum.paidAmount || 0,
            count: m._count.id
          })),
          incomeByDepartment: paymentsByDept.map(d => ({
            department: d.departmentName || 'সাধারণ',
            totalCollected: d._sum.paidAmount || 0,
            totalDue: d._sum.dueAmount || 0,
            count: d._count.id
          }))
        },
        recentActivity: {
          recentPayments,
          recentExpenses
        }
      }
    });
  } catch (error: any) {
    console.error('Error calculating financial summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET /api/finance/expenses (List all expenses)
financeRouter.get('/expenses', async (req: Request, res: Response) => {
  try {
    const { category, search, branchName } = req.query;
    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = String(category);
    }
    if (branchName && branchName !== 'ALL') {
      where.branchName = { contains: String(branchName) };
    }
    if (search && String(search).trim()) {
      const q = String(search).trim();
      where.OR = [
        { expenseVoucherNo: { contains: q } },
        { title: { contains: q } },
        { paidTo: { contains: q } },
        { notes: { contains: q } }
      ];
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    res.json({ success: true, data: expenses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. POST /api/finance/expenses (Create Expense)
financeRouter.post('/expenses', async (req: Request, res: Response) => {
  try {
    const {
      title,
      category = 'OTHER',
      amount,
      paymentMethod = 'Cash / Desk',
      branchName = 'ঢাকা পল্টন শাখা',
      departmentName,
      paidTo,
      approvedBy = 'Accounts Officer',
      date,
      notes
    } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Expense Title and Amount are required.' });
    }

    // Generate Expense Voucher Number
    const lastExp = await prisma.expense.findFirst({ orderBy: { createdAt: 'desc' } });
    const currentYear = new Date().getFullYear();
    let nextNum = 1;
    if (lastExp && lastExp.expenseVoucherNo) {
      const parts = lastExp.expenseVoucherNo.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) nextNum = lastSeq + 1;
    }
    const expenseVoucherNo = `EXP-${currentYear}-${String(nextNum).padStart(5, '0')}`;

    const newExpense = await prisma.expense.create({
      data: {
        expenseVoucherNo,
        title,
        category,
        amount: Number(amount),
        paymentMethod,
        branchName,
        departmentName: departmentName || 'কেন্দ্রীয় একাডেমি',
        paidTo: paidTo || null,
        approvedBy: approvedBy || 'Admin',
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Expense voucher logged successfully.',
      data: newExpense
    });
  } catch (error: any) {
    console.error('Error logging expense:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. DELETE /api/finance/expenses/:id
financeRouter.delete('/expenses/:id', async (req: Request, res: Response) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Expense voucher deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
