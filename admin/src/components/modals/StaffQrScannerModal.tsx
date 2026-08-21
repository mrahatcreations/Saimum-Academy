import { useState } from 'react';
import Modal from '../ui/Modal';
import { workshopService, type WorkshopBatchItem } from '../../services/workshopService';
import { QrCode, CheckCircle2, AlertCircle, Clock, Calendar, UserCheck } from 'lucide-react';

interface StaffQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: WorkshopBatchItem | null;
  onSuccess: () => void;
}

export default function StaffQrScannerModal({
  isOpen,
  onClose,
  batch,
  onSuccess
}: StaffQrScannerModalProps) {
  const [manualQrInput, setManualQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  if (!isOpen || !batch) return null;

  const enrollments = batch.enrollments || [];

  const handleScanPayload = async (payload: string) => {
    if (!payload.trim()) return;
    setScanning(true);
    setResult(null);

    try {
      const res = await workshopService.scanQrAttendance({
        qrCodePayload: payload.trim(),
        staffId: batch.moderators?.[0]?.staffId
      });

      setResult({
        success: res.success,
        message: res.message || (res.success ? 'Attendance recorded.' : 'Scan failed.'),
        data: res.data
      });
      if (res.success) {
        onSuccess();
        setManualQrInput('');
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Scan verification failed.'
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Staff Mobile App QR Scanner API Simulator"
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Batch Info Header */}
        <div style={{
          padding: '12px 14px',
          backgroundColor: 'var(--bg-surface-elevated, #F8FAFC)',
          border: '1px solid var(--border-light, #E2E8F0)',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.90rem', color: 'var(--text-primary)' }}>
              {batch.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span><Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {batch.scheduleDays || 'Schedule'}</span>
              <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {batch.timeSlot || 'Time'}</span>
            </div>
          </div>
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: 'var(--brand-orange-subtle, #FFF4EC)',
            color: 'var(--brand-orange, #FF790E)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            Staff Scanner Active
          </span>
        </div>

        {/* Verification Status Feedback Alert */}
        {result && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '8px',
            backgroundColor: result.success ? '#DCFCE7' : '#FEE2E2',
            border: `1px solid ${result.success ? '#86EFAC' : '#FCA5A5'}`,
            color: result.success ? '#15803D' : '#B91C1C',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            {result.success ? <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
            <div>
              <div style={{ fontWeight: 700 }}>{result.message}</div>
              {result.data && (
                <div style={{ fontSize: '0.76rem', marginTop: '4px', opacity: 0.9 }}>
                  Student: <strong>{result.data.studentName}</strong> • Reg: {result.data.registrationNo} • Time: {result.data.timestamp}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Student Badges Simulator */}
        <div>
          <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
            Instant QR Badges in this Batch (Click to simulate instant staff mobile scan):
          </label>

          {enrollments.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.82rem', border: '1px dashed var(--border-dashed)', borderRadius: '6px' }}>
              No trainees enrolled in this batch yet. Assign trainees from Admissions first.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {enrollments.map(student => {
                const qrPayload = `SA-QR-WS-${batch.id.slice(0, 4)}-${student.registrationNo || student.id.slice(0, 4)}`;
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleScanPayload(qrPayload)}
                    disabled={scanning}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-body)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.80rem', color: 'var(--text-primary)' }}>
                        {student.studentName}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary)' }}>
                        {student.registrationNo || 'REG'}
                      </div>
                    </div>
                    <QrCode size={16} color="var(--brand-orange)" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Manual Barcode / Scanner Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleScanPayload(manualQrInput); }}>
          <div className="formGroup">
            <label className="label">Manual Scanner Input / Barcode Scanner</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input"
                placeholder="Scan or paste student QR code payload..."
                value={manualQrInput}
                onChange={(e) => setManualQrInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btnPrimary"
                disabled={scanning || !manualQrInput.trim()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <UserCheck size={14} />
                <span>{scanning ? 'Verifying...' : 'Verify Scan'}</span>
              </button>
            </div>
          </div>
        </form>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
          <button type="button" className="btnSecondary" onClick={onClose}>
            Close Scanner
          </button>
        </div>
      </div>
    </Modal>
  );
}
