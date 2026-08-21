import { prisma } from '../prisma';

export async function seedInitialPaymentsAndExpenses() {
  console.log('🚀 Seeding initial Payments and Expenses into database...\n');

  // 1. Clear previous sample payments/expenses if needed
  await prisma.payment.deleteMany();
  await prisma.expense.deleteMany();

  // 2. Fetch all registrations to generate admission fee payments
  const registrations = await prisma.registration.findMany({
    include: {
      person: {
        include: {
          studentProfile: true
        }
      },
      branch: true
    }
  });

  const depts = await prisma.department.findMany();
  const deptMap = new Map(depts.map(d => [d.id, d.name]));

  const paymentMethods = ['bKash', 'Nagad', 'Rocket', 'Cash / Desk', 'bKash', 'bKash'];

  console.log(`Generating Admission Fee Payments for ${registrations.length} registrations...`);

  let vchIndex = 1;
  const paymentCreates: any[] = [];

  for (const reg of registrations) {
    const p = reg.person;
    const vchNo = `VCH-2026-${String(vchIndex).padStart(5, '0')}`;
    const method = paymentMethods[vchIndex % paymentMethods.length];
    const deptName = deptMap.get(reg.departmentId) || 'সাধারণ বিভাগ';
    const amount = reg.paymentAmount || 200;

    paymentCreates.push({
      voucherNo: vchNo,
      studentId: p.studentProfile?.studentId || null,
      studentName: p.fullNameEn,
      studentPhone: p.phone,
      studentPhoto: p.photoUrl,
      departmentName: deptName,
      branchName: reg.branch?.name || 'ঢাকা পল্টন শাখা',
      category: 'ADMISSION_FEE',
      month: 'Admission 2026',
      amount: amount,
      discountAmount: 0,
      payableAmount: amount,
      paidAmount: amount,
      dueAmount: 0,
      paymentMethod: method,
      trxId: method !== 'Cash / Desk' ? `TRX${Math.floor(100000000 + Math.random() * 900000000)}` : null,
      status: 'PAID',
      collectedBy: 'Central Admission Desk',
      remarks: `Admission Application Fee (${reg.registrationNo})`,
      paymentDate: reg.paymentDate || new Date(),
      createdAt: reg.createdAt || new Date()
    });

    vchIndex++;
  }

  // 3. Generate Monthly Tuition Fee Payments for 351 Regular Students (January & February 2026)
  const regularStudents = await prisma.student.findMany({
    include: {
      person: true,
      batchMemberships: {
        include: {
          batch: {
            include: {
              branchSubject: {
                include: {
                  departmentBranch: {
                    include: {
                      department: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  console.log(`Generating Monthly Tuition Vouchers for ${regularStudents.length} regular students...`);

  for (const s of regularStudents) {
    const p = s.person;
    const deptName = s.batchMemberships[0]?.batch?.branchSubject?.departmentBranch?.department?.name || 'সঙ্গীত বিভাগ';
    const tuitionAmount = 500;

    // January 2026 Tuition (Paid)
    paymentCreates.push({
      voucherNo: `VCH-2026-${String(vchIndex++).padStart(5, '0')}`,
      studentId: s.studentId,
      studentName: p.fullNameEn,
      studentPhone: p.phone,
      studentPhoto: p.photoUrl,
      departmentName: deptName,
      branchName: 'ঢাকা পল্টন শাখা',
      category: 'MONTHLY_TUITION',
      month: 'January 2026',
      amount: tuitionAmount,
      discountAmount: 0,
      payableAmount: tuitionAmount,
      paidAmount: tuitionAmount,
      dueAmount: 0,
      paymentMethod: vchIndex % 2 === 0 ? 'bKash' : 'Cash / Desk',
      trxId: vchIndex % 2 === 0 ? `BK${Math.floor(10000000 + Math.random() * 90000000)}` : null,
      status: 'PAID',
      collectedBy: 'Accounts Officer',
      remarks: `Regular Monthly Tuition Fee - January 2026`,
      paymentDate: new Date('2026-01-10'),
      createdAt: new Date('2026-01-10')
    });

    // February 2026 Tuition (Some Paid, Some Due)
    const isPaid = (vchIndex % 5) !== 0; // 80% paid, 20% due
    paymentCreates.push({
      voucherNo: `VCH-2026-${String(vchIndex++).padStart(5, '0')}`,
      studentId: s.studentId,
      studentName: p.fullNameEn,
      studentPhone: p.phone,
      studentPhoto: p.photoUrl,
      departmentName: deptName,
      branchName: 'ঢাকা পল্টন শাখা',
      category: 'MONTHLY_TUITION',
      month: 'February 2026',
      amount: tuitionAmount,
      discountAmount: 0,
      payableAmount: tuitionAmount,
      paidAmount: isPaid ? tuitionAmount : 0,
      dueAmount: isPaid ? 0 : tuitionAmount,
      paymentMethod: isPaid ? (vchIndex % 3 === 0 ? 'Nagad' : 'bKash') : 'Cash / Desk',
      trxId: isPaid ? `NG${Math.floor(10000000 + Math.random() * 90000000)}` : null,
      status: isPaid ? 'PAID' : 'DUE',
      collectedBy: 'Accounts Officer',
      remarks: `Regular Monthly Tuition Fee - February 2026`,
      paymentDate: isPaid ? new Date('2026-02-12') : new Date('2026-02-01'),
      createdAt: new Date('2026-02-01')
    });
  }

  // Bulk insert in chunks
  console.log(`Inserting ${paymentCreates.length} total payment records...`);
  const chunkSize = 100;
  for (let i = 0; i < paymentCreates.length; i += chunkSize) {
    const chunk = paymentCreates.slice(i, i + chunkSize);
    await prisma.payment.createMany({ data: chunk });
  }

  // 4. Generate Operational Expenses
  const expensesData = [
    {
      expenseVoucherNo: 'EXP-2026-0001',
      title: 'Workshop Central Auditorium Rent (January)',
      category: 'VENUE_RENT',
      amount: 35000,
      paymentMethod: 'Bank Transfer',
      branchName: 'ঢাকা পল্টন শাখা',
      departmentName: 'কেন্দ্রীয় একাডেমি',
      paidTo: 'Paltan Community Centre Authority',
      approvedBy: 'Director General',
      date: '2026-01-05',
      notes: 'Main auditorium booking for 4-day intensive workshop.'
    },
    {
      expenseVoucherNo: 'EXP-2026-0002',
      title: 'Senior Guest Instructor Honorarium (Vocal Music Masterclass)',
      category: 'HONORARIUM',
      amount: 20000,
      paymentMethod: 'bKash',
      branchName: 'ঢাকা পল্টন শাখা',
      departmentName: 'সঙ্গীত বিভাগ',
      paidTo: 'Ustad Mustafa Zaman',
      approvedBy: 'Academic Director',
      date: '2026-01-15',
      notes: 'Masterclass honorarium for 2 practical sessions.'
    },
    {
      expenseVoucherNo: 'EXP-2026-0003',
      title: 'Professional Sound System & Microphone Rental',
      category: 'EQUIPMENT',
      amount: 15000,
      paymentMethod: 'Cash / Desk',
      branchName: 'ঢাকা পল্টন শাখা',
      departmentName: 'কেন্দ্রীয় একাডেমি',
      paidTo: 'Dhaka Sound Lab',
      approvedBy: 'Admin Officer',
      date: '2026-01-20',
      notes: '4 Wireless Microphones, Mixer & Monitor Speaker rent.'
    },
    {
      expenseVoucherNo: 'EXP-2026-0004',
      title: 'ID Cards, Lanyards & Registration Booklet Printing',
      category: 'PRINTING',
      amount: 18500,
      paymentMethod: 'Cash / Desk',
      branchName: 'ঢাকা পল্টন শাখা',
      departmentName: 'কেন্দ্রীয় একাডেমি',
      paidTo: 'Classic Press & Media',
      approvedBy: 'Accounts Officer',
      date: '2026-01-25',
      notes: 'Plastic Smart ID Cards and Academy printed notebooks for new students.'
    },
    {
      expenseVoucherNo: 'EXP-2026-0005',
      title: 'Office Electricity, Internet & Studio Utilities (Jan 2026)',
      category: 'UTILITY',
      amount: 12000,
      paymentMethod: 'bKash',
      branchName: 'ঢাকা পল্টন শাখা',
      departmentName: 'কেন্দ্রীয় একাডেমি',
      paidTo: 'DESCO & AmberIT ISP',
      approvedBy: 'Accounts Officer',
      date: '2026-01-31',
      notes: 'Dedicated 50 Mbps optic fiber line and studio power bills.'
    },
    {
      expenseVoucherNo: 'EXP-2026-0006',
      title: 'Workshop Student Refreshments & Snacks',
      category: 'REFRESHMENT',
      amount: 14500,
      paymentMethod: 'Cash / Desk',
      branchName: 'ঢাকা পল্টন শাখা',
      departmentName: 'শিশু বিভাগ',
      paidTo: 'Banoful Bakery & Sweets',
      approvedBy: 'Department Coordinator',
      date: '2026-02-08',
      notes: 'Snack boxes and juice for Kids Cultural Workshop participants.'
    },
    {
      expenseVoucherNo: 'EXP-2026-0007',
      title: 'Drama & Theatre Props and Costume Materials',
      category: 'EQUIPMENT',
      amount: 9500,
      paymentMethod: 'Cash / Desk',
      branchName: 'ঢাকা পল্টন শাখা',
      departmentName: 'থিয়েটার বিভাগ',
      paidTo: 'Dhaka Stage Arts',
      approvedBy: 'Department Director',
      date: '2026-02-14',
      notes: 'Stage makeup, lighting filters, and acting rehearsal accessories.'
    }
  ];

  await prisma.expense.createMany({ data: expensesData });

  // 5. Output metrics
  const totalIncome = await prisma.payment.aggregate({ _sum: { paidAmount: true } });
  const totalDue = await prisma.payment.aggregate({ _sum: { dueAmount: true } });
  const totalExpense = await prisma.expense.aggregate({ _sum: { amount: true } });

  console.log('\n======================================================');
  console.log('🎉 FINANCE & PAYMENTS SEEDED SUCCESSFULLY!');
  console.log(`💳 Total Payments Recorded: ${paymentCreates.length}`);
  console.log(`💵 Total Collections: ৳${totalIncome._sum.paidAmount?.toLocaleString()}`);
  console.log(`⏳ Total Outstanding Due: ৳${totalDue._sum.dueAmount?.toLocaleString()}`);
  console.log(`📉 Total Expenses: ৳${totalExpense._sum.amount?.toLocaleString()}`);
  console.log(`📈 Net Surplus / Margin: ৳${((totalIncome._sum.paidAmount || 0) - (totalExpense._sum.amount || 0)).toLocaleString()}`);
  console.log('======================================================\n');
}

if (require.main === module) {
  seedInitialPaymentsAndExpenses()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
