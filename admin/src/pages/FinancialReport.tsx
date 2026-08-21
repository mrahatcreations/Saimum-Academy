import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Download, 
  Printer, 
  Plus, 
  Receipt,
  CheckCircle,
  Clock
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { MetricsStrip, type MetricItem } from '../components/ui/MetricsStrip';
import { SubNavTabs } from '../components/ui/SubNavTabs';
import { CustomSelect } from '../components/ui/CustomSelect';
import { StatusBadge } from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import TableActionMenu from '../components/ui/TableActionMenu';
import { paymentService } from '../services/paymentService';
import type { FinancialSummary, ExpenseRecord } from '../types/payment';
import styles from './FinancialReport.module.css';

export default function FinancialReport() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    title: '',
    category: 'HONORARIUM',
    amount: 10000,
    paymentMethod: 'Cash / Desk',
    branchName: 'ঢাকা পল্টন শাখা',
    departmentName: 'কেন্দ্রীয় একাডেমি',
    paidTo: '',
    approvedBy: 'Admin',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const loadData = async () => {
    try {
      const [resSummary, resExpenses] = await Promise.all([
        paymentService.getFinancialSummary(),
        paymentService.getExpenses()
      ]);
      setSummary(resSummary);
      setExpenses(resExpenses);
    } catch (err) {
      console.error('Failed to load financial report:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Top KPI Metric Cards
  const metricItems: MetricItem[] = useMemo(() => {
    if (!summary) return [];
    const { kpi } = summary;
    return [
      {
        id: 'total_revenue',
        label: 'Total Revenue Collections',
        value: `৳${kpi.totalIncome.toLocaleString()}`,
        badge: 'Cash Inflow',
        badgeVariant: 'success',
        icon: <TrendingUp size={18} />
      },
      {
        id: 'total_expenses',
        label: 'Total Operational Expenses',
        value: `৳${kpi.totalExpenses.toLocaleString()}`,
        badge: 'Cash Outflow',
        badgeVariant: 'danger',
        icon: <TrendingDown size={18} />
      },
      {
        id: 'net_margin',
        label: 'Net Surplus / Profit',
        value: `৳${kpi.netMargin.toLocaleString()}`,
        badge: `${kpi.profitMarginPercentage}% Margin`,
        badgeVariant: 'purple',
        icon: <DollarSign size={18} />
      },
      {
        id: 'uncollected_due',
        label: 'Uncollected Due Fees',
        value: `৳${kpi.totalDue.toLocaleString()}`,
        badge: 'Receivables',
        badgeVariant: kpi.totalDue > 0 ? 'warning' : 'neutral',
        icon: <Clock size={18} />
      }
    ];
  }, [summary]);

  const handleCreateExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseFormData.title || !expenseFormData.amount) {
      alert('Please fill in required fields.');
      return;
    }
    try {
      await paymentService.createExpense(expenseFormData);
      setIsExpenseModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to log expense.');
    }
  };

  const navTabs = [
    { id: 'overview', label: 'Executive Overview', badge: 'Financials' },
    { id: 'departments', label: 'Department Collections', badge: `${summary?.breakdowns.incomeByDepartment.length || 0} Depts` },
    { id: 'expenses', label: 'Expense Management Log', badge: `${expenses.length} Records` }
  ];

  return (
    <div className={styles.container}>
      {/* 1. Page Header */}
      <PageHeader
        title="Financial Reports & Executive Accounts"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<Printer size={15} />}
              onClick={() => window.print()}
            >
              Print Report
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={15} />}
              onClick={() => alert('Exporting Executive Financial Spreadsheet...')}
            >
              Export Spreadsheet
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={15} />}
              onClick={() => {
                setExpenseFormData({
                  title: '',
                  category: 'HONORARIUM',
                  amount: 5000,
                  paymentMethod: 'Cash / Desk',
                  branchName: 'ঢাকা পল্টন শাখা',
                  departmentName: 'কেন্দ্রীয় একাডেমি',
                  paidTo: '',
                  approvedBy: 'Admin',
                  date: new Date().toISOString().split('T')[0],
                  notes: ''
                });
                setIsExpenseModalOpen(true);
              }}
            >
              + Log Expense
            </Button>
          </>
        }
      />

      {/* 2. Top KPI Metrics */}
      {metricItems.length > 0 && <MetricsStrip metrics={metricItems} />}

      {/* 3. Sub Navigation Tabs */}
      <SubNavTabs
        tabs={navTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Executive Overview */}
      {activeTab === 'overview' && summary && (
        <div className={styles.dashboardGrid}>
          {/* Revenue Stream Breakdown Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Receipt size={18} color="var(--color-primary)" />
                <span>Revenue Streams by Category</span>
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-success)' }}>
                Total: ৳{summary.kpi.totalIncome.toLocaleString()}
              </span>
            </div>

            <div className={styles.breakdownList}>
              {summary.breakdowns.incomeByCategory.map(item => {
                const percentage = summary.kpi.totalIncome > 0 
                  ? Math.round((item.totalCollected / summary.kpi.totalIncome) * 100) 
                  : 0;

                return (
                  <div key={item.category} className={styles.breakdownItem}>
                    <div className={styles.breakdownHeader}>
                      <span className={styles.breakdownName}>{item.category.replace('_', ' ')}</span>
                      <span className={styles.breakdownValue}>
                        ৳{item.totalCollected.toLocaleString()} ({percentage}%)
                      </span>
                    </div>
                    <div className={styles.progressBarTrack}>
                      <div 
                        className={styles.progressBarFill} 
                        style={{ width: `${percentage}%`, background: 'var(--color-primary)' }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Gateway Distribution Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <CreditCard size={18} color="var(--color-primary)" />
                <span>Collections by Payment Gateway</span>
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Channels
              </span>
            </div>

            <div className={styles.breakdownList}>
              {summary.breakdowns.incomeByMethod.map(item => {
                const percentage = summary.kpi.totalIncome > 0 
                  ? Math.round((item.totalCollected / summary.kpi.totalIncome) * 100) 
                  : 0;

                return (
                  <div key={item.method} className={styles.breakdownItem}>
                    <div className={styles.breakdownHeader}>
                      <span className={styles.breakdownName}>{item.method}</span>
                      <span className={styles.breakdownValue}>
                        ৳{item.totalCollected.toLocaleString()} ({percentage}%)
                      </span>
                    </div>
                    <div className={styles.progressBarTrack}>
                      <div 
                        className={styles.progressBarFill} 
                        style={{ 
                          width: `${percentage}%`, 
                          background: item.method === 'bKash' ? '#e2136e' : item.method === 'Nagad' ? '#f7941d' : 'var(--color-success)' 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Department Revenue Breakdown */}
      {activeTab === 'departments' && summary && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Department</th>
                  <th className={styles.th}>Total Vouchers</th>
                  <th className={styles.th}>Collected Revenue (BDT)</th>
                  <th className={styles.th}>Uncollected Due (BDT)</th>
                  <th className={styles.th}>Collection Efficiency</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.breakdowns.incomeByDepartment.map(dept => {
                  const totalPayable = dept.totalCollected + dept.totalDue;
                  const efficiency = totalPayable > 0 
                    ? Math.round((dept.totalCollected / totalPayable) * 100) 
                    : 100;

                  return (
                    <tr key={dept.department} className={styles.tr}>
                      <td className={styles.td} style={{ fontWeight: 700 }}>
                        {dept.department}
                      </td>
                      <td className={styles.td}>
                        {dept.count} Vouchers
                      </td>
                      <td className={styles.td} style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                        ৳{dept.totalCollected.toLocaleString()}
                      </td>
                      <td className={styles.td} style={{ fontWeight: 600, color: dept.totalDue > 0 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                        ৳{dept.totalDue.toLocaleString()}
                      </td>
                      <td className={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className={styles.progressBarTrack} style={{ width: '100px' }}>
                            <div 
                              className={styles.progressBarFill} 
                              style={{ width: `${efficiency}%`, background: efficiency > 90 ? 'var(--color-success)' : 'var(--color-primary)' }} 
                            />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{efficiency}%</span>
                        </div>
                      </td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <StatusBadge status={efficiency >= 90 ? 'PAID' : 'PARTIAL'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Expense Management Log */}
      {activeTab === 'expenses' && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Expense Voucher</th>
                  <th className={styles.th}>Expense Title & Category</th>
                  <th className={styles.th}>Department / Branch</th>
                  <th className={styles.th}>Paid To / Vendor</th>
                  <th className={styles.th}>Amount (BDT)</th>
                  <th className={styles.th}>Payment Method</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.td} style={{ textAlign: 'center', padding: '40px' }}>
                      No expenses logged yet.
                    </td>
                  </tr>
                ) : (
                  expenses.map(exp => (
                    <tr key={exp.id} className={styles.tr}>
                      <td className={styles.td}>
                        <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-danger)' }}>
                          {exp.expenseVoucherNo}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600 }}>{exp.title}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {exp.category.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{exp.departmentName || 'Central'}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.branchName}</span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontWeight: 500 }}>{exp.paidTo || 'N/A'}</span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '0.95rem' }}>
                          -৳{exp.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{exp.paymentMethod}</span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{exp.date}</span>
                      </td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <TableActionMenu
                          items={[
                            {
                              label: 'Delete Expense',
                              variant: 'danger',
                              onClick: async () => {
                                if (confirm(`Are you sure you want to delete ${exp.expenseVoucherNo}?`)) {
                                  await paymentService.deleteExpense(exp.id);
                                  loadData();
                                }
                              }
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Log New Expense */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Log Operational Expense Voucher"
        size="lg"
      >
        <form onSubmit={handleCreateExpenseSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Expense Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Workshop Hall Rental"
              className={styles.input}
              value={expenseFormData.title}
              onChange={e => setExpenseFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Expense Category *</label>
            <CustomSelect
              value={expenseFormData.category}
              onChange={val => setExpenseFormData(prev => ({ ...prev, category: val }))}
              options={[
                { value: 'HONORARIUM', label: 'Instructor / Guest Honorarium' },
                { value: 'VENUE_RENT', label: 'Venue / Auditorium Rent' },
                { value: 'EQUIPMENT', label: 'Sound & Stage Equipment' },
                { value: 'PRINTING', label: 'Printing & Materials' },
                { value: 'UTILITY', label: 'Office & Studio Utilities' },
                { value: 'REFRESHMENT', label: 'Refreshment & Food' },
                { value: 'OTHER', label: 'Other Miscellaneous' }
              ]}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Expense Amount (BDT) *</label>
            <input
              type="number"
              required
              min="1"
              className={styles.input}
              value={expenseFormData.amount}
              onChange={e => setExpenseFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Payment Method</label>
            <CustomSelect
              value={expenseFormData.paymentMethod}
              onChange={val => setExpenseFormData(prev => ({ ...prev, paymentMethod: val }))}
              options={[
                { value: 'Cash / Desk', label: 'Cash / Desk' },
                { value: 'bKash', label: 'bKash Mobile Banking' },
                { value: 'Bank Transfer', label: 'Bank Transfer' }
              ]}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Paid To (Vendor / Recipient)</label>
            <input
              type="text"
              placeholder="e.g. Ustad Mustafa Zaman"
              className={styles.input}
              value={expenseFormData.paidTo}
              onChange={e => setExpenseFormData(prev => ({ ...prev, paidTo: e.target.value }))}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Department Allocation</label>
            <CustomSelect
              value={expenseFormData.departmentName}
              onChange={val => setExpenseFormData(prev => ({ ...prev, departmentName: val }))}
              options={[
                { value: 'কেন্দ্রীয় একাডেমি', label: 'কেন্দ্রীয় একাডেমি (Central)' },
                { value: 'সঙ্গীত বিভাগ', label: 'সঙ্গীত বিভাগ (Music)' },
                { value: 'শিশু বিভাগ', label: 'শিশু বিভাগ (Kids)' },
                { value: 'থিয়েটার বিভাগ', label: 'থিয়েটার বিভাগ (Theatre)' },
                { value: 'ক্বিরাত বিভাগ', label: 'ক্বিরাত বিভাগ (Qiraat)' },
                { value: 'আবৃত্তি ও উপস্থাপনা বিভাগ', label: 'আবৃত্তি ও উপস্থাপনা বিভাগ' }
              ]}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Expense Date</label>
            <input
              type="date"
              className={styles.input}
              value={expenseFormData.date}
              onChange={e => setExpenseFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Notes / Invoice Reference</label>
            <input
              type="text"
              placeholder="Invoice # or voucher notes..."
              className={styles.input}
              value={expenseFormData.notes}
              onChange={e => setExpenseFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className={styles.fullWidth} style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <Button variant="secondary" type="button" onClick={() => setIsExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={<CheckCircle size={16} />}>
              Save Expense Voucher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
