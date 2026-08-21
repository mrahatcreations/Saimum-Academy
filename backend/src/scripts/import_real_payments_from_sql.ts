import { prisma } from '../prisma';
import { extractSqlUsers } from './importAllSqlData';
import { extractSqlPayments } from './parse_real_payments';

export async function importAllRealPaymentsFromSql() {
  console.log('🚀 Importing 100% REAL Payments from saimumor_academy.sql...\n');

  // 1. Clear previous payments
  await prisma.payment.deleteMany();

  // 2. Extract SQL data
  const sqlUsers = extractSqlUsers();
  const sqlPayments = extractSqlPayments();

  console.log(`Loaded ${sqlUsers.length} SQL users and ${sqlPayments.length} SQL payments.`);

  // Build lookup maps for users
  const userMap = new Map<string, any>();
  sqlUsers.forEach(u => userMap.set(String(u.id), u));

  // Department mapping (Laravel ID -> Name)
  const deptNameMap: Record<string, string> = {
    '1': 'শিশু বিভাগ',
    '2': 'সঙ্গীত বিভাগ',
    '3': 'থিয়েটার বিভাগ',
    '4': 'ক্বিরাত বিভাগ',
    '5': 'আবৃত্তি ও উপস্থাপনা বিভাগ',
    '6': 'সঙ্গীত বিভাগ' // Juvenile merged into Songit
  };

  // Month names
  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Map to Prisma Payment model
  const paymentCreates: any[] = [];

  for (const sp of sqlPayments) {
    const user = userMap.get(String(sp.user_id));
    const userName = user ? (user.name || user.name_bn || 'Student') : `User #${sp.user_id}`;
    const userPhone = user ? user.phone : null;
    const userStudentId = user ? user.student_id : null;
    const userPhoto = user ? user.profile_photo_path : null;

    let deptName = 'সাধারণ বিভাগ';
    if (sp.department_id && deptNameMap[String(sp.department_id)]) {
      deptName = deptNameMap[String(sp.department_id)];
    } else if (user && user.student_department) {
      const depts = user.student_department.split(',').map((d: string) => d.trim());
      if (depts.includes('KIDS')) deptName = 'শিশু বিভাগ';
      else if (depts.includes('Songit') || depts.includes('Juvenile')) deptName = 'সঙ্গীত বিভাগ';
      else if (depts.includes('Theatre')) deptName = 'থিয়েটার বিভাগ';
      else if (depts.includes('Qiraat')) deptName = 'ক্বিরাত বিভাগ';
      else if (depts.includes('Recitation')) deptName = 'আবৃত্তি ও উপস্থাপনা বিভাগ';
    }

    // Exact Category mapping matching legacy academy structure
    let category = 'OTHER';
    if (sp.type === 'monthly' || (sp.label && sp.label.includes('মাসিক'))) {
      category = 'MONTHLY_TUITION';
    } else if (sp.label && (sp.label.includes('প্রস্তুতিপর্ব') || sp.label.includes('প্রশিক্ষণ') || sp.label.includes('কর্মশালা'))) {
      category = 'WORKSHOP_FEE';
    } else if (sp.type === 'registration' || (sp.label && sp.label.includes('রেজিস্ট্রেশন'))) {
      category = 'REGISTRATION_FEE';
    } else if (sp.type === 'admission' || (sp.label && sp.label.includes('ভর্তি ফি'))) {
      category = 'ADMISSION_FEE';
    }

    // Status mapping
    // 0: Due/Pending, 1: Approved/Paid, 2: Paid/Success, 3: Cancelled/Refunded
    let status = 'DUE';
    if (sp.status === '1' || sp.status === '2' || (sp.paid_at && sp.paid_at !== 'null')) {
      status = 'PAID';
    } else if (sp.status === '3') {
      status = 'REFUNDED';
    }

    const rawAmount = parseFloat(sp.amount) || 0;
    const originalAmount = parseFloat(sp.original_amount || sp.amount) || rawAmount;
    const discountAmount = parseFloat(sp.discount_amount) || 0;
    const lateFeeAmount = parseFloat(sp.late_fee_amount) || 0;
    const payableAmount = Math.max(0, originalAmount - discountAmount + lateFeeAmount);
    
    let paidAmount = 0;
    let dueAmount = payableAmount;
    if (status === 'PAID') {
      paidAmount = payableAmount > 0 ? payableAmount : rawAmount;
      dueAmount = 0;
    }

    // Billing Month string
    let monthStr = null;
    if (sp.period_year && sp.period_month) {
      const mIdx = parseInt(sp.period_month, 10);
      const mName = (mIdx >= 1 && mIdx <= 12) ? monthNames[mIdx] : `Month ${sp.period_month}`;
      monthStr = `${mName} ${sp.period_year}`;
    } else if (category === 'REGISTRATION_FEE') {
      monthStr = 'Application Circular';
    } else if (category === 'ADMISSION_FEE') {
      monthStr = 'Department Enrollment';
    } else if (category === 'WORKSHOP_FEE') {
      monthStr = 'Preparation Training';
    }

    // Method normalization
    let method = sp.method || 'Not Specified';
    if (method === 'Easypay' || method === 'SSLCommerz') {
      method = sp.transaction_id?.startsWith('BK') ? 'bKash' : (sp.transaction_id?.startsWith('NG') ? 'Nagad' : method);
    }

    // Dates
    let paymentDate = new Date();
    if (sp.paid_at && sp.paid_at !== 'null') {
      paymentDate = new Date(sp.paid_at);
    } else if (sp.created_at && sp.created_at !== 'null') {
      paymentDate = new Date(sp.created_at);
    }

    const voucherNo = `VCH-${String(sp.id).padStart(6, '0')}`;

    paymentCreates.push({
      voucherNo,
      studentId: userStudentId || null,
      studentName: userName,
      studentPhone: userPhone || null,
      studentPhoto: userPhoto || null,
      departmentName: deptName,
      branchName: 'ঢাকা পল্টন শাখা',
      category,
      month: monthStr,
      amount: originalAmount,
      discountAmount,
      payableAmount,
      paidAmount,
      dueAmount,
      paymentMethod: method,
      trxId: sp.transaction_id || sp.tracking_number || null,
      status,
      collectedBy: sp.received_by_agent_id ? `Agent #${sp.received_by_agent_id}` : (sp.verified_by_officer_id ? `Officer #${sp.verified_by_officer_id}` : 'Central Online Gateway'),
      remarks: sp.notes || sp.label || null,
      paymentDate,
      createdAt: sp.created_at ? new Date(sp.created_at) : new Date()
    });
  }

  console.log(`Inserting ${paymentCreates.length} 100% REAL payment records into database...`);

  const chunkSize = 200;
  for (let i = 0; i < paymentCreates.length; i += chunkSize) {
    const chunk = paymentCreates.slice(i, i + chunkSize);
    await prisma.payment.createMany({ data: chunk });
  }

  // Count by category
  const categoryCounts = await prisma.payment.groupBy({
    by: ['category'],
    _count: { id: true },
    _sum: { paidAmount: true }
  });

  console.log('\n--- Real Category Distribution ---');
  categoryCounts.forEach(c => {
    console.log(` - ${c.category}: ${c._count.id} records (Paid: ৳${c._sum.paidAmount?.toLocaleString()})`);
  });

  console.log('\n======================================================');
  console.log('🎉 REAL PAYMENTS SYNCED WITH EXACT CATEGORIES!');
  console.log('======================================================\n');
}

if (require.main === module) {
  importAllRealPaymentsFromSql()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
