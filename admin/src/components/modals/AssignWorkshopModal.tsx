import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import CustomSelect from '../ui/CustomSelect';
import { workshopService, type WorkshopSessionItem, type WorkshopBatchItem } from '../../services/workshopService';
import type { Registration } from '../../types/admission';
import { Sparkles, Users, AlertCircle } from 'lucide-react';

interface AssignWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Registration | null;
  onSuccess: () => void;
}

export default function AssignWorkshopModal({
  isOpen,
  onClose,
  applicant,
  onSuccess
}: AssignWorkshopModalProps) {
  const [sessions, setSessions] = useState<WorkshopSessionItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setLoading(true);
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
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen || !applicant) return null;

  const currentSession = sessions.find(s => s.id === selectedSessionId);
  const currentBatches: WorkshopBatchItem[] = currentSession?.batches || [];
  const selectedBatch = currentBatches.find(b => b.id === selectedBatchId);
  const enrolledCount = selectedBatch?.enrollments?.length || 0;
  const isFull = selectedBatch ? enrolledCount >= selectedBatch.maxCapacity : false;

  const handleSessionChange = (sessId: string) => {
    setSelectedSessionId(sessId);
    const sess = sessions.find(s => s.id === sessId);
    if (sess && sess.batches.length > 0) {
      setSelectedBatchId(sess.batches[0].id);
    } else {
      setSelectedBatchId('');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      setError('Please select a target workshop batch.');
      return;
    }

    if (isFull) {
      setError('Selected batch is already at full capacity.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await workshopService.assignApplicant(selectedBatchId, {
        registrationId: applicant.id,
        personId: applicant.personId,
        studentName: applicant.person.fullNameEn,
        studentPhone: applicant.person.phone
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to assign applicant.');
      }
    } catch (err: any) {
      setError(err.message || 'Error assigning applicant.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign to Workshop Batch"
      size="md"
    >
      <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Applicant Summary Card */}
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
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              {applicant.person.fullNameEn}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {applicant.registrationNo} • {applicant.branchName || 'Branch'} • {applicant.departmentName || 'Dept'}
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
            Selected
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

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading available workshop cohorts...
          </div>
        ) : (
          <>
            {/* Workshop Session Selector */}
            <div className="formGroup">
              <label className="label">Target Workshop Session *</label>
              <CustomSelect
                options={sessions.map(s => ({
                  value: s.id,
                  label: s.title
                }))}
                value={selectedSessionId}
                onChange={handleSessionChange}
                variant="form"
                placeholder="Select Workshop Session"
                fullWidth
              />
            </div>

            {/* Workshop Batch Selector */}
            <div className="formGroup">
              <label className="label">Select Cohort Batch *</label>
              {currentBatches.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', padding: '8px 0' }}>
                  No batches configured under this session yet.
                </div>
              ) : (
                <CustomSelect
                  options={currentBatches.map(b => {
                    const count = b.enrollments?.length || 0;
                    const full = count >= b.maxCapacity;
                    return {
                      value: b.id,
                      label: `${b.name} (${b.scheduleDays || 'Schedule'} • ${b.timeSlot || 'Time'}) — [${count}/${b.maxCapacity} Seats] ${full ? 'FULL' : ''}`
                    };
                  })}
                  value={selectedBatchId}
                  onChange={setSelectedBatchId}
                  variant="form"
                  placeholder="Select Batch"
                  fullWidth
                />
              )}
            </div>

            {/* Selected Batch Capacity Alert */}
            {selectedBatch && (
              <div style={{
                padding: '12px 14px',
                borderRadius: '6px',
                backgroundColor: isFull ? '#FEF2F2' : 'var(--bg-body, #F8FAFC)',
                border: `1px solid ${isFull ? '#FCA5A5' : 'var(--border-light, #E2E8F0)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.80rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={14} color="var(--text-secondary)" />
                  <span>Enrolled: <strong>{enrolledCount}</strong> of <strong>{selectedBatch.maxCapacity}</strong> maximum seats</span>
                </div>
                {isFull ? (
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>BATCH FULL</span>
                ) : (
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>AVAILABLE</span>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal Footer Buttons */}
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
            disabled={submitting || !selectedBatchId || isFull}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} />
            <span>{submitting ? 'Enrolling...' : 'Confirm Enrollment'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
