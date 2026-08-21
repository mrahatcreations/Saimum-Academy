import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import CustomSelect from '../ui/CustomSelect';
import { workshopService } from '../../services/workshopService';
import { fetchAcademicLookups } from '../../services/batchService';
import { Award, AlertCircle } from 'lucide-react';

interface GraduateTraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  enrollmentId: string;
  studentName: string;
  studentRegNo?: string;
  compositeScore: number;
  onSuccess: () => void;
}

export default function GraduateTraineeModal({
  isOpen,
  onClose,
  batchId,
  enrollmentId,
  studentName,
  studentRegNo,
  compositeScore,
  onSuccess
}: GraduateTraineeModalProps) {
  const [regularBatches, setRegularBatches] = useState<{ id: string; name: string }[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setLoading(true);
      fetchAcademicLookups()
        .then(res => {
          if (res && res.departments) {
            // Simulated regular batch offerings
            setRegularBatches([
              { id: 'rb-paltan-music-01', name: 'Dhaka Paltan — Vocal Music Regular Batch 01' },
              { id: 'rb-paltan-drama-01', name: 'Dhaka Paltan — Drama & Theatre Regular Batch 01' },
              { id: 'rb-mirpur-music-01', name: 'Dhaka Mirpur — Vocal Music Regular Batch 01' },
              { id: 'rb-ctg-music-01', name: 'Chattogram — Vocal Music Regular Batch 01' },
              { id: 'rb-online-music-01', name: 'Online Branch — Vocal Music Regular Batch 01' }
            ]);
            setSelectedBatchId('rb-paltan-music-01');
          }
        })
        .catch(err => {
          setError(err.message || 'Failed to load regular department batches.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGraduate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await workshopService.graduateToRegular(batchId, {
        enrollmentId,
        regularBatchId: selectedBatchId
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to graduate trainee.');
      }
    } catch (err: any) {
      setError(err.message || 'Error graduating trainee.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Graduate Trainee to Regular Academy"
      size="md"
    >
      <form onSubmit={handleGraduate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Trainee Card */}
        <div style={{
          padding: '14px 16px',
          backgroundColor: 'var(--bg-surface-elevated, #F8FAFC)',
          border: '1px solid var(--border-light, #E2E8F0)',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
              {studentName}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {studentRegNo || 'REG'} • Final Composite Score: <strong style={{ color: '#16A34A' }}>{compositeScore}/100</strong>
            </div>
          </div>
          <span style={{
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            Qualified
          </span>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#FEE2E2',
            color: '#B91C1C',
            borderRadius: '6px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div className="formGroup">
          <label className="label">Target Ongoing Regular Department Batch *</label>
          {loading ? (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Loading regular batches...</div>
          ) : (
            <CustomSelect
              options={regularBatches.map(b => ({
                value: b.id,
                label: b.name
              }))}
              value={selectedBatchId}
              onChange={setSelectedBatchId}
              variant="form"
              fullWidth
            />
          )}
        </div>

        <div style={{
          padding: '12px 14px',
          borderRadius: '6px',
          backgroundColor: 'var(--brand-orange-subtle, #FFF4EC)',
          border: '1px solid var(--brand-orange, #FF790E)',
          fontSize: '0.80rem',
          color: 'var(--text-primary)',
          lineHeight: '1.4'
        }}>
          🎓 <strong>Graduation Milestone:</strong> This will create a permanent Student profile for <strong>{studentName}</strong>, record their successful completion of the workshop in their lifetime timeline, and enroll them into the continuous regular department batch.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
          <button
            type="button"
            className="btnSecondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btnPrimary"
            disabled={submitting || !selectedBatchId}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Award size={14} />
            <span>{submitting ? 'Graduating...' : 'Confirm Graduation'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
