import { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  Receipt, 
  Printer, 
  Download, 
  Plus, 
  CheckCircle, 
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { MetricsStrip, type MetricItem } from '../components/ui/MetricsStrip';
import { DataTableToolbar } from '../components/ui/DataTableToolbar';
import { CustomSelect } from '../components/ui/CustomSelect';
import { StatusBadge } from '../components/ui/StatusBadge';
import UserAvatar from '../components/ui/UserAvatar';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import TableActionMenu from '../components/ui/TableActionMenu';
import { paymentService } from '../services/paymentService';
import type { PaymentRecord, PaymentMetrics } from '../types/payment';
import styles from './Payments.module.css';

export default function Payments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PaymentMetrics | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 25;

  // Modals
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    studentPhone: '',
    departmentName: 'সঙ্গীত বিভাগ',
    branchName: 'ঢাকা পল্টন শাখা',
    category: 'MONTHLY_TUITION',
    month: 'March 2026',
    amount: 500,
    discountAmount: 0,
    paidAmount: 500,
    paymentMethod: 'bKash',
    trxId: '',
    remarks: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resMetrics, resPayments] = await Promise.all([
        paymentService.getMetrics(),
        paymentService.getPayments({
          search,
          category: categoryFilter,
          status: statusFilter,
          paymentMethod: methodFilter,
          limit,
          offset: (page - 1) * limit
        })
      ]);
      setMetrics(resMetrics);
      setPayments(resPayments.payments);
      setTotalCount(resPayments.total);
    } catch (err) {
      console.error('Failed to load payments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, categoryFilter, statusFilter, methodFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Metric Cards
  const metricItems: MetricItem[] = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        id: 'total_collected',
        label: 'Total Collections',
        value: `৳${metrics.totalCollected.toLocaleString()}`,
        badge: `${metrics.paidCount} Vouchers`,
        badgeVariant: 'success',
        icon: <CreditCard size={18} />
      },
      {
        id: 'tuition_collected',
        label: 'Monthly Tuition',
        value: `৳${metrics.tuitionCollected.toLocaleString()}`,
        badge: 'Regular Batches',
        badgeVariant: 'purple',
        icon: <Layers size={18} />
      },
      {
        id: 'workshop_collected',
        label: 'Workshop & Training',
        value: `৳${metrics.workshopCollected.toLocaleString()}`,
        badge: 'Cohort Fees',
        badgeVariant: 'info',
        icon: <Receipt size={18} />
      },
      {
        id: 'admission_collected',
        label: 'Admission & Reg Fees',
        value: `৳${metrics.admissionCollected.toLocaleString()}`,
        badge: 'Intakes',
        badgeVariant: 'neutral',
        icon: <CheckCircle size={18} />
      }
    ];
  }, [metrics]);

  const handleFormChange = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleCollectPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.amount) {
      alert('Please fill in required fields.');
      return;
    }
    try {
      const created = await paymentService.createPayment(formData);
      setIsCollectModalOpen(false);
      loadData();
      // Open receipt voucher immediately
      setSelectedReceipt(created);
      setIsReceiptModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to collect payment.');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className={styles.container}>
      {/* 1. Header */}
      <PageHeader
        title="Payments & Fee Collections"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={15} />}
              onClick={() => alert('Exporting Payments Ledger CSV...')}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={15} />}
              onClick={() => {
                setFormData({
                  studentId: '',
                  studentName: '',
                  studentPhone: '',
                  departmentName: 'সঙ্গীত বিভাগ',
                  branchName: 'ঢাকা পল্টন শাখা',
                  category: 'MONTHLY_TUITION',
                  month: 'March 2026',
                  amount: 500,
                  discountAmount: 0,
                  paidAmount: 500,
                  paymentMethod: 'bKash',
                  trxId: '',
                  remarks: ''
                });
                setIsCollectModalOpen(true);
              }}
            >
              + Collect Fee
            </Button>
          </>
        }
      />

      {/* 2. Top KPI Metrics */}
      {metricItems.length > 0 && <MetricsStrip metrics={metricItems} />}

      {/* 3. Filter Toolbar */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search Voucher No, Student, TrxID, Phone..."
        extraFilters={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '220px' }}>
              <CustomSelect
                fullWidth
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'ALL', label: 'All Categories' },
                  { value: 'MONTHLY_TUITION', label: 'Monthly Tuition' },
                  { value: 'WORKSHOP_FEE', label: 'Workshop Fee' },
                  { value: 'ADMISSION_FEE', label: 'Admission Fee' },
                  { value: 'REGISTRATION_FEE', label: 'Registration Fee' }
                ]}
              />
            </div>

            <div style={{ minWidth: '150px' }}>
              <CustomSelect
                fullWidth
                value={methodFilter}
                onChange={setMethodFilter}
                options={[
                  { value: 'ALL', label: 'All Methods' },
                  { value: 'bKash', label: 'bKash' },
                  { value: 'Nagad', label: 'Nagad' },
                  { value: 'Rocket', label: 'Rocket' },
                  { value: 'Easypay', label: 'Easypay' },
                  { value: 'SSLCommerz', label: 'SSLCommerz' },
                  { value: 'Cash', label: 'Cash Desk' }
                ]}
              />
            </div>

            <div style={{ minWidth: '140px' }}>
              <CustomSelect
                fullWidth
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'ALL', label: 'All Status' },
                  { value: 'PAID', label: 'Paid' },
                  { value: 'DUE', label: 'Due / Unpaid' },
                  { value: 'REFUNDED', label: 'Refunded' }
                ]}
              />
            </div>
          </div>
        }
      />

      {/* 4. Payments Data Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Voucher & Date</th>
                <th className={styles.th}>Student Information</th>
                <th className={styles.th}>Department / Branch</th>
                <th className={styles.th}>Category & Month</th>
                <th className={styles.th}>Method & TrxID</th>
                <th className={styles.th}>Amount (BDT)</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className={styles.td} style={{ textAlign: 'center', padding: '40px' }}>
                    Loading payments ledger...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.td} style={{ textAlign: 'center', padding: '40px' }}>
                    No payment vouchers found matching your criteria.
                  </td>
                </tr>
              ) : (
                payments.map(p => {
                  const isBkash = p.paymentMethod === 'bKash';
                  const isNagad = p.paymentMethod === 'Nagad';
                  const isCash = p.paymentMethod.includes('Cash');

                  return (
                    <tr key={p.id} className={styles.tr}>
                      {/* Voucher No & Date */}
                      <td className={styles.td}>
                        <div className={styles.voucherCell}>
                          <span className={styles.voucherNo}>{p.voucherNo}</span>
                          <span className={styles.paymentDate}>
                            {new Date(p.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>

                      {/* Student Info */}
                      <td className={styles.td}>
                        <div className={styles.studentCell}>
                          <UserAvatar
                            name={p.studentName}
                            photoUrl={p.studentPhoto || undefined}
                            size={36}
                          />
                          <div className={styles.studentDetails}>
                            <span className={styles.studentName}>{p.studentName}</span>
                            <span className={styles.studentSub}>
                              {p.studentId ? `ID: ${p.studentId}` : (p.studentPhone || 'Walk-in')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department / Branch */}
                      <td className={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.departmentName || 'General'}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.branchName || 'Dhaka Paltan'}</span>
                        </div>
                      </td>

                      {/* Category & Month */}
                      <td className={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={styles.categoryTag}>
                            {p.category.replace('_', ' ')}
                          </span>
                          {p.month && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.month}</span>
                          )}
                        </div>
                      </td>

                      {/* Method & TrxID */}
                      <td className={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div className={styles.methodBadge}>
                            <span className={`${styles.methodDot} ${
                              isBkash ? styles.bKashDot : isNagad ? styles.nagadDot : isCash ? styles.cashDot : styles.bankDot
                            }`} />
                            <span>{p.paymentMethod}</span>
                          </div>
                          {p.trxId && (
                            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                              {p.trxId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className={styles.td}>
                        <div className={styles.amountCell}>
                          <span className={styles.paidAmount}>৳{p.paidAmount.toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className={styles.td}>
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Actions */}
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <TableActionMenu
                          items={[
                            {
                              label: 'View Receipt Voucher',
                              icon: <Receipt size={14} />,
                              onClick: () => {
                                setSelectedReceipt(p);
                                setIsReceiptModalOpen(true);
                              }
                            },
                            {
                              label: 'Print Voucher',
                              icon: <Printer size={14} />,
                              onClick: () => {
                                setSelectedReceipt(p);
                                setIsReceiptModalOpen(true);
                              }
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Footer Summary Strip */}
        <div className={styles.tableFooterStrip}>
          <span>
            Showing <strong>{payments.length}</strong> of <strong>{totalCount}</strong> payment vouchers
          </span>
          <div className={styles.paginationControls}>
            <button
              className={styles.pageBtn}
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span style={{ fontWeight: 600, padding: '0 8px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              className={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Collect Fee / New Payment */}
      <Modal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        title="Collect Fee / New Payment Voucher"
        size="lg"
      >
        <form onSubmit={handleCollectPaymentSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Student Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Abdullah Ahnaf"
              className={styles.input}
              value={formData.studentName}
              onChange={e => handleFormChange('studentName', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Student ID (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 202604000384"
              className={styles.input}
              value={formData.studentId}
              onChange={e => handleFormChange('studentId', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Phone Number</label>
            <input
              type="text"
              placeholder="017XXXXXXXX"
              className={styles.input}
              value={formData.studentPhone}
              onChange={e => handleFormChange('studentPhone', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Department</label>
            <CustomSelect
              value={formData.departmentName}
              onChange={val => handleFormChange('departmentName', val)}
              options={[
                { value: 'সঙ্গীত বিভাগ', label: 'সঙ্গীত বিভাগ (Music)' },
                { value: 'শিশু বিভাগ', label: 'শিশু বিভাগ (Kids)' },
                { value: 'থিয়েটার বিভাগ', label: 'থিয়েটার বিভাগ (Theatre)' },
                { value: 'ক্বিরাত বিভাগ', label: 'ক্বিরাত বিভাগ (Qiraat)' },
                { value: 'আবৃত্তি ও উপস্থাপনা বিভাগ', label: 'আবৃত্তি ও উপস্থাপনা বিভাগ' }
              ]}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Payment Category *</label>
            <CustomSelect
              value={formData.category}
              onChange={val => handleFormChange('category', val)}
              options={[
                { value: 'MONTHLY_TUITION', label: 'Monthly Tuition Fee' },
                { value: 'ADMISSION_FEE', label: 'Admission Application Fee' },
                { value: 'WORKSHOP_FEE', label: 'Cultural Workshop Fee' },
                { value: 'ID_CARD_FEE', label: 'Smart ID Card Fee' },
                { value: 'CERTIFICATE_FEE', label: 'Certificate Fee' },
                { value: 'OTHER', label: 'Other Miscellaneous' }
              ]}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Billing Month / Session</label>
            <input
              type="text"
              placeholder="e.g. March 2026"
              className={styles.input}
              value={formData.month}
              onChange={e => handleFormChange('month', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Payable Fee Amount (BDT) *</label>
            <input
              type="number"
              required
              min="0"
              className={styles.input}
              value={formData.amount}
              onChange={e => {
                const amt = Number(e.target.value);
                handleFormChange('amount', amt);
                handleFormChange('paidAmount', amt);
              }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Discount / Waiver (BDT)</label>
            <input
              type="number"
              min="0"
              className={styles.input}
              value={formData.discountAmount}
              onChange={e => handleFormChange('discountAmount', Number(e.target.value))}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Collected Amount (BDT) *</label>
            <input
              type="number"
              required
              min="0"
              className={styles.input}
              value={formData.paidAmount}
              onChange={e => handleFormChange('paidAmount', Number(e.target.value))}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Payment Method *</label>
            <CustomSelect
              value={formData.paymentMethod}
              onChange={val => handleFormChange('paymentMethod', val)}
              options={[
                { value: 'Cash / Desk', label: 'Cash / Desk Collection' },
                { value: 'bKash', label: 'bKash Mobile Banking' },
                { value: 'Nagad', label: 'Nagad Mobile Banking' },
                { value: 'Rocket', label: 'Rocket Mobile Banking' },
                { value: 'Bank Transfer', label: 'Bank Transfer' }
              ]}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Transaction ID (TrxID)</label>
            <input
              type="text"
              placeholder="e.g. TRX982736192"
              className={styles.input}
              value={formData.trxId}
              onChange={e => handleFormChange('trxId', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Remarks / Notes</label>
            <input
              type="text"
              placeholder="Additional remarks..."
              className={styles.input}
              value={formData.remarks}
              onChange={e => handleFormChange('remarks', e.target.value)}
            />
          </div>

          {/* Fee Calculation Summary Box */}
          <div className={styles.feePreviewBox}>
            <div className={styles.feeRow}>
              <span className={styles.feeLabel}>Payable Total</span>
              <span className={styles.feeValue}>৳{Math.max(0, formData.amount - formData.discountAmount)}</span>
            </div>
            <div className={styles.feeRow}>
              <span className={styles.feeLabel}>Received Today</span>
              <span className={styles.feeValue} style={{ color: 'var(--color-success)' }}>
                ৳{formData.paidAmount}
              </span>
            </div>
            <div className={styles.feeRow}>
              <span className={styles.feeLabel}>Due Balance</span>
              <span className={styles.feeValue} style={{ color: formData.amount - formData.discountAmount - formData.paidAmount > 0 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                ৳{Math.max(0, formData.amount - formData.discountAmount - formData.paidAmount)}
              </span>
            </div>
          </div>

          <div className={styles.fullWidth} style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <Button variant="secondary" type="button" onClick={() => setIsCollectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={<CheckCircle size={16} />}>
              Save & Print Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Money Receipt Voucher (Printable) */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Official Money Receipt Voucher"
        size="md"
      >
        {selectedReceipt && (
          <div className={styles.receiptContainer}>
            <div className={styles.receiptHeader}>
              <div className={styles.receiptBrand}>
                <img src="/logo.png" alt="Saimum Logo" className={styles.receiptLogo} />
                <div>
                  <div className={styles.receiptTitle}>Saimum Central Academy</div>
                  <div className={styles.receiptSubtitle}>Official Fee Collection Voucher</div>
                </div>
              </div>
              <div className={styles.receiptVoucherMeta}>
                <div className={styles.receiptVchNo}>{selectedReceipt.voucherNo}</div>
                <div className={styles.receiptDate}>
                  Date: {new Date(selectedReceipt.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className={styles.receiptBodyGrid}>
              <div className={styles.receiptMetaItem}>
                <span className={styles.receiptMetaLabel}>Student Name</span>
                <span className={styles.receiptMetaValue}>{selectedReceipt.studentName}</span>
              </div>
              <div className={styles.receiptMetaItem}>
                <span className={styles.receiptMetaLabel}>Student ID</span>
                <span className={styles.receiptMetaValue}>{selectedReceipt.studentId || 'N/A'}</span>
              </div>
              <div className={styles.receiptMetaItem}>
                <span className={styles.receiptMetaLabel}>Department</span>
                <span className={styles.receiptMetaValue}>{selectedReceipt.departmentName || 'General'}</span>
              </div>
              <div className={styles.receiptMetaItem}>
                <span className={styles.receiptMetaLabel}>Fee Category</span>
                <span className={styles.receiptMetaValue}>{selectedReceipt.category.replace('_', ' ')}</span>
              </div>
              <div className={styles.receiptMetaItem}>
                <span className={styles.receiptMetaLabel}>Payment Method</span>
                <span className={styles.receiptMetaValue}>{selectedReceipt.paymentMethod}</span>
              </div>
              <div className={styles.receiptMetaItem}>
                <span className={styles.receiptMetaLabel}>Trx ID / Ref</span>
                <span className={styles.receiptMetaValue}>{selectedReceipt.trxId || 'Cash Collection'}</span>
              </div>
            </div>

            <div className={styles.receiptAmountStrip}>
              <div>
                <span className={styles.feeLabel}>Total Paid Amount</span>
                <div className={styles.receiptGrandTotal}>৳{selectedReceipt.paidAmount.toLocaleString()}</div>
              </div>
              <div>
                <StatusBadge status={selectedReceipt.status} />
              </div>
            </div>

            <div className={styles.receiptFooter}>
              <div className={styles.signatureLine}>
                <span>Student / Payee Signature</span>
              </div>
              <div className={styles.signatureLine}>
                <span>Authorized Accounts Officer</span>
              </div>
            </div>

            <div className={styles.receiptActions}>
              <Button variant="secondary" onClick={() => setIsReceiptModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" icon={<Printer size={16} />} onClick={handlePrintReceipt}>
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
