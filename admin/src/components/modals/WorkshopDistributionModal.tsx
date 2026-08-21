import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { CustomSelect } from '../ui/CustomSelect';
import type { Registration } from '../../types/admission';
import { workshopService, type WorkshopSessionItem, type WorkshopBatchItem } from '../../services/workshopService';
import { Sparkles, ShieldCheck, AlertCircle, Building2, Users } from 'lucide-react';

interface WorkshopDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegistrations: Registration[];
  onSuccess: () => void;
}

export default function WorkshopDistributionModal({
  isOpen,
  onClose,
  selectedRegistrations,
  onSuccess
}: WorkshopDistributionModalProps) {
  const [sessions, setSessions] = useState<WorkshopSessionItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstReg = selectedRegistrations[0];

  useEffect(() => {
    if (isOpen) {
      setError(null);
      workshopService.getWorkshops()
        .then(res => {
          if (res.success && res.data.length > 0) {
            setSessions(res.data);
            const active = res.data.find(s => s.status === 'ONGOING' || s.status === 'ACTIVE') || res.data[0];
            setSelectedSessionId(active.id);
            if (active.batches && active.batches.length > 0) {
              setSelectedBatchId(active.batches[0].id);
            }
          }
        })
        .catch(err => {
          setError(err.message || 'Failed to load workshop sessions.');
        });
    }
  }, [isOpen]);

  if (!isOpen || selectedRegistrations.length === 0) return null;

  const currentSession = sessions.find(s => s.id === selectedSessionId);
  const currentBatches: WorkshopBatchItem[] = currentSession?.batches || [];
  const selectedBatch = currentBatches.find(b => b.id === selectedBatchId);
  const enrolledCount = selectedBatch?.enrollments?.length || 0;
  const availableSeats = selectedBatch ? selectedBatch.maxCapacity - enrolledCount : 0;
  const isFull = availableSeats <= 0;

  const handleSessionChange = (sessId: string) => {
    setSelectedSessionId(sessId);
    const sess = sessions.find(s => s.id === sessId);
    if (sess && sess.batches.length > 0) {
      setSelectedBatchId(sess.batches[0].id);
    } else {
      setSelectedBatchId('');
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      setError('Please select a target workshop batch.');
      return;
    }

    if (isFull) {
      setError('Selected batch is already at full capacity.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const regIds = selectedRegistrations.map(r => r.id);
      const res = await workshopService.bulkAssignApplicants(selectedBatchId, regIds);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to assign candidates to workshop.');
      }
    } catch (err: any) {
      console.error('Failed to distribute to workshop batch:', err);
      setError(err.message || 'Failed to assign candidates to workshop batch.');
    } finally {
      setIsLoading(false);
    }
  };

  const sessionOptions = sessions.map(s => ({
    value: s.id,
    label: `${s.title} ${s.branch ? `(${s.branch.name})` : '(All Branches)'}`
  }));

  const batchOptions = currentBatches.map(b => ({
    value: b.id,
    label: `${b.name} — Seats: ${b.enrollments?.length || 0}/${b.maxCapacity} (${b.scheduleDays || 'Routine'})`
  }));

  const distinctBranches = Array.from(new Set(selectedRegistrations.map(r => r.branchName || 'Branch')));
  const hasMultipleBranches = distinctBranches.length > 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign ${selectedRegistrations.length} Qualified Candidate(s) to Workshop Batch`}
      size="md"
    >
      {hasMultipleBranches && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#B91C1C',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '0.80rem',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span><strong>Multi-Branch Conflict:</strong> Selected applicants belong to multiple branches ({distinctBranches.join(', ')}). Please filter by a single branch to prevent cross-branch assignment.</span>
        </div>
      )}

      <div style={{
        background: 'var(--brand-orange-subtle, rgba(255,121,14,0.08))',
        border: '1px solid var(--brand-orange-border, rgba(255,121,14,0.25))',
        borderRadius: '8px',
        padding: '12px 14px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '6px',
          background: 'var(--brand-orange, #FF790E)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <ShieldCheck size={18} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
            Workshop Cohort Enrollment & QR ID Generation
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Enrolling candidates will automatically generate their unique Workshop QR code payloads and update their status to WORKSHOP.
          </div>
        </div>
      </div>

      {firstReg && (
        <div style={{
          background: 'var(--bg-body, #F8FAFC)',
          border: '1px solid var(--border-light, #E2E8F0)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '14px',
          fontSize: '0.80rem',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ color: 'var(--text-tertiary)' }}>Applicant Branch: </span>
            <strong style={{ color: 'var(--text-primary)' }}>{firstReg.branchName}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)' }}>Subject: </span>
            <strong style={{ color: 'var(--brand-orange, #FF790E)' }}>{firstReg.subjectName}</strong>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          color: '#DC2626',
          borderRadius: '6px',
          padding: '10px 12px',
          marginBottom: '14px',
          fontSize: '0.80rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleEnroll} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="formGroup">
          <label className="label">
            <Building2 size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Target Workshop Session
          </label>
          <CustomSelect
            options={sessionOptions}
            value={selectedSessionId}
            onChange={handleSessionChange}
            variant="form"
            placeholder="Select Workshop Session"
            fullWidth
          />
        </div>

        <div className="formGroup">
          <label className="label">
            <Users size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Target Workshop Cohort Batch
          </label>
          <CustomSelect
            options={batchOptions}
            value={selectedBatchId}
            onChange={setSelectedBatchId}
            variant="form"
            placeholder="Select Workshop Cohort Batch"
            fullWidth
          />
          {selectedBatch && (
            <div style={{ fontSize: '0.74rem', color: isFull ? '#DC2626' : '#15803D', marginTop: '4px', fontWeight: 600 }}>
              {isFull ? '⚠️ Batch is Full' : `✓ ${availableSeats} seat(s) available in this cohort.`}
            </div>
          )}
        </div>

        {/* Selected Candidates List */}
        <div style={{
          maxHeight: '120px',
          overflowY: 'auto',
          border: '1px solid var(--border-light, #E2E8F0)',
          borderRadius: '6px',
          padding: '8px 10px',
          background: 'var(--bg-body, #F8FAFC)',
          fontSize: '0.76rem'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Candidates to be Enrolled ({selectedRegistrations.length}):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {selectedRegistrations.map(r => (
              <span key={r.id} style={{
                background: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-light, #E2E8F0)',
                borderRadius: '4px',
                padding: '2px 6px',
                color: 'var(--text-primary)',
                fontWeight: 600
              }}>
                {r.registrationNo} - {r.person.fullNameEn}
              </span>
            ))}
          </div>
        </div>

        <div className="formActions">
          <button type="button" className="btnCancel" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            type="submit"
            className="btnPrimary"
            disabled={isLoading || !selectedBatchId || isFull || hasMultipleBranches}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} />
            {isLoading ? 'Enrolling...' : `Enroll into Workshop (${selectedRegistrations.length})`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
