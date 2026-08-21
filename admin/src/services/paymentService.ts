import { apiRequest } from './apiClient';
import type { PaymentRecord, PaymentMetrics, ExpenseRecord, FinancialSummary } from '../types/payment';

export const paymentService = {
  // 1. Fetch Payment Metrics
  async getMetrics(): Promise<PaymentMetrics> {
    const res = await apiRequest<{ success: boolean; data: PaymentMetrics }>('/payments/metrics');
    return res.data;
  },

  // 2. Fetch Payments List with filters
  async getPayments(params: {
    search?: string;
    category?: string;
    status?: string;
    paymentMethod?: string;
    departmentName?: string;
    branchName?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ payments: PaymentRecord[]; total: number }> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'ALL') query.append('category', params.category);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.paymentMethod && params.paymentMethod !== 'ALL') query.append('paymentMethod', params.paymentMethod);
    if (params.departmentName && params.departmentName !== 'ALL') query.append('departmentName', params.departmentName);
    if (params.branchName && params.branchName !== 'ALL') query.append('branchName', params.branchName);
    if (params.limit) query.append('limit', String(params.limit));
    if (params.offset) query.append('offset', String(params.offset));

    const res = await apiRequest<{
      success: boolean;
      data: PaymentRecord[];
      meta: { total: number };
    }>(`/payments?${query.toString()}`);

    return {
      payments: res.data,
      total: res.meta.total
    };
  },

  // 3. Create / Collect Payment Voucher
  async createPayment(data: {
    studentId?: string;
    studentName: string;
    studentPhone?: string;
    studentPhoto?: string;
    departmentName?: string;
    branchName?: string;
    category: string;
    month?: string;
    amount: number;
    discountAmount?: number;
    paidAmount: number;
    paymentMethod: string;
    trxId?: string;
    remarks?: string;
  }): Promise<PaymentRecord> {
    const res = await apiRequest<{ success: boolean; data: PaymentRecord }>('/payments', {
      method: 'POST',
      data
    });
    return res.data;
  },

  // 4. Update Payment
  async updatePayment(id: string, data: Partial<PaymentRecord>): Promise<PaymentRecord> {
    const res = await apiRequest<{ success: boolean; data: PaymentRecord }>(`/payments/${id}`, {
      method: 'PATCH',
      data
    });
    return res.data;
  },

  // 5. Delete Payment
  async deletePayment(id: string): Promise<void> {
    await apiRequest(`/payments/${id}`, { method: 'DELETE' });
  },

  // 6. Fetch Financial Summary (Executive Dashboard)
  async getFinancialSummary(params: { branchName?: string; dateRange?: string } = {}): Promise<FinancialSummary> {
    const query = new URLSearchParams();
    if (params.branchName && params.branchName !== 'ALL') query.append('branchName', params.branchName);
    if (params.dateRange) query.append('dateRange', params.dateRange);

    const res = await apiRequest<{ success: boolean; data: FinancialSummary }>(`/finance/summary?${query.toString()}`);
    return res.data;
  },

  // 7. Fetch Expenses List
  async getExpenses(params: { category?: string; search?: string; branchName?: string } = {}): Promise<ExpenseRecord[]> {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'ALL') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.branchName && params.branchName !== 'ALL') query.append('branchName', params.branchName);

    const res = await apiRequest<{ success: boolean; data: ExpenseRecord[] }>(`/finance/expenses?${query.toString()}`);
    return res.data;
  },

  // 8. Create Expense Voucher
  async createExpense(data: {
    title: string;
    category: string;
    amount: number;
    paymentMethod: string;
    branchName?: string;
    departmentName?: string;
    paidTo?: string;
    approvedBy?: string;
    date: string;
    notes?: string;
  }): Promise<ExpenseRecord> {
    const res = await apiRequest<{ success: boolean; data: ExpenseRecord }>('/finance/expenses', {
      method: 'POST',
      data
    });
    return res.data;
  },

  // 9. Delete Expense
  async deleteExpense(id: string): Promise<void> {
    await apiRequest(`/finance/expenses/${id}`, { method: 'DELETE' });
  }
};
