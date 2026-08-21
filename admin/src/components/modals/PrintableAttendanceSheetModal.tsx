import { Printer } from 'lucide-react';
import Modal from '../ui/Modal';

interface PrintableAttendanceSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchName: string;
  scheduleDays?: string;
  timeSlot?: string;
  students: Array<{ id: string; name: string; regNo: string }>;
  sessionTitle?: string;
}

export default function PrintableAttendanceSheetModal({
  isOpen,
  onClose,
  batchName,
  scheduleDays,
  timeSlot,
  students,
  sessionTitle = '2026 Cultural Workshop Session'
}: PrintableAttendanceSheetModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Print Workshop Daily Attendance & Roster Sheet"
      size="lg"
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={handlePrint}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--brand-orange, #FF790E)',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Printer size={16} />
          Print / Save as PDF
        </button>
      </div>

      <div
        id="printable-attendance-sheet"
        style={{
          background: '#ffffff',
          color: '#111827',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          fontFamily: 'system-ui, sans-serif',
          maxHeight: '65vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '12px', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
            সাইমুম শিল্পীগোষ্ঠী কেন্দ্রীয় একাডেমি
          </h2>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4B5563', marginTop: '2px' }}>
            Saimum Central Academy — Workshop Daily Attendance & Roster Sheet
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
            Session: <strong>{sessionTitle}</strong> • Batch: <strong>{batchName}</strong> • Schedule: <strong>{scheduleDays || 'Routine'} ({timeSlot || 'Time'})</strong> • Total Enrolled: <strong>{students.length}</strong>
          </div>
        </div>

        {/* Attendance Table with Date Columns for Manual Physical Marking */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.78rem',
          textAlign: 'left'
        }}>
          <thead>
            <tr style={{ background: '#F3F4F6', borderBottom: '2px solid #9CA3AF' }}>
              <th style={{ padding: '8px 6px', border: '1px solid #D1D5DB', width: '35px', textAlign: 'center' }}>SL</th>
              <th style={{ padding: '8px 6px', border: '1px solid #D1D5DB', width: '90px' }}>Reg No</th>
              <th style={{ padding: '8px 6px', border: '1px solid #D1D5DB' }}>Student Full Name</th>
              <th style={{ padding: '8px 6px', border: '1px solid #D1D5DB', width: '60px', textAlign: 'center' }}>Day 1</th>
              <th style={{ padding: '8px 6px', border: '1px solid #D1D5DB', width: '60px', textAlign: 'center' }}>Day 2</th>
              <th style={{ padding: '8px 6px', border: '1px solid #D1D5DB', width: '60px', textAlign: 'center' }}>Day 3</th>
              <th style={{ padding: '8px 6px', border: '1px solid #D1D5DB', width: '60px', textAlign: 'center' }}>Day 4</th>
              <th style={{ padding: '8px 6px', border: '1px solid #D1D5DB', width: '60px', textAlign: 'center' }}>Day 5</th>
              <th style={{ padding: '8px 6px', border: '1px solid #D1D5DB', width: '70px', textAlign: 'center' }}>Sign</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>
                  No trainees enrolled in this cohort batch yet.
                </td>
              </tr>
            ) : (
              students.map((st, index) => (
                <tr key={st.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '8px 6px', border: '1px solid #D1D5DB', textAlign: 'center', fontWeight: 600 }}>{index + 1}</td>
                  <td style={{ padding: '8px 6px', border: '1px solid #D1D5DB', fontWeight: 600, fontFamily: 'monospace' }}>{st.regNo}</td>
                  <td style={{ padding: '8px 6px', border: '1px solid #D1D5DB', fontWeight: 700 }}>{st.name}</td>
                  <td style={{ padding: '8px 6px', border: '1px solid #D1D5DB' }}></td>
                  <td style={{ padding: '8px 6px', border: '1px solid #D1D5DB' }}></td>
                  <td style={{ padding: '8px 6px', border: '1px solid #D1D5DB' }}></td>
                  <td style={{ padding: '8px 6px', border: '1px solid #D1D5DB' }}></td>
                  <td style={{ padding: '8px 6px', border: '1px solid #D1D5DB' }}></td>
                  <td style={{ padding: '8px 6px', border: '1px solid #D1D5DB' }}></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', paddingTop: '16px', fontSize: '0.80rem' }}>
          <div>
            <div style={{ borderTop: '1px solid #4B5563', width: '160px', textAlign: 'center', paddingTop: '4px' }}>
              Batch Moderator Sign
            </div>
          </div>
          <div>
            <div style={{ borderTop: '1px solid #4B5563', width: '160px', textAlign: 'center', paddingTop: '4px' }}>
              Central Academy Lead
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
