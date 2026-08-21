import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import type { DepartmentItem, BranchItem } from '../../services/academicService';
import { Check, Plus } from 'lucide-react';

interface ManageDepartmentModalProps {
  isOpen: boolean;
  initialData: DepartmentItem | null;
  branches: BranchItem[];
  onClose: () => void;
  onSave: (payload: {
    name: string;
    status?: 'ACTIVE' | 'INACTIVE';
    branchIds?: string[];
  }) => Promise<void>;
}

export default function ManageDepartmentModal({
  isOpen,
  initialData,
  branches,
  onClose,
  onSave
}: ManageDepartmentModalProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setStatus(initialData.status || 'ACTIVE');
      const bIds = initialData.branches?.map(b => b.id) || [];
      setSelectedBranchIds(bIds);
    } else {
      setName('');
      setStatus('ACTIVE');
      setSelectedBranchIds(branches.map(b => b.id)); // Default all branches for new department
    }
  }, [initialData, branches, isOpen]);

  if (!isOpen) return null;

  const handleToggleBranch = (branchId: string) => {
    if (selectedBranchIds.includes(branchId)) {
      setSelectedBranchIds(selectedBranchIds.filter(id => id !== branchId));
    } else {
      setSelectedBranchIds([...selectedBranchIds, branchId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        status,
        branchIds: selectedBranchIds
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save department');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Department: ${initialData.name}` : 'Create Master Department'}
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Department Name */}
        <div className="formGroup" style={{ margin: 0 }}>
          <label className="label">Department Name *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. সঙ্গীত বিভাগ (Music Department)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Operating Status */}
        <div className="formGroup" style={{ margin: 0 }}>
          <label className="label">Status *</label>
          <select
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
          >
            <option value="ACTIVE">ACTIVE (Operational)</option>
            <option value="INACTIVE">INACTIVE (Archived)</option>
          </select>
        </div>

        {/* Active Branches Multi-Select Chips */}
        <div className="formGroup" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="label" style={{ margin: 0 }}>Active Campuses for this Department</label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {selectedBranchIds.length} of {branches.length} selected
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', backgroundColor: 'var(--bg-body, #F8FAFC)', borderRadius: '8px', border: '1px solid var(--border-light, #E2E8F0)' }}>
            {branches.length === 0 ? (
              <span style={{ fontSize: '0.80rem', color: 'var(--text-tertiary)' }}>No campuses available.</span>
            ) : (
              branches.map(b => {
                const isSelected = selectedBranchIds.includes(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleToggleBranch(b.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '0.80rem',
                      fontWeight: 600,
                      border: 'none',
                      backgroundColor: isSelected ? '#FF790E' : 'var(--bg-surface, #FFFFFF)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary, #475569)',
                      boxShadow: isSelected ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
                    <span>{b.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
          <button type="button" className="btnSecondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btnPrimary"
            disabled={isSubmitting || !name.trim()}
            style={{
              backgroundColor: '#FF790E',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              padding: '8px 18px',
              cursor: 'pointer'
            }}
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Department' : 'Create Department')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
