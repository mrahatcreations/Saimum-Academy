import React, { useState } from 'react';
import Modal from '../ui/Modal';
import CustomSelect from '../ui/CustomSelect';
import { workshopService } from '../../services/workshopService';
import { Award, AlertCircle } from 'lucide-react';

interface WorkshopAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  batchName: string;
  onSuccess: () => void;
}

const ASSESSMENT_TYPES = [
  { value: 'CLASS_TEST', label: 'Class Test (30% Weight)' },
  { value: 'WEEKLY_QUIZ', label: 'Weekly Quiz / Test (30% Weight)' },
  { value: 'FINAL_PRACTICAL', label: 'Final Practical Exam (40% Weight)' }
];

export default function WorkshopAssessmentModal({
  isOpen,
  onClose,
  batchId,
  batchName,
  onSuccess
}: WorkshopAssessmentModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'CLASS_TEST' | 'WEEKLY_QUIZ' | 'FINAL_PRACTICAL'>('CLASS_TEST');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalMarks, setTotalMarks] = useState(100);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an assessment title.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await workshopService.createAssessment(batchId, {
        title: title.trim(),
        type,
        date,
        totalMarks: Number(totalMarks) || 100,
        weightPercentage: type === 'FINAL_PRACTICAL' ? 40 : 30
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to schedule assessment.');
      }
    } catch (err: any) {
      setError(err.message || 'Error scheduling assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Workshop Assessment"
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          padding: '12px 14px',
          backgroundColor: 'var(--bg-surface-elevated, #F8FAFC)',
          border: '1px solid var(--border-light, #E2E8F0)',
          borderRadius: '8px',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}>
          Target Batch: <strong style={{ color: 'var(--text-primary)' }}>{batchName}</strong>
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
          <label className="label">Assessment Title *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Vocal Rhythm & Scale Practical Test 01"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="formGroup">
            <label className="label">Assessment Type *</label>
            <CustomSelect
              options={ASSESSMENT_TYPES}
              value={type}
              onChange={(val: any) => setType(val)}
              variant="form"
              fullWidth
            />
          </div>

          <div className="formGroup">
            <label className="label">Exam Date *</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="formGroup">
          <label className="label">Total Marks *</label>
          <input
            type="number"
            className="input"
            min={10}
            max={500}
            value={totalMarks}
            onChange={(e) => setTotalMarks(Number(e.target.value) || 100)}
            required
          />
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
            disabled={submitting || !title.trim()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Award size={14} />
            <span>{submitting ? 'Scheduling...' : 'Create Assessment'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
