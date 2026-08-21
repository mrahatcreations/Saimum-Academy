import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import TableActionMenu from '../components/ui/TableActionMenu';
import { StatusBadge } from '../components/ui/StatusBadge';
import { academicService, type DepartmentItem, type BranchItem, type BatchItem } from '../services/academicService';
import { staffService, type StaffItem } from '../services/staffService';
import ManageDepartmentModal from '../components/modals/ManageDepartmentModal';

// Reusable Corporate UI Kit
import { PageHeader } from '../components/ui/PageHeader';
import { DataTableToolbar } from '../components/ui/DataTableToolbar';
import { MetricsStrip, type MetricItem } from '../components/ui/MetricsStrip';

import styles from './Students.module.css';

export default function Departments() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [deptRes, branchRes, batchRes, staffRes] = await Promise.all([
        academicService.getDepartments(),
        academicService.getBranches(),
        academicService.getBatches(),
        staffService.getStaff()
      ]);

      if (deptRes.success) setDepartments(deptRes.data);
      if (branchRes.success) setBranches(branchRes.data);
      if (batchRes.success) setBatches(batchRes.data);
      if (staffRes.success) setStaffList(staffRes.data);
    } catch (err) {
      console.error('Failed to load departments data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveDepartment = async (payload: {
    name: string;
    status?: 'ACTIVE' | 'INACTIVE';
    branchIds?: string[];
  }) => {
    try {
      if (editingDept) {
        const res = await academicService.updateDepartment(editingDept.id, payload);
        if (res.success) {
          await loadData();
          setIsModalOpen(false);
          setEditingDept(null);
        }
      } else {
        const res = await academicService.createDepartment(payload);
        if (res.success) {
          await loadData();
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      console.error('Failed to save department:', err);
      alert(err.message || 'Failed to save department');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await academicService.updateDepartment(id, { status: nextStatus });
      if (res.success) {
        setDepartments(prev => prev.map(d => d.id === id ? { ...d, status: nextStatus } : d));
      }
    } catch (err) {
      console.error('Failed to toggle department status:', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete department "${name}"?`)) {
      try {
        const res = await academicService.deleteDepartment(id);
        if (res.success) {
          setDepartments(prev => prev.filter(d => d.id !== id));
        }
      } catch (err: any) {
        console.error('Failed to delete department:', err);
        alert(err.message || 'Failed to delete department');
      }
    }
  };

  const filtered = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = departments.filter(d => d.status === 'ACTIVE').length;
  const totalBatchesCount = batches.length;

  const metricItems: MetricItem[] = [
    {
      id: 'total-depts',
      label: 'Master Departments',
      value: departments.length,
      sparklineData: [2, 3, 4, 4, 5, 5, departments.length || 5],
      sparklineColor: '#FF790E'
    },
    {
      id: 'active-depts',
      label: 'Active Faculties',
      value: activeCount,
      sparklineData: [2, 2, 3, 4, activeCount || 4],
      sparklineColor: '#10B981'
    },
    {
      id: 'total-batches',
      label: 'Regular Batches',
      value: totalBatchesCount,
      sparklineData: [1, 2, 3, 4, totalBatchesCount || 4],
      sparklineColor: '#3B82F6'
    },
    {
      id: 'total-faculty',
      label: 'Staff & Teachers',
      value: staffList.length,
      sparklineData: [2, 4, 6, 8, staffList.length || 8],
      sparklineColor: '#8B5CF6'
    }
  ];

  return (
    <div className={styles.container}>
      {/* 1. Standard Page Header */}
      <PageHeader title="Departments" />

      {/* 2. Overview Metrics Strip */}
      <MetricsStrip metrics={metricItems} />

      {/* 3. Global Table Toolbar */}
      <DataTableToolbar 
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search departments by name..."
        primaryActionLabel="New Department"
        onPrimaryActionClick={() => {
          setEditingDept(null);
          setIsModalOpen(true);
        }}
        primaryActionIcon={<Plus size={15} strokeWidth={2.5} />}
      />

      {/* 4. Global Standard Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Department Name</th>
              <th className={styles.th}>Active Campuses</th>
              <th className={styles.th}>Regular Batches</th>
              <th className={styles.th}>Faculty Members</th>
              <th className={styles.th}>Status</th>
              <th className={`${styles.th} ${styles.actionTd}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className={styles.loadingRow}>
                  Loading departments directory...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  No departments found. Click "New Department" to create one.
                </td>
              </tr>
            ) : (
              filtered.map(dept => {
                const activeBranches = dept.branches || [];
                const deptBatchCount = batches.filter(b => b.departmentId === dept.id || b.departmentName === dept.name).length;
                const facultyCount = staffList.filter(s => s.assignedDepartments?.some(ad => ad.departmentId === dept.id || ad.department?.id === dept.id)).length;

                return (
                  <tr className={styles.tr} key={dept.id}>
                    <td className={styles.td} style={{ fontWeight: 700 }}>
                      <span 
                        style={{ cursor: 'pointer', color: 'var(--text-primary)' }}
                        onClick={() => {
                          setEditingDept(dept);
                          setIsModalOpen(true);
                        }}
                      >
                        {dept.name}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {activeBranches.length === 0 ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>No campuses</span>
                        ) : (
                          activeBranches.map(b => (
                            <span 
                              key={b.id}
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--bg-surface-hover, #F1F5F9)',
                                color: 'var(--text-secondary, #334155)',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            >
                              {b.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className={styles.td} style={{ fontWeight: 600 }}>
                      {deptBatchCount} Batches
                    </td>
                    <td className={styles.td} style={{ fontWeight: 600 }}>
                      {facultyCount} Teachers
                    </td>
                    <td className={styles.td}>
                      <StatusBadge status={dept.status} />
                    </td>
                    <td className={`${styles.td} ${styles.actionTd}`}>
                      <TableActionMenu 
                        items={[]}
                        status={dept.status}
                        onEdit={() => {
                          setEditingDept(dept);
                          setIsModalOpen(true);
                        }}
                        onToggleStatus={() => handleToggleStatus(dept.id, dept.status)}
                        onDelete={() => handleDelete(dept.id, dept.name)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Department Editor Modal */}
      <ManageDepartmentModal
        isOpen={isModalOpen}
        initialData={editingDept}
        branches={branches}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDept(null);
        }}
        onSave={handleSaveDepartment}
      />
    </div>
  );
}
