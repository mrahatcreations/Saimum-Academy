export interface PaymentRecord {
  id: string;
  voucherNo: string;
  studentId?: string | null;
  studentName: string;
  studentPhone?: string | null;
  studentPhoto?: string | null;
  departmentName?: string | null;
  branchName?: string | null;
  category: 'ADMISSION_FEE' | 'MONTHLY_TUITION' | 'WORKSHOP_FEE' | 'ID_CARD_FEE' | 'CERTIFICATE_FEE' | 'OTHER';
  month?: string | null;
  amount: number;
  discountAmount: number;
  payableAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Cash / Desk' | 'Bank Transfer';
  trxId?: string | null;
  status: 'PAID' | 'PARTIAL' | 'DUE' | 'REFUNDED';
  collectedBy?: string | null;
  remarks?: string | null;
  paymentDate: string;
  createdAt: string;
}

export interface PaymentMetrics {
  totalCollected: number;
  totalDue: number;
  admissionCollected: number;
  tuitionCollected: number;
  totalVouchersCount: number;
  paidCount: number;
  dueCount: number;
}

export interface ExpenseRecord {
  id: string;
  expenseVoucherNo: string;
  title: string;
  category: 'VENUE_RENT' | 'HONORARIUM' | 'EQUIPMENT' | 'PRINTING' | 'UTILITY' | 'REFRESHMENT' | 'OTHER';
  amount: number;
  paymentMethod: string;
  branchName?: string | null;
  departmentName?: string | null;
  paidTo?: string | null;
  approvedBy?: string | null;
  date: string;
  notes?: string | null;
  receiptUrl?: string | null;
  createdAt: string;
}

export interface FinancialSummary {
  kpi: {
    totalIncome: number;
    totalPayable: number;
    totalDue: number;
    totalExpenses: number;
    netMargin: number;
    profitMarginPercentage: number;
  };
  breakdowns: {
    incomeByCategory: { category: string; totalCollected: number; count: number }[];
    expenseByCategory: { category: string; totalAmount: number; count: number }[];
    incomeByMethod: { method: string; totalCollected: number; count: number }[];
    incomeByDepartment: { department: string; totalCollected: number; totalDue: number; count: number }[];
  };
  recentActivity: {
    recentPayments: PaymentRecord[];
    recentExpenses: ExpenseRecord[];
  };
}
