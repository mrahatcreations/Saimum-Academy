import { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Building2, 
  CheckCircle2, 
  ShieldCheck,
  Users,
  Check,
  FolderTree,
  Layers
} from 'lucide-react';
import type { StaffItem, StaffRole, CreateStaffPayload } from '../../services/staffService';
import type { BranchItem, DepartmentItem } from '../../services/academicService';
import type { BatchItem } from '../../services/batchService';
import { UserAvatar } from '../ui/UserAvatar';
import styles from './StaffStudio.module.css';

interface StaffStudioProps {
  initialData?: StaffItem | null;
  branches: BranchItem[];
  departments: DepartmentItem[];
  batches: BatchItem[];
  onSave: (payload: CreateStaffPayload) => void;
  onBack: () => void;
}

export default function StaffStudio({
  initialData,
  branches,
  departments,
  batches,
  onSave,
  onBack
}: StaffStudioProps) {
  const [formData, setFormData] = useState<CreateStaffPayload>({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    designation: initialData?.designation || '',
    role: (initialData?.role as StaffRole) || 'STAFF',
    branchId: initialData?.branchId || '',
    status: initialData?.status || 'ACTIVE',
    joiningDate: initialData?.joiningDate || new Date().toISOString().split('T')[0],
    notes: initialData?.notes || '',
    departmentIds: initialData?.assignedDepartments?.map(d => d.departmentId || d.department?.id) || []
  });

  // Branch filter in right pane
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');

  // Toggle single department assignment
  const handleToggleDepartment = (deptId: string) => {
    const current = formData.departmentIds || [];
    if (current.includes(deptId)) {
      setFormData({ ...formData, departmentIds: current.filter(id => id !== deptId) });
    } else {
      setFormData({ ...formData, departmentIds: [...current, deptId] });
    }
  };

  // Toggle all departments
  const handleToggleAllDepartments = () => {
    const current = new Set(formData.departmentIds || []);
    const allAssigned = departments.length > 0 && departments.every(d => current.has(d.id));
    if (allAssigned) {
      setFormData({ ...formData, departmentIds: [] });
    } else {
      setFormData({ ...formData, departmentIds: departments.map(d => d.id) });
    }
  };

  // Assigned departments list
  const assignedDepartmentItems = useMemo(() => {
    const assignedIds = new Set(formData.departmentIds || []);
    return departments.filter(d => assignedIds.has(d.id));
  }, [departments, formData.departmentIds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isSuperAdmin = formData.role === 'SUPER_ADMIN';

  return (
    <div className={styles.studioContainer}>
      {/* 1. Top Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.breadcrumbGroup}>
          <button type="button" className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={15} />
            <span>Staff Directory</span>
          </button>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <h2 className={styles.pageTitle}>
            {initialData ? `Edit ${initialData.fullName}` : 'Add New Staff / Coordinator'}
          </h2>
        </div>

        <div className={styles.headerActions}>
          <button type="button" className={styles.btnCancel} onClick={onBack}>
            Cancel
          </button>
          <button type="button" className={styles.btnSubmit} onClick={handleSubmit}>
            <Save size={15} />
            <span>{initialData ? 'Save Changes' : 'Create Staff Member'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Canvas */}
      <div className={styles.workspaceGrid}>
        {/* LEFT COLUMN: PROFILE & ROLE */}
        <div className={styles.panelCard}>
          <div className={styles.cardHeader}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="var(--brand-orange)" />
              <span>1. Profile Information</span>
            </span>
          </div>

          <div className={styles.avatarSection}>
            <UserAvatar 
              name={formData.fullName || 'New Staff'} 
              size={50} 
              shape="circle" 
            />
            <div className={styles.avatarDetails}>
              <span className={styles.avatarName}>
                {formData.fullName || 'Coordinator / Admin Name'}
              </span>
              <span className={styles.avatarSubtitle}>
                {formData.designation || (formData.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Department Coordinator')}
              </span>
            </div>
          </div>

          <div className={styles.formGrid}>
            {/* Full Name */}
            <div className="formGroup">
              <label className="label">Full Name *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Ustad Abdullah Al Noman"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            {/* Contact Phone */}
            <div className="formGroup">
              <label className="label">Contact Phone</label>
              <input
                type="tel"
                className="input"
                placeholder="+880 1711-XXXXXX"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Role */}
            <div className="formGroup">
              <label className="label">Official Role *</label>
              <select
                className="select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
              >
                <option value="STAFF">Staff & Faculty (Branch & Department Operations)</option>
                <option value="ACCOUNT_OFFICER">Accounts Officer (Financial Management & Ledger)</option>
                <option value="SUPER_ADMIN">Super Administrator (Central Full Access)</option>
              </select>
            </div>

            {/* Designation */}
            <div className="formGroup">
              <label className="label">Designation / Title</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. শিশু বিভাগীয় প্রধান / Vocal Coordinator"
                value={formData.designation || ''}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="formGroup">
              <label className="label">Email Address (Optional)</label>
              <input
                type="email"
                className="input"
                placeholder="coordinator@saimumacademy.org"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT COLUMN: DEPARTMENT & WING ASSIGNMENTS
            =================================================================== */}
        <div className={styles.panelCard}>
          <div className={styles.cardHeader}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderTree size={16} color="var(--brand-orange)" />
              <span>2. Department & Wing Assignments</span>
            </span>
            {!isSuperAdmin && (
              <span style={{ fontSize: '0.74rem', color: 'var(--brand-orange)', fontWeight: 700 }}>
                {assignedDepartmentItems.length} Departments Assigned
              </span>
            )}
          </div>

          {isSuperAdmin ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={44} color="#7C3AED" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                Central Authority Account
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.5 }}>
                Super Administrators hold global central authority across all departments, wings, subjects, batches, and student records without requiring individual department assignments.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Branch Pill Filter Navigation */}
              <div className={styles.branchPillNav}>
                <button
                  type="button"
                  className={`${styles.branchPillBtn} ${selectedBranchId === 'ALL' ? styles.branchPillActive : ''}`}
                  onClick={() => setSelectedBranchId('ALL')}
                >
                  <span>All Campuses</span>
                  <span className={`${styles.pillCountBadge} ${selectedBranchId === 'ALL' ? styles.pillCountBadgeActive : ''}`}>
                    {formData.departmentIds?.length || 0}
                  </span>
                </button>

                {branches.map(branch => (
                  <button
                    key={branch.id}
                    type="button"
                    className={`${styles.branchPillBtn} ${selectedBranchId === branch.id ? styles.branchPillActive : ''}`}
                    onClick={() => setSelectedBranchId(branch.id)}
                  >
                    <Building2 size={13} />
                    <span>{branch.name}</span>
                  </button>
                ))}
              </div>

              {/* Controls Bar */}
              <div className={styles.canvasControlsRow}>
                <span>Click any department below to assign coordinator responsibility</span>
                {departments.length > 0 && (
                  <button
                    type="button"
                    className={styles.quickToggleAllBtn}
                    onClick={handleToggleAllDepartments}
                  >
                    <CheckCircle2 size={13} />
                    <span>
                      {departments.every(d => (formData.departmentIds || []).includes(d.id)) 
                        ? 'Deselect All Departments' 
                        : 'Select All Departments'}
                    </span>
                  </button>
                )}
              </div>

              {/* Multiple Department Cards Grid */}
              {departments.length === 0 ? (
                <div className={styles.emptyNoticeBox}>
                  No active departments found. Create departments in /departments first.
                </div>
              ) : (
                <div className={styles.batchCardsGrid}>
                  {departments.map(dept => {
                    const isAssigned = (formData.departmentIds || []).includes(dept.id);
                    
                    // Filter batches belonging to this department
                    const deptBatches = batches.filter(b => {
                      const matchesDept = b.departmentName === dept.name || b.name.includes(dept.name);
                      const matchesBranch = selectedBranchId === 'ALL' || b.branchId === selectedBranchId;
                      return matchesDept && matchesBranch;
                    });

                    const totalStudentsInDept = deptBatches.reduce((sum, b) => sum + (b.totalStudents || 0), 0);

                    return (
                      <div
                        key={dept.id}
                        className={`${styles.batchCardItem} ${isAssigned ? styles.batchCardAssigned : ''}`}
                        onClick={() => handleToggleDepartment(dept.id)}
                      >
                        {/* 1. Card Top: Department Tag + Assigned State */}
                        <div className={styles.cardTopRow}>
                          <span className={styles.subjectPillBadge}>
                            Academic Department
                          </span>
                          {isAssigned ? (
                            <span className={styles.assignedStateBadge}>
                              <Check size={11} strokeWidth={3} />
                              <span>Assigned</span>
                            </span>
                          ) : (
                            <span className={styles.unassignedStateBadge}>
                              <span>+ Assign Dept</span>
                            </span>
                          )}
                        </div>

                        {/* 2. Card Middle: Department Name & Scope */}
                        <div className={styles.cardMidSection}>
                          <span className={styles.cardBatchTitle}>
                            {dept.name}
                          </span>
                          <span className={styles.cardBranchText}>
                            <Building2 size={12} />
                            <span>
                              {selectedBranchId === 'ALL' ? 'Central & All Campuses' : branches.find(b => b.id === selectedBranchId)?.name || 'Campus'}
                            </span>
                          </span>
                        </div>

                        {/* 3. Card Footer: Active Batches & Student Counter */}
                        <div className={styles.cardFooterDivider}>
                          <span className={styles.studentCounter}>
                            <Layers size={12} />
                            <span>{deptBatches.length} Ongoing Batches</span>
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            <Users size={12} />
                            <span>{totalStudentsInDept} Students</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
