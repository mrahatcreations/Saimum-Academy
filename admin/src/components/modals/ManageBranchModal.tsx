import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import type { BranchItem, DepartmentItem } from '../../services/academicService';
import { Check, Plus } from 'lucide-react';

interface ManageBranchModalProps {
  isOpen: boolean;
  initialData: BranchItem | null;
  departments: DepartmentItem[];
  onClose: () => void;
  onSave: (payload: {
    name: string;
    code?: string;
    type?: 'PHYSICAL' | 'ONLINE';
    status?: 'ACTIVE' | 'INACTIVE';
    departmentIds?: string[];
  }) => Promise<void>;
}

export default function ManageBranchModal({
  isOpen,
  initialData,
  departments,
  onClose,
  onSave
}: ManageBranchModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PHYSICAL' | 'ONLINE'>('PHYSICAL');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCode(initialData.code || '');
      setType(initialData.type || 'PHYSICAL');
      setStatus(initialData.status || 'ACTIVE');
      const deptIds = initialData.departments?.map(d => d.department.id) || [];
      setSelectedDeptIds(deptIds);
    } else {
      setName('');
      setCode('');
      setType('PHYSICAL');
      setStatus('ACTIVE');
      setSelectedDeptIds(departments.map(d => d.id)); // Default all departments for new branch
    }
  }, [initialData, departments, isOpen]);

  if (!isOpen) return null;

  const handleToggleDept = (deptId: string) => {
    if (selectedDeptIds.includes(deptId)) {
      setSelectedDeptIds(selectedDeptIds.filter(id => id !== deptId));
    } else {
      setSelectedDeptIds([...selectedDeptIds, deptId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        code: code.trim() || undefined,
        type,
        status,
        departmentIds: selectedDeptIds
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save branch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Branch: ${initialData.name}` : 'Create Campus Branch'}
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Branch Name */}
        <div className="formGroup" style={{ margin: 0 }}>
          <label className="label">Branch Name *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Dhaka Paltan Branch"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Code & Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="formGroup" style={{ margin: 0 }}>
            <label className="label">Branch Code</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. PLT"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>

          <div className="formGroup" style={{ margin: 0 }}>
            <label className="label">Campus Type *</label>
            <select
              className="select"
              value={type}
              onChange={(e) => setType(e.target.value as 'PHYSICAL' | 'ONLINE')}
            >
              <option value="PHYSICAL">Physical Campus (On-site)</option>
              <option value="ONLINE">Online Campus (Virtual)</option>
            </select>
          </div>
        </div>

        {/* Active Departments Multi-Select Chips */}
        <div className="formGroup" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="label" style={{ margin: 0 }}>Active Departments in this Branch</label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {selectedDeptIds.length} of {departments.length} selected
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', backgroundColor: 'var(--bg-body, #F8FAFC)', borderRadius: '8px', border: '1px solid var(--border-light, #E2E8F0)' }}>
            {departments.length === 0 ? (
              <span style={{ fontSize: '0.80rem', color: 'var(--text-tertiary)' }}>No departments available.</span>
            ) : (
              departments.map(d => {
                const isSelected = selectedDeptIds.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleToggleDept(d.id)}
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
                    <span>{d.name}</span>
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
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Branch' : 'Create Branch')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
