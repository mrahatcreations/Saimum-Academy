import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import TableActionMenu from '../components/ui/TableActionMenu';
import { StatusBadge } from '../components/ui/StatusBadge';
import { academicService, type BranchItem, type DepartmentItem, type BatchItem } from '../services/academicService';
import ManageBranchModal from '../components/modals/ManageBranchModal';

// Reusable Corporate UI Kit
import { PageHeader } from '../components/ui/PageHeader';
import { DataTableToolbar } from '../components/ui/DataTableToolbar';
import { MetricsStrip, type MetricItem } from '../components/ui/MetricsStrip';

import styles from './Students.module.css';

export default function Branches() {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [branchRes, deptRes, batchRes] = await Promise.all([
        academicService.getBranches(),
        academicService.getDepartments(),
        academicService.getBatches()
      ]);

      if (branchRes.success) setBranches(branchRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
      if (batchRes.success) setBatches(batchRes.data);
    } catch (err) {
      console.error('Failed to load branches data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveBranch = async (payload: {
    name: string;
    code?: string;
    type?: 'PHYSICAL' | 'ONLINE';
    status?: 'ACTIVE' | 'INACTIVE';
    departmentIds?: string[];
  }) => {
    try {
      if (editingBranch) {
        const res = await academicService.updateBranch(editingBranch.id, payload);
        if (res.success) {
          await loadData();
          setIsModalOpen(false);
          setEditingBranch(null);
        }
      } else {
        const res = await academicService.createBranch(payload);
        if (res.success) {
          await loadData();
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      console.error('Failed to save branch:', err);
      alert(err.message || 'Failed to save branch');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await academicService.updateBranch(id, { status: nextStatus });
      if (res.success) {
        setBranches(prev => prev.map(b => b.id === id ? { ...b, status: nextStatus } : b));
      }
    } catch (err) {
      console.error('Failed to toggle branch status:', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete branch "${name}"?`)) {
      try {
        const res = await academicService.deleteBranch(id);
        if (res.success) {
          setBranches(prev => prev.filter(b => b.id !== id));
        }
      } catch (err: any) {
        console.error('Failed to delete branch:', err);
        alert(err.message || 'Failed to delete branch');
      }
    }
  };

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    (b.code && b.code.toLowerCase().includes(search.toLowerCase()))
  );

  const physicalCount = branches.filter(b => b.type === 'PHYSICAL').length;
  const onlineCount = branches.filter(b => b.type === 'ONLINE').length;

  const metricItems: MetricItem[] = [
    {
      id: 'total-branches',
      label: 'Campus Branches',
      value: branches.length,
      sparklineData: [1, 2, 3, 3, 4, 4, branches.length || 4],
      sparklineColor: '#FF790E'
    },
    {
      id: 'physical',
      label: 'Physical Campuses',
      value: physicalCount,
      sparklineData: [1, 2, 2, 3, 3, physicalCount || 3],
      sparklineColor: '#10B981'
    },
    {
      id: 'online',
      label: 'Online Campuses',
      value: onlineCount,
      sparklineData: [1, 1, 1, 1, onlineCount || 1],
      sparklineColor: '#3B82F6'
    },
    {
      id: 'departments',
      label: 'Active Departments',
      value: departments.length,
      sparklineData: [2, 3, 4, 5, departments.length || 5],
      sparklineColor: '#8B5CF6'
    }
  ];

  return (
    <div className={styles.container}>
      {/* 1. Standard Page Header */}
      <PageHeader title="Branches" />

      {/* 2. Overview Metrics Strip */}
      <MetricsStrip metrics={metricItems} />

      {/* 3. Global Table Toolbar */}
      <DataTableToolbar 
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search branches by name or code..."
        primaryActionLabel="New Branch"
        onPrimaryActionClick={() => {
          setEditingBranch(null);
          setIsModalOpen(true);
        }}
        primaryActionIcon={<Plus size={15} strokeWidth={2.5} />}
      />

      {/* 4. Global Standard Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Branch Name</th>
              <th className={styles.th}>Code</th>
              <th className={styles.th}>Active Departments</th>
              <th className={styles.th}>Regular Batches</th>
              <th className={styles.th}>Campus Type</th>
              <th className={styles.th}>Status</th>
              <th className={`${styles.th} ${styles.actionTd}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className={styles.loadingRow}>
                  Loading branches directory...
                </td>
              </tr>
            ) : filteredBranches.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyRow}>
                  No branches found. Click "New Branch" to create one.
                </td>
              </tr>
            ) : (
              filteredBranches.map(branch => {
                const branchBatchCount = batches.filter(b => b.branchId === branch.id).length;
                const activeDepts = branch.departments || [];

                return (
                  <tr className={styles.tr} key={branch.id}>
                    <td className={styles.td} style={{ fontWeight: 700 }}>
                      <span 
                        style={{ cursor: 'pointer', color: 'var(--text-primary)' }}
                        onClick={() => {
                          setEditingBranch(branch);
                          setIsModalOpen(true);
                        }}
                      >
                        {branch.name}
                      </span>
                    </td>
                    <td className={styles.td} style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {branch.code || '-'}
                    </td>
                    <td className={styles.td}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {activeDepts.length === 0 ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>No departments</span>
                        ) : (
                          activeDepts.map(d => (
                            <span 
                              key={d.department.id}
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--bg-surface-hover, #F1F5F9)',
                                color: 'var(--text-secondary, #334155)',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            >
                              {d.department.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className={styles.td} style={{ fontWeight: 600 }}>
                      {branchBatchCount} Batches
                    </td>
                    <td className={styles.td}>
                      <StatusBadge status={branch.type} />
                    </td>
                    <td className={styles.td}>
                      <StatusBadge status={branch.status} />
                    </td>
                    <td className={`${styles.td} ${styles.actionTd}`}>
                      <TableActionMenu 
                        items={[]}
                        status={branch.status}
                        onEdit={() => {
                          setEditingBranch(branch);
                          setIsModalOpen(true);
                        }}
                        onToggleStatus={() => handleToggleStatus(branch.id, branch.status)}
                        onDelete={() => handleDelete(branch.id, branch.name)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Branch Editor Modal */}
      <ManageBranchModal
        isOpen={isModalOpen}
        initialData={editingBranch}
        departments={departments}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBranch(null);
        }}
        onSave={handleSaveBranch}
      />
    </div>
  );
}
