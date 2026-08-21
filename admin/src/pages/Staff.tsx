import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users,
  Plus, 
  Building2, 
  Trash2,
  CheckCircle2,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  staffService, 
  type StaffItem, 
  type CreateStaffPayload 
} from '../services/staffService';
import { academicService, type BranchItem, type DepartmentItem } from '../services/academicService';
import { fetchBatches, type BatchItem } from '../services/batchService';
import StaffStudio from '../components/staff/StaffStudio';
import TableActionMenu from '../components/ui/TableActionMenu';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UserAvatar } from '../components/ui/UserAvatar';
import { CustomSelect } from '../components/ui/CustomSelect';
import { OrgHierarchyCanvas } from '../components/hierarchy/OrgHierarchyCanvas';

// Reusable Corporate UI Kit (Matching Saimum Design System)
import { PageHeader } from '../components/ui/PageHeader';
import { MetricsStrip, type MetricItem } from '../components/ui/MetricsStrip';
import { SubNavTabs, type TabItem } from '../components/ui/SubNavTabs';
import { DataTableToolbar } from '../components/ui/DataTableToolbar';
import { CustomCheckbox } from '../components/ui/CustomCheckbox';
import { FloatingActionBar, type BulkActionItem } from '../components/ui/FloatingActionBar';

import styles from './Staff.module.css';

export default function Staff() {
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'SUPER_ADMIN' | 'ACCOUNT_OFFICER' | 'STAFF' | 'INACTIVE'>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'tree'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Full-Screen Studio State
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [staffRes, branchesRes, departmentsRes, batchesRes] = await Promise.all([
        staffService.getStaff({
          role: activeTab === 'INACTIVE' ? 'ALL' : activeTab,
          status: activeTab === 'INACTIVE' ? 'INACTIVE' : 'ALL',
          branchId: selectedBranch,
          search
        }),
        academicService.getBranches().catch(() => ({ success: true, data: [] })),
        academicService.getDepartments().catch(() => ({ success: true, data: [] })),
        fetchBatches().catch(() => [])
      ]);

      if (staffRes.success) {
        setStaffList(staffRes.data);
      }
      if (branchesRes.success) {
        setBranches(branchesRes.data);
      }
      if (departmentsRes.success) {
        setDepartments(departmentsRes.data);
      }
      if (Array.isArray(batchesRes)) {
        setBatches(batchesRes);
      }
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedBranch, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create / Edit Staff
  const handleSaveStaff = async (payload: CreateStaffPayload) => {
    try {
      if (editingStaff) {
        const res = await staffService.updateStaff(editingStaff.id, payload);
        if (res.success) {
          setStaffList(prev => prev.map(s => s.id === editingStaff.id ? res.data : s));
        }
        setEditingStaff(null);
      } else {
        const res = await staffService.createStaff(payload);
        if (res.success) {
          setStaffList(prev => [res.data, ...prev]);
        }
      }
      setIsStudioOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Failed to save staff member:', err);
      alert(err.message || 'Failed to save staff member.');
    }
  };

  // Actions
  const handleToggleStatus = async (staff: StaffItem) => {
    try {
      const res = await staffService.toggleStaffStatus(staff.id);
      if (res.success) {
        setStaffList(prev => prev.map(s => s.id === staff.id ? res.data : s));
      }
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (staff: StaffItem) => {
    if (confirm(`Are you sure you want to remove "${staff.fullName}"?`)) {
      try {
        const res = await staffService.deleteStaff(staff.id);
        if (res.success) {
          setStaffList(prev => prev.filter(s => s.id !== staff.id));
          setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(staff.id);
            return next;
          });
        }
      } catch (err: any) {
        console.error('Failed to delete staff:', err);
        alert(err.message || 'Failed to delete staff member.');
      }
    }
  };

  // Filtered list
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      if (activeTab === 'INACTIVE' && s.status !== 'INACTIVE') return false;
      if (activeTab === 'SUPER_ADMIN' && s.role !== 'SUPER_ADMIN') return false;
      if (activeTab === 'ACCOUNT_OFFICER' && s.role !== 'ACCOUNT_OFFICER') return false;
      if (activeTab === 'STAFF' && (s.role === 'SUPER_ADMIN' || s.role === 'ACCOUNT_OFFICER')) return false;
      return true;
    });
  }, [staffList, activeTab]);

  // Bulk Selection
  const isAllSelected = filteredStaff.length > 0 && selectedIds.size === filteredStaff.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < filteredStaff.length;

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredStaff.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const bulkActions: BulkActionItem[] = [
    {
      id: 'bulk-active',
      label: 'Mark as Active',
      icon: <CheckCircle2 size={14} />,
      onClick: async () => {
        try {
          for (const id of Array.from(selectedIds)) {
            await staffService.updateStaff(id, { status: 'ACTIVE' });
          }
          setStaffList(prev => prev.map(s => selectedIds.has(s.id) ? { ...s, status: 'ACTIVE' } : s));
          setSelectedIds(new Set());
        } catch {
          alert('Failed to update some staff members');
        }
      }
    },
    {
      id: 'bulk-inactive',
      label: 'Mark as Inactive',
      onClick: async () => {
        try {
          for (const id of Array.from(selectedIds)) {
            await staffService.updateStaff(id, { status: 'INACTIVE' });
          }
          setStaffList(prev => prev.map(s => selectedIds.has(s.id) ? { ...s, status: 'INACTIVE' } : s));
          setSelectedIds(new Set());
        } catch {
          alert('Failed to update some staff members');
        }
      }
    },
    {
      id: 'bulk-delete',
      label: 'Delete Selected',
      icon: <Trash2 size={14} />,
      variant: 'danger',
      onClick: async () => {
        if (confirm(`Remove ${selectedIds.size} selected staff members?`)) {
          try {
            for (const id of Array.from(selectedIds)) {
              await staffService.deleteStaff(id);
            }
            setStaffList(prev => prev.filter(s => !selectedIds.has(s.id)));
            setSelectedIds(new Set());
          } catch {
            alert('Failed to delete some staff members');
          }
        }
      }
    }
  ];

  // Metric counts
  const totalStaffCount = staffList.length;
  const superAdminCount = staffList.filter(s => s.role === 'SUPER_ADMIN').length;
  const accountsOfficerCount = staffList.filter(s => s.role === 'ACCOUNT_OFFICER').length;
  const generalStaffCount = staffList.filter(s => s.role === 'STAFF').length;
  const activeCount = staffList.filter(s => s.status === 'ACTIVE').length;
  const inactiveCount = staffList.filter(s => s.status === 'INACTIVE').length;

  const metricItems: MetricItem[] = useMemo(() => [
    {
      id: 'total-staff',
      label: 'Total Staff & Faculty',
      value: totalStaffCount,
      delta: { value: 'Verified Team', isPositive: true },
      sparklineData: [2, 3, 3, 4, 4, 5, 5, totalStaffCount || 10],
      sparklineColor: '#FF790E'
    },
    {
      id: 'super-admins',
      label: 'Super Admins',
      value: superAdminCount,
      delta: { value: 'Central Access', isPositive: true },
      sparklineData: [1, 1, 1, 1, 1, 1, 1, superAdminCount || 2],
      sparklineColor: '#8B5CF6'
    },
    {
      id: 'accounts-officers',
      label: 'Accounts Officers',
      value: accountsOfficerCount,
      delta: { value: 'Finance & Ledger', isPositive: true },
      sparklineData: [1, 1, 1, 1, 1, 1, 1, accountsOfficerCount || 1],
      sparklineColor: '#F59E0B'
    },
    {
      id: 'general-staff',
      label: 'Branch & Dept Staff',
      value: generalStaffCount,
      delta: { value: 'Teaching & Operations', isPositive: true },
      sparklineData: [1, 1, 2, 2, 2, 2, 2, generalStaffCount || 8],
      sparklineColor: '#3B82F6'
    },
    {
      id: 'active-staff',
      label: 'Active Accounts',
      value: activeCount,
      delta: { value: 'Granted Access', isPositive: true },
      sparklineData: [2, 2, 3, 3, 4, 4, 4, activeCount || 10],
      sparklineColor: '#10B981'
    }
  ], [totalStaffCount, superAdminCount, accountsOfficerCount, generalStaffCount, activeCount]);

  const tabs: TabItem<'ALL' | 'SUPER_ADMIN' | 'ACCOUNT_OFFICER' | 'STAFF' | 'INACTIVE'>[] = [
    { id: 'ALL', label: 'All Staff', count: totalStaffCount },
    { id: 'SUPER_ADMIN', label: 'Super Admins', count: superAdminCount },
    { id: 'ACCOUNT_OFFICER', label: 'Accounts Officers', count: accountsOfficerCount },
    { id: 'STAFF', label: 'Staff & Faculty', count: generalStaffCount },
    { id: 'INACTIVE', label: 'Inactive', count: inactiveCount },
  ];

  // Helper for role badge
  const renderRoleBadge = (role: string) => {
    if (role === 'SUPER_ADMIN') {
      return <StatusBadge status="Super Admin" variant="purple" />;
    }
    if (role === 'ACCOUNT_OFFICER') {
      return <StatusBadge status="Accounts Officer" variant="warning" />;
    }
    return <StatusBadge status="Staff" variant="info" />;
  };

  // IF FULL-SCREEN STUDIO VIEW IS ACTIVE:
  if (isStudioOpen) {
    return (
      <StaffStudio 
        initialData={editingStaff}
        branches={branches}
        departments={departments}
        batches={batches}
        onSave={handleSaveStaff}
        onBack={() => {
          setIsStudioOpen(false);
          setEditingStaff(null);
        }}
      />
    );
  }

  // OTHERWISE RENDER STANDARD STAFF DIRECTORY:
  return (
    <div className={styles.container}>
      {/* 1. Standard Page Header */}
      <PageHeader 
        title="Staff & Faculty Management"
      />

      {/* 2. Overview Metrics Strip */}
      <MetricsStrip metrics={metricItems} />

      {/* 3. Sub Navigation Tabs (Role Filter) */}
      <SubNavTabs<'ALL' | 'SUPER_ADMIN' | 'ACCOUNT_OFFICER' | 'STAFF' | 'INACTIVE'> 
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id)}
        actions={
          <button 
            type="button" 
            className={styles.refreshBtn}
            onClick={loadData}
            title="Refresh Staff List"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        }
      />

      {/* 4. Data Table Toolbar */}
      <DataTableToolbar 
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff by name, email, designation..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        primaryActionLabel="Add Coordinator / Admin"
        onPrimaryActionClick={() => {
          setEditingStaff(null);
          setIsStudioOpen(true);
        }}
        primaryActionIcon={<Plus size={15} strokeWidth={2.5} />}
        extraFilters={
          <div className={styles.filterWrapper}>
            <CustomSelect
              options={[
                { value: 'ALL', label: 'All Branches' },
                ...branches.map(b => ({ value: b.id, label: b.name }))
              ]}
              value={selectedBranch}
              onChange={setSelectedBranch}
            />
          </div>
        }
      />

      {/* 5. Main Content: Table or Grid */}
      {viewMode === 'list' ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxTh}>
                  <CustomCheckbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onChange={handleToggleSelectAll}
                    ariaLabel="Select all staff"
                  />
                </th>
                <th className={styles.th}>Staff Member</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>Assigned Responsibilities</th>
                <th className={styles.th}>Contact Phone</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Joined</th>
                <th className={`${styles.th} ${styles.actionTd}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className={styles.loadingRow}>
                    Loading staff directory...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>
                    <div className={styles.emptyStateBox}>
                      <Users size={36} color="var(--text-tertiary)" />
                      <div>No staff members found matching your filter criteria.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map(staff => {
                  const isSelected = selectedIds.has(staff.id);
                  const assignedBatches = staff.assignedBatches || [];
                  return (
                    <tr 
                      key={staff.id} 
                      className={`${styles.tr} ${isSelected ? styles.trSelected : ''}`}
                    >
                      <td className={styles.checkboxTd} onClick={(e) => e.stopPropagation()}>
                        <CustomCheckbox
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(staff.id)}
                          ariaLabel={`Select staff ${staff.fullName}`}
                        />
                      </td>

                      <td className={styles.td}>
                        <div className={styles.personCell}>
                          <UserAvatar
                            name={staff.fullName}
                            photoUrl={staff.photoUrl || undefined}
                            size={34}
                            shape="circle"
                          />
                          <div className={styles.personMeta}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span className={styles.personName}>{staff.fullName}</span>
                              {staff.studentId && (
                                <span style={{ 
                                  fontSize: '0.68rem', 
                                  fontWeight: 600, 
                                  padding: '2px 6px', 
                                  borderRadius: '4px', 
                                  backgroundColor: 'var(--brand-orange-subtle, #FFF4EB)', 
                                  color: 'var(--brand-orange, #FF790E)',
                                  whiteSpace: 'nowrap'
                                }}>
                                  ID #{staff.studentId}
                                </span>
                              )}
                            </div>
                            <span className={styles.designationText}>{staff.designation || staff.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className={styles.td}>
                        {renderRoleBadge(staff.role)}
                      </td>

                      {/* Assigned Responsibilities (Departments & Wings) */}
                      <td className={styles.td}>
                        {staff.role === 'SUPER_ADMIN' ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#7C3AED', fontWeight: 600, fontSize: '0.78rem' }}>
                            <Building2 size={13} />
                            <span>Central Authority (All Departments & Wings)</span>
                          </div>
                        ) : (staff.assignedDepartments && staff.assignedDepartments.length > 0) ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '320px' }}>
                            {staff.assignedDepartments.map(ad => (
                              <span 
                                key={ad.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '5px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  background: 'var(--bg-surface-hover)',
                                  color: 'var(--text-primary)',
                                  border: '1px solid var(--border-light)'
                                }}
                              >
                                <Building2 size={11} color="var(--brand-orange)" />
                                <span>{ad.department?.name || 'Department'}</span>
                              </span>
                            ))}
                          </div>
                        ) : assignedBatches.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '320px' }}>
                            {assignedBatches.map(ab => (
                              <span 
                                key={ab.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 7px',
                                  borderRadius: '5px',
                                  fontSize: '0.70rem',
                                  fontWeight: 600,
                                  background: 'var(--bg-surface-hover)',
                                  color: 'var(--text-primary)',
                                  border: '1px solid var(--border-light)'
                                }}
                              >
                                <Layers size={10} color="var(--brand-orange)" />
                                <span>{ab.batch?.name}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className={styles.branchCell}>
                            <Building2 size={13} color="var(--text-tertiary)" />
                            <span className={styles.branchNameText}>General Faculty</span>
                          </div>
                        )}
                      </td>

                      <td className={styles.td}>
                        <div className={styles.contactCell}>
                          <span className={styles.phoneText}>{staff.phone || '-'}</span>
                        </div>
                      </td>

                      <td className={styles.td}>
                        <StatusBadge status={staff.status} />
                      </td>

                      <td className={styles.td} style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
                        {staff.joiningDate || staff.createdAt.split('T')[0]}
                      </td>

                      <td className={`${styles.td} ${styles.actionTd}`} onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu 
                          items={[]}
                          status={staff.status}
                          onEdit={() => {
                            setEditingStaff(staff);
                            setIsStudioOpen(true);
                          }}
                          onToggleStatus={() => handleToggleStatus(staff)}
                          onDelete={() => handleDelete(staff)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className={styles.staffGrid}>
          {filteredStaff.map(staff => {
            const assignedDepts = staff.assignedDepartments || [];
            return (
              <div className={styles.staffCard} key={staff.id}>
                {/* Card Top */}
                <div className={styles.cardTop}>
                  <UserAvatar
                    name={staff.fullName}
                    photoUrl={staff.photoUrl || undefined}
                    size={42}
                    shape="circle"
                  />
                  <div className={styles.cardHeaderInfo}>
                    <span className={styles.cardName}>{staff.fullName}</span>
                    <span className={styles.cardDesignation}>{staff.designation || staff.role}</span>
                  </div>
                  {renderRoleBadge(staff.role)}
                </div>

                {/* Card Details */}
                <div className={styles.cardDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>
                      <Building2 size={13} /> Campus
                    </span>
                    <span className={styles.detailValue}>
                      {staff.branch ? staff.branch.name : 'Global / All Campuses'}
                    </span>
                  </div>

                  {/* Assigned Departments */}
                  {staff.role !== 'SUPER_ADMIN' && assignedDepts.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '2px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={11} color="var(--brand-orange)" /> Assigned Departments ({assignedDepts.length}):
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {assignedDepts.map(ad => (
                          <span 
                            key={ad.id}
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'var(--bg-body)',
                              border: '1px solid var(--border-light)',
                              color: 'var(--text-primary)'
                            }}
                          >
                            {ad.department?.name || 'Department'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>
                      <Mail size={13} /> Email
                    </span>
                    <span className={styles.detailValue} style={{ fontSize: '0.76rem' }}>
                      {staff.email}
                    </span>
                  </div>

                  {staff.phone && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>
                        <Phone size={13} /> Phone
                      </span>
                      <span className={styles.detailValue}>
                        {staff.phone}
                      </span>
                    </div>
                  )}

                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>
                      <Calendar size={13} /> Joined
                    </span>
                    <span className={styles.detailValue}>
                      {staff.joiningDate || staff.createdAt.split('T')[0]}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className={styles.cardFooter}>
                  <StatusBadge status={staff.status} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TableActionMenu 
                      items={[]}
                      status={staff.status}
                      onEdit={() => {
                        setEditingStaff(staff);
                        setIsStudioOpen(true);
                      }}
                      onToggleStatus={() => handleToggleStatus(staff)}
                      onDelete={() => handleDelete(staff)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <OrgHierarchyCanvas 
          staffList={staffList}
          branches={branches}
          departments={departments}
          batches={batches}
          onEditStaff={(staff) => {
            setEditingStaff(staff);
            setIsStudioOpen(true);
          }}
        />
      )}

      {/* 6. Floating Bulk Actions Bar */}
      <FloatingActionBar 
        selectedCount={selectedIds.size}
        onDiscard={() => setSelectedIds(new Set())}
        actions={bulkActions}
      />
    </div>
  );
}
