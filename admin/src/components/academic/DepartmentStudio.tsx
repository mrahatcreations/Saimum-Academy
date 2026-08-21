import React, { useState } from 'react';
import type { DepartmentItem, BranchItem, BatchItem, SubjectItem } from '../../services/academicService';
import type { StaffItem } from '../../services/staffService';
import { ArrowLeft, Check, Plus, Trash2, Layers, Building, Users, BookOpen } from 'lucide-react';
import styles from './DepartmentStudio.module.css';

interface DepartmentStudioProps {
  initialData: DepartmentItem | null;
  branches: BranchItem[];
  batches: BatchItem[];
  subjects: SubjectItem[];
  staffList: StaffItem[];
  onSave: (payload: {
    name: string;
    status?: 'ACTIVE' | 'INACTIVE';
    branchIds?: string[];
  }) => Promise<void>;
  onCreateBatch: (payload: {
    name: string;
    branchId: string;
    subjectId: string;
    departmentId?: string;
    status?: string;
  }) => Promise<void>;
  onDeleteBatch: (batchId: string) => Promise<void>;
  onBack: () => void;
}

export default function DepartmentStudio({
  initialData,
  branches,
  batches,
  subjects,
  staffList,
  onSave,
  onCreateBatch,
  onDeleteBatch,
  onBack
}: DepartmentStudioProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BRANCHES' | 'BATCHES' | 'FACULTY'>('OVERVIEW');

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(initialData?.status || 'ACTIVE');

  // Branch Selection State
  const initialBranchIds = initialData?.branches?.map(b => b.id) || [];
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>(initialBranchIds);

  // New Batch Form Modal / Inline State
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchBranchId, setBatchBranchId] = useState(branches[0]?.id || '');
  const [batchSubjectId, setBatchSubjectId] = useState(subjects[0]?.id || '');
  const [batchBranchFilter, setBatchBranchFilter] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle Branch Checkbox
  const handleToggleBranch = (branchId: string) => {
    if (selectedBranchIds.includes(branchId)) {
      setSelectedBranchIds(selectedBranchIds.filter(id => id !== branchId));
    } else {
      setSelectedBranchIds([...selectedBranchIds, branchId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        status,
        branchIds: selectedBranchIds
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.id || !batchName.trim() || !batchBranchId || !batchSubjectId) return;

    setIsSubmitting(true);
    try {
      await onCreateBatch({
        name: batchName.trim(),
        branchId: batchBranchId,
        subjectId: batchSubjectId,
        departmentId: initialData.id,
        status: 'ACTIVE'
      });
      setBatchName('');
      setIsNewBatchOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter batches for this department
  const deptBatches = initialData?.id 
    ? batches.filter(b => b.departmentId === initialData.id || b.departmentName === initialData.name)
    : [];

  const filteredBatches = batchBranchFilter === 'ALL'
    ? deptBatches
    : deptBatches.filter(b => b.branchId === batchBranchFilter);

  // Filter faculty assigned to this department
  const deptFaculty = initialData?.id
    ? staffList.filter(s => s.assignedDepartments?.some(ad => ad.departmentId === initialData.id || ad.department?.id === initialData.id))
    : [];

  return (
    <div className={styles.studioContainer}>
      {/* 1. Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.breadcrumbGroup}>
          <button type="button" className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>
          <h2 className={styles.pageTitle}>
            {initialData ? `Department: ${initialData.name}` : 'New Master Department'}
          </h2>
        </div>

        <div className={styles.headerActions}>
          <button type="button" className={styles.btnCancel} onClick={onBack}>
            Cancel
          </button>
          <button 
            type="button" 
            className={styles.btnSave} 
            onClick={handleSave}
            disabled={isSubmitting || !name.trim()}
          >
            <Check size={16} strokeWidth={2.5} />
            <span>{isSubmitting ? 'Saving...' : 'Save Department'}</span>
          </button>
        </div>
      </div>

      {/* 2. SubNav Tabs */}
      <div className={styles.tabsContainer}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'OVERVIEW' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('OVERVIEW')}
        >
          <Layers size={16} />
          <span>Department Info</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'BRANCHES' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('BRANCHES')}
        >
          <Building size={16} />
          <span>Active Campuses & Branches</span>
          <span className={styles.tabCount}>{selectedBranchIds.length}</span>
        </button>

        {initialData?.id && (
          <>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'BATCHES' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('BATCHES')}
            >
              <BookOpen size={16} />
              <span>Department Batches</span>
              <span className={styles.tabCount}>{deptBatches.length}</span>
            </button>

            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'FACULTY' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('FACULTY')}
            >
              <Users size={16} />
              <span>Assigned Faculty & Teachers</span>
              <span className={styles.tabCount}>{deptFaculty.length}</span>
            </button>
          </>
        )}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className={styles.panelCard}>
          <form onSubmit={handleSave} className={styles.formGrid}>
            <div className="formGroup">
              <label className="label">Department Name *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. সঙ্গীত বিভাগ (Music Department)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="formGroup">
              <label className="label">Status *</label>
              <select
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              >
                <option value="ACTIVE">ACTIVE (Active Faculty)</option>
                <option value="INACTIVE">INACTIVE (Archived)</option>
              </select>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: ACTIVE BRANCHES */}
      {activeTab === 'BRANCHES' && (
        <div className={styles.panelCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Select campus branches offering this department ({selectedBranchIds.length} of {branches.length} selected)
            </span>
          </div>

          <div className={styles.checkGrid}>
            {branches.map((branch) => {
              const isSelected = selectedBranchIds.includes(branch.id);
              return (
                <div
                  key={branch.id}
                  className={`${styles.checkCard} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleToggleBranch(branch.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    style={{ accentColor: '#FF790E', width: 18, height: 18, marginTop: 2, cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className={styles.checkCardTitle}>{branch.name}</div>
                    <div className={styles.checkCardSubtitle}>
                      {branch.type} Campus • {branch.code || 'NO-CODE'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENT BATCHES */}
      {activeTab === 'BATCHES' && (
        <div className={styles.panelCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Filter Branch:
              </span>
              <select
                className="select"
                value={batchBranchFilter}
                onChange={(e) => setBatchBranchFilter(e.target.value)}
                style={{ width: 'auto', padding: '4px 10px', fontSize: '0.82rem' }}
              >
                <option value="ALL">All Branches</option>
                {branches.filter(b => selectedBranchIds.includes(b.id)).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btnPrimary"
              onClick={() => setIsNewBatchOpen(true)}
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
              <span>New Batch</span>
            </button>
          </div>

          {/* New Batch Inline Form */}
          {isNewBatchOpen && (
            <form onSubmit={handleCreateBatchSubmit} style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-body, #F8FAFC)',
              border: '1px solid #FF790E',
              marginBottom: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
              gap: '12px',
              alignItems: 'flex-end'
            }}>
              <div className="formGroup" style={{ margin: 0 }}>
                <label className="label">Batch Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Vocal Music Batch 01"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  required
                />
              </div>

              <div className="formGroup" style={{ margin: 0 }}>
                <label className="label">Branch Campus *</label>
                <select
                  className="select"
                  value={batchBranchId}
                  onChange={(e) => setBatchBranchId(e.target.value)}
                >
                  {branches.filter(b => selectedBranchIds.includes(b.id)).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="formGroup" style={{ margin: 0 }}>
                <label className="label">Subject / Course *</label>
                <select
                  className="select"
                  value={batchSubjectId}
                  onChange={(e) => setBatchSubjectId(e.target.value)}
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btnSecondary"
                  onClick={() => setIsNewBatchOpen(false)}
                  style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btnPrimary"
                  disabled={isSubmitting || !batchName.trim()}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    backgroundColor: '#FF790E',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          )}

          {/* Batches Strip List */}
          <div className={styles.batchListStrip}>
            {filteredBatches.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border-dashed)', borderRadius: '8px' }}>
                No regular batches found in this department/branch.
              </div>
            ) : (
              filteredBatches.map(b => (
                <div key={b.id} className={styles.batchRow}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.90rem', color: 'var(--text-primary)' }}>
                      {b.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', gap: '12px' }}>
                      <span><strong>Campus:</strong> {b.branchName}</span>
                      <span><strong>Course:</strong> {b.subjectName}</span>
                      <span><strong>Students:</strong> {b.totalStudents}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => onDeleteBatch(b.id)}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        cursor: 'pointer'
                      }}
                      title="Delete Batch"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: FACULTY & TEACHERS */}
      {activeTab === 'FACULTY' && (
        <div className={styles.panelCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Assigned Faculty & Teachers for {initialData?.name} ({deptFaculty.length})
            </span>
          </div>

          <div className={styles.batchListStrip}>
            {deptFaculty.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border-dashed)', borderRadius: '8px' }}>
                No faculty members currently assigned to this department.
              </div>
            ) : (
              deptFaculty.map(s => (
                <div key={s.id} className={styles.batchRow}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.90rem', color: 'var(--text-primary)' }}>
                      {s.fullName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {s.designation || 'Faculty Member'} • {s.phone || 'No phone'}
                    </div>
                  </div>

                  <div className={styles.staffPill}>
                    {s.role}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
