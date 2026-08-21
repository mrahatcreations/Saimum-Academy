import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { CustomSelect } from '../ui/CustomSelect';
import type { WorkshopSessionItem } from '../../services/workshopService';
import type { BranchItem } from '../../services/academicService';
import { Plus, Edit2, Trash2, ArrowLeft, Layers, Calendar, Users, Building } from 'lucide-react';

interface ManageWorkshopSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: WorkshopSessionItem[];
  branches: BranchItem[];
  activeSessionId?: string;
  onSelectSession: (session: WorkshopSessionItem) => void;
  onCreateSession: (newSession: {
    title: string;
    code?: string;
    year: number;
    startDate?: string;
    endDate?: string;
    targetCapacity: number;
    status: string;
    description?: string;
    branchId?: string | null;
  }) => Promise<void>;
  onUpdateSession: (id: string, updated: any) => Promise<void>;
  onDeleteSession: (id: string) => Promise<void>;
  onToggleStatus: (sessionId: string, currentStatus: string) => Promise<void>;
}

export default function ManageWorkshopSessionsModal({
  isOpen,
  onClose,
  sessions,
  branches,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onUpdateSession,
  onDeleteSession,
  onToggleStatus
}: ManageWorkshopSessionsModalProps) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(`${new Date().getFullYear()}-08-31`);
  const [targetCapacity, setTargetCapacity] = useState(90);
  const [status, setStatus] = useState('ONGOING');
  const [description, setDescription] = useState('');
  const [branchId, setBranchId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setCode('');
    setYear(new Date().getFullYear());
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(`${new Date().getFullYear()}-08-31`);
    setTargetCapacity(90);
    setStatus('ONGOING');
    setDescription('');
    setBranchId('');
    setEditingSessionId(null);
    setView('list');
  };

  const handleOpenCreate = () => {
    resetForm();
    setCode(`WS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
    setView('form');
  };

  const handleOpenEdit = (s: WorkshopSessionItem) => {
    setEditingSessionId(s.id);
    setTitle(s.title);
    setCode(s.code || '');
    setYear(s.year || 2026);
    setStartDate(s.startDate || new Date().toISOString().split('T')[0]);
    setEndDate(s.endDate || `${new Date().getFullYear()}-08-31`);
    setTargetCapacity(s.targetCapacity || 90);
    setStatus(s.status || 'ONGOING');
    setDescription(s.description || '');
    setBranchId(s.branchId || '');
    setView('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingSessionId) {
        await onUpdateSession(editingSessionId, {
          title: title.trim(),
          code: code.trim() || undefined,
          year: Number(year),
          startDate,
          endDate,
          targetCapacity: Number(targetCapacity),
          status,
          description: description.trim() || undefined,
          branchId: branchId && branchId !== 'ALL' ? branchId : null
        });
      } else {
        await onCreateSession({
          title: title.trim(),
          code: code.trim() || `WS-${year}-${Date.now().toString().slice(-4)}`,
          year: Number(year),
          startDate,
          endDate,
          targetCapacity: Number(targetCapacity),
          status,
          description: description.trim() || undefined,
          branchId: branchId && branchId !== 'ALL' ? branchId : null
        });
      }
      resetForm();
    } catch (err: any) {
      alert(err.message || 'Failed to save workshop session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const branchOptions = [
    { value: '', label: 'All Branches (Central / Multi-Campus)' },
    ...branches.map(b => ({ value: b.id, label: `${b.name} (${b.type})` }))
  ];

  const statusOptions = [
    { value: 'ONGOING', label: 'ONGOING (Active)' },
    { value: 'UPCOMING', label: 'UPCOMING (Scheduled)' },
    { value: 'COMPLETED', label: 'COMPLETED (Ended)' },
    { value: 'ARCHIVED', label: 'ARCHIVED' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={view === 'list' ? 'Manage Workshop Sessions' : (editingSessionId ? 'Edit Workshop Session' : 'Create New Workshop Session')}
      size="lg"
    >
      {view === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Action Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-light)'
          }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              All Workshop Sessions ({sessions.length})
            </span>
            <button
              type="button"
              className="btnPrimary"
              onClick={handleOpenCreate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                padding: '6px 14px',
                backgroundColor: '#FF790E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>New Session</span>
            </button>
          </div>

          {/* Sessions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
            {sessions.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border-dashed)', borderRadius: '8px' }}>
                No workshop sessions found. Click "New Workshop Session" to create one.
              </div>
            ) : (
              sessions.map(s => {
                const isActive = s.id === activeSessionId;
                const batchCount = s.batches?.length || 0;
                const traineeCount = s.batches?.reduce((acc, b) => acc + (b.enrollments?.length || 0), 0) || 0;

                return (
                  <div
                    key={s.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: isActive ? '2px solid var(--brand-orange)' : '1px solid var(--border-light)',
                      backgroundColor: isActive ? 'var(--brand-orange-subtle, #FFF8F3)' : 'var(--bg-body)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {s.title}
                        </span>
                        {isActive && (
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: 'var(--brand-orange)',
                            color: '#ffffff',
                            fontSize: '0.70rem',
                            fontWeight: 700
                          }}>
                            Viewing Active
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onToggleStatus(s.id, s.status === 'ONGOING' ? 'COMPLETED' : 'ONGOING')}
                          title="Click to toggle Status (ONGOING / COMPLETED)"
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: s.status === 'ONGOING' ? '#DCFCE7' : '#F3F4F6',
                            color: s.status === 'ONGOING' ? '#15803D' : '#4B5563',
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {s.status}
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <span><Building size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {s.branch?.name || 'All Branches'}</span>
                        <span><Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {s.startDate || 'TBD'} to {s.endDate || 'TBD'} ({s.year})</span>
                        <span><Layers size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {batchCount} Batches</span>
                        <span><Users size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {traineeCount}/{s.targetCapacity || 90} Trainees</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!isActive && (
                        <button
                          type="button"
                          className="btnSecondary"
                          onClick={() => {
                            onSelectSession(s);
                            onClose();
                          }}
                          style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                        >
                          Switch To
                        </button>
                      )}

                      <button
                        type="button"
                        className="btnSecondary"
                        onClick={() => handleOpenEdit(s)}
                        title="Edit Session"
                        style={{ padding: '6px 8px' }}
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete session "${s.title}"? All linked batches will be removed.`)) {
                            onDeleteSession(s.id);
                          }
                        }}
                        title="Delete Session"
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #FECACA',
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <button
              type="button"
              onClick={() => setView('list')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--brand-orange)', fontWeight: 600 }}
            >
              <ArrowLeft size={14} /> Back to Sessions List
            </button>
          </div>

          <div className="formGroup">
            <label className="label">Workshop Session Title *</label>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. 3-Month Summer Cultural Workshop 2026 (Summer Vocal Intensive)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="formGroup">
              <label className="label">Session Code / Identifier</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. WS-2026-SUMMER"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
            </div>

            <div className="formGroup">
              <label className="label">Assigned Branch / Campus</label>
              <CustomSelect
                options={branchOptions}
                value={branchId}
                onChange={setBranchId}
                variant="form"
                placeholder="Select Campus"
                fullWidth
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="formGroup">
              <label className="label">Academic Year *</label>
              <input
                type="number"
                className="input"
                required
                min={2020}
                max={2040}
                value={year}
                onChange={e => setYear(parseInt(e.target.value, 10) || 2026)}
              />
            </div>

            <div className="formGroup">
              <label className="label">Start Date *</label>
              <input
                type="date"
                className="input"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            <div className="formGroup">
              <label className="label">End Date *</label>
              <input
                type="date"
                className="input"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="formGroup">
              <label className="label">Target Student Capacity *</label>
              <input
                type="number"
                className="input"
                required
                min={1}
                max={2000}
                value={targetCapacity}
                onChange={e => setTargetCapacity(parseInt(e.target.value, 10) || 90)}
              />
            </div>

            <div className="formGroup">
              <label className="label">Operational Status *</label>
              <CustomSelect
                options={statusOptions}
                value={status}
                onChange={setStatus}
                variant="form"
                placeholder="Select Status"
                fullWidth
              />
            </div>
          </div>

          <div className="formGroup">
            <label className="label">Description / Workshop Notes</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Brief description of the workshop curriculum, targets, or cohort guidelines..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="formActions">
            <button type="button" className="btnCancel" onClick={() => setView('list')}>
              Cancel
            </button>
            <button type="submit" className="btnSubmit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingSessionId ? 'Update Workshop Session' : 'Create Workshop Session')}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
