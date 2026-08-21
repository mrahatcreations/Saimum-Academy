import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { 
  fetchAcademicLookups, 
  createBatch, 
  updateBatch, 
  type BatchItem 
} from '../../services/batchService';
import { Building2, BookOpen, LibraryBig } from 'lucide-react';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (batch: BatchItem) => void;
  initialBatch?: BatchItem | null;
}

export default function CreateBatchModal({
  isOpen,
  onClose,
  onSuccess,
  initialBatch
}: CreateBatchModalProps) {
  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [branches, setBranches] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      loadLookups();
      if (initialBatch) {
        setName(initialBatch.name);
        setBranchId(initialBatch.branchId);
        setDepartmentId(initialBatch.departmentId);
        setSubjectId(initialBatch.subjectId);
        setStatus(initialBatch.status);
      } else {
        setName('');
        setStatus('ACTIVE');
      }
      setError(null);
    }
  }, [isOpen, initialBatch]);

  const loadLookups = async () => {
    try {
      const data = await fetchAcademicLookups();
      setBranches(data.branches);
      setDepartments(data.departments);
      setSubjects(data.subjects);

      if (!initialBatch) {
        if (data.branches.length > 0) setBranchId(data.branches[0].id);
        if (data.departments.length > 0) setDepartmentId(data.departments[0].id);
        if (data.subjects.length > 0) setSubjectId(data.subjects[0].id);
      }
    } catch (err) {
      console.error('Lookup load error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a batch name.');
      return;
    }
    if (!branchId || !subjectId) {
      setError('Branch and Subject selection are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (initialBatch) {
        const updated = await updateBatch(initialBatch.id, {
          name: name.trim(),
          status
        });
        onSuccess(updated);
      } else {
        const created = await createBatch({
          name: name.trim(),
          branchId,
          departmentId: departmentId || undefined,
          subjectId,
          status
        });
        onSuccess(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create batch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialBatch ? `Edit Batch: ${initialBatch.name}` : "Create New Academy Batch"}
      size="md"
    >
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '8px',
            color: '#F87171',
            fontSize: '0.84rem'
          }}>
            {error}
          </div>
        )}

        {/* Batch Name */}
        <div className="formGroup" style={{marginBottom: 0}}>
          <label className="label">
            Batch Name / Cohort Title*
          </label>
          <div style={{position: 'relative'}}>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. Batch-01 (Weekend Morning) or Vocal Masterclass A"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Branch Selection */}
        <div className="formGroup" style={{marginBottom: 0}}>
          <label className="label" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
            <Building2 size={14} color="var(--brand-orange)" />
            Branch Assignment*
          </label>
          <select 
            className="select"
            value={branchId}
            onChange={e => setBranchId(e.target.value)}
            disabled={!!initialBatch}
            required
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.type === 'ONLINE' ? 'Online Academy' : 'Physical Branch'})
              </option>
            ))}
          </select>
        </div>

        {/* Department & Master Subject */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
          <div className="formGroup" style={{marginBottom: 0}}>
            <label className="label" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
              <LibraryBig size={14} color="var(--brand-orange)" />
              Department
            </label>
            <select 
              className="select"
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              disabled={!!initialBatch}
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="formGroup" style={{marginBottom: 0}}>
            <label className="label" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
              <BookOpen size={14} color="var(--brand-orange)" />
              Subject / Course*
            </label>
            <select 
              className="select"
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              disabled={!!initialBatch}
              required
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="formGroup" style={{marginBottom: 0}}>
          <label className="label">Batch Status</label>
          <select 
            className="select"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="ACTIVE">ACTIVE (Ongoing)</option>
            <option value="UPCOMING">UPCOMING (Enrollment Open)</option>
            <option value="COMPLETED">COMPLETED (Archived)</option>
            <option value="INACTIVE">INACTIVE (Paused)</option>
          </select>
        </div>

        {/* Form Actions */}
        <div className="formActions" style={{marginTop: '12px'}}>
          <button type="button" className="btnCancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btnSubmit" disabled={loading}>
            {loading ? 'Saving...' : initialBatch ? 'Update Batch' : 'Create Batch'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
