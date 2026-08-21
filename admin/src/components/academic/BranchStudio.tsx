import React, { useState } from 'react';
import type { BranchItem, DepartmentItem, BatchItem, SubjectItem } from '../../services/academicService';
import type { StaffItem } from '../../services/staffService';
import { ArrowLeft, Check, Plus, Trash2, Building, Layers, Users, BookOpen } from 'lucide-react';
import styles from './BranchStudio.module.css';

interface BranchStudioProps {
  initialData: BranchItem | null;
  departments: DepartmentItem[];
  batches: BatchItem[];
  subjects: SubjectItem[];
  staffList: StaffItem[];
  onSave: (payload: {
    name: string;
    code?: string;
    type?: 'PHYSICAL' | 'ONLINE';
    status?: 'ACTIVE' | 'INACTIVE';
    departmentIds?: string[];
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

export default function BranchStudio({
  initialData,
  departments,
  batches,
  subjects,
  staffList,
  onSave,
  onCreateBatch,
  onDeleteBatch,
  onBack
}: BranchStudioProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DEPARTMENTS' | 'BATCHES' | 'STAFF'>('OVERVIEW');

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [type, setType] = useState<'PHYSICAL' | 'ONLINE'>(initialData?.type || 'PHYSICAL');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(initialData?.status || 'ACTIVE');

  // Department Selection State
  const initialDeptIds = initialData?.departments?.map(d => d.department.id) || [];
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>(initialDeptIds);

  // New Batch Form Modal / Inline State
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchSubjectId, setBatchSubjectId] = useState(subjects[0]?.id || '');
  const [batchDeptFilter, setBatchDeptFilter] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle Department Checkbox
  const handleToggleDept = (deptId: string) => {
    if (selectedDeptIds.includes(deptId)) {
      setSelectedDeptIds(selectedDeptIds.filter(id => id !== deptId));
    } else {
      setSelectedDeptIds([...selectedDeptIds, deptId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.id || !batchName.trim() || !batchSubjectId) return;

    setIsSubmitting(true);
    try {
      await onCreateBatch({
        name: batchName.trim(),
        branchId: initialData.id,
        subjectId: batchSubjectId,
        status: 'ACTIVE'
      });
      setBatchName('');
      setIsNewBatchOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter batches for this branch
  const branchBatches = initialData?.id 
    ? batches.filter(b => b.branchId === initialData.id)
    : [];

  const filteredBatches = batchDeptFilter === 'ALL'
    ? branchBatches
    : branchBatches.filter(b => b.departmentId === batchDeptFilter);

  // Filter staff assigned to this branch
  const branchStaff = initialData?.id
    ? staffList.filter(s => s.branchId === initialData.id || s.assignedDepartments?.some(ad => ad.branchId === initialData.id))
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
            {initialData ? `Branch: ${initialData.name}` : 'New Campus Branch'}
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
            <span>{isSubmitting ? 'Saving...' : 'Save Branch'}</span>
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
          <Building size={16} />
          <span>General Info</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'DEPARTMENTS' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('DEPARTMENTS')}
        >
          <Layers size={16} />
          <span>Active Departments</span>
          <span className={styles.tabCount}>{selectedDeptIds.length}</span>
        </button>

        {initialData?.id && (
          <>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'BATCHES' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('BATCHES')}
            >
              <BookOpen size={16} />
              <span>Regular Batches</span>
              <span className={styles.tabCount}>{branchBatches.length}</span>
            </button>

            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'STAFF' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('STAFF')}
            >
              <Users size={16} />
              <span>Branch Faculty & Staff</span>
              <span className={styles.tabCount}>{branchStaff.length}</span>
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
              <label className="label">Branch Name *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Dhaka Paltan Branch"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="formGroup">
              <label className="label">Branch Code</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. PLT"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="formGroup">
              <label className="label">Branch Type *</label>
              <select
                className="select"
                value={type}
                onChange={(e) => setType(e.target.value as 'PHYSICAL' | 'ONLINE')}
              >
                <option value="PHYSICAL">Physical Campus (On-site)</option>
                <option value="ONLINE">Online Campus (Virtual)</option>
              </select>
            </div>

            <div className="formGroup">
              <label className="label">Operating Status *</label>
              <select
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              >
                <option value="ACTIVE">ACTIVE (Operational)</option>
                <option value="INACTIVE">INACTIVE (Closed / Suspended)</option>
              </select>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: ACTIVE DEPARTMENTS */}
      {activeTab === 'DEPARTMENTS' && (
        <div className={styles.panelCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Select departments active at this campus ({selectedDeptIds.length} of {departments.length} selected)
            </span>
          </div>

          <div className={styles.checkGrid}>
            {departments.map((dept) => {
              const isSelected = selectedDeptIds.includes(dept.id);
              return (
                <div
                  key={dept.id}
                  className={`${styles.checkCard} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleToggleDept(dept.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    style={{ accentColor: '#FF790E', width: 18, height: 18, marginTop: 2, cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className={styles.checkCardTitle}>{dept.name}</div>
                    <div className={styles.checkCardSubtitle}>
                      {dept.faculty?.length || 0} Faculty Members • {dept.branchCount || 0} Branches
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: REGULAR BATCHES */}
      {activeTab === 'BATCHES' && (
        <div className={styles.panelCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Filter Department:
              </span>
              <select
                className="select"
                value={batchDeptFilter}
                onChange={(e) => setBatchDeptFilter(e.target.value)}
                style={{ width: 'auto', padding: '4px 10px', fontSize: '0.82rem' }}
              >
                <option value="ALL">All Departments</option>
                {departments.filter(d => selectedDeptIds.includes(d.id)).map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto',
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
                      <span><strong>Dept:</strong> {b.departmentName || 'Master Dept'}</span>
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

      {/* TAB 4: FACULTY & STAFF */}
      {activeTab === 'STAFF' && (
        <div className={styles.panelCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Assigned Staff & Faculty for {initialData?.name} ({branchStaff.length})
            </span>
          </div>

          <div className={styles.batchListStrip}>
            {branchStaff.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border-dashed)', borderRadius: '8px' }}>
                No staff members currently assigned to this campus branch.
              </div>
            ) : (
              branchStaff.map(s => (
                <div key={s.id} className={styles.batchRow}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.90rem', color: 'var(--text-primary)' }}>
                      {s.fullName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {s.designation || (s.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Staff / Faculty')} • {s.phone || 'No phone'}
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
