import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Building2 } from 'lucide-react';
import TableActionMenu from '../components/ui/TableActionMenu';
import { StatusBadge } from '../components/ui/StatusBadge';
import { academicService, type DepartmentItem, type BranchItem, type BatchItem } from '../services/academicService';
import { staffService, type StaffItem } from '../services/staffService';
import ManageDepartmentModal from '../components/modals/ManageDepartmentModal';

// Reusable Corporate UI Kit
import { PageHeader } from '../components/ui/PageHeader';
import { DataTableToolbar } from '../components/ui/DataTableToolbar';
import { MetricsStrip, type MetricItem } from '../components/ui/MetricsStrip';
import Button from '../components/ui/Button';

import styles from './Departments.module.css';

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
        academicService.getDepartments().catch(() => ({ success: false, data: [] })),
        academicService.getBranches().catch(() => ({ success: false, data: [] })),
        academicService.getBatches().catch(() => ({ success: false, data: [] })),
        staffService.getStaff().catch(() => ({ success: false, data: [] }))
      ]);

      if (deptRes && deptRes.data) setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      if (branchRes && branchRes.data) setBranches(Array.isArray(branchRes.data) ? branchRes.data : []);
      if (batchRes && batchRes.data) setBatches(Array.isArray(batchRes.data) ? batchRes.data : []);
      if (staffRes && staffRes.data) setStaffList(Array.isArray(staffRes.data) ? staffRes.data : []);
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

  const filtered = useMemo(() => {
    return (departments || []).filter(d => 
      (d.name || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [departments, search]);

  const activeCount = (departments || []).filter(d => d.status === 'ACTIVE').length;
  const totalBatchesCount = (batches || []).length;
  const totalStaffCount = (staffList || []).length;

  const metricItems: MetricItem[] = [
    {
      id: 'total-depts',
      label: 'Total Departments',
      value: departments.length,
      delta: { value: `${activeCount} Active`, isPositive: true },
      sparklineData: [2, 3, 4, 5, departments.length || 5],
      sparklineColor: '#FF790E'
    },
    {
      id: 'active-campuses',
      label: 'Active Campuses',
      value: branches.length,
      delta: { value: 'All Active', isPositive: true },
      sparklineData: [1, 2, 2, 3, branches.length || 3],
      sparklineColor: '#10B981'
    },
    {
      id: 'total-batches',
      label: 'Regular Batches',
      value: totalBatchesCount,
      delta: { value: 'Active Batches', isPositive: true },
      sparklineData: [2, 4, 6, totalBatchesCount || 6],
      sparklineColor: '#3B82F6'
    },
    {
      id: 'total-faculty',
      label: 'Staff & Faculty',
      value: totalStaffCount,
      delta: { value: 'Staff Members', isPositive: true },
      sparklineData: [4, 8, 12, totalStaffCount || 12],
      sparklineColor: '#8B5CF6'
    }
  ];

  return (
    <div className={styles.container}>
      {/* 1. Page Header */}
      <PageHeader 
        title="Departments" 
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={15} />}
            onClick={() => {
              setEditingDept(null);
              setIsModalOpen(true);
            }}
          >
            + New Department
          </Button>
        }
      />

      {/* 2. Overview Metrics Strip */}
      <MetricsStrip metrics={metricItems} />

      {/* 3. Global Table Toolbar */}
      <DataTableToolbar 
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search departments by name..."
      />

      {/* 4. Global Standard Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Department Name</th>
                <th className={styles.th}>Active Campuses</th>
                <th className={styles.th}>Regular Batches</th>
                <th className={styles.th}>Faculty Members</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className={styles.td} style={{ textAlign: 'center', padding: '40px' }}>
                    Loading departments directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.td} style={{ textAlign: 'center', padding: '40px' }}>
                    No departments found. Click "+ New Department" to create one.
                  </td>
                </tr>
              ) : (
                filtered.map(dept => {
                  const activeBranches = Array.isArray(dept.branches) ? dept.branches : [];
                  const deptBatchCount = (batches || []).filter(b => b.departmentId === dept.id || b.departmentName === dept.name).length;
                  const facultyCount = (staffList || []).filter(s => 
                    Array.isArray(s.assignedDepartments) && s.assignedDepartments.some(ad => ad && (ad.departmentId === dept.id || ad.department?.id === dept.id))
                  ).length;

                  return (
                    <tr className={styles.tr} key={dept.id}>
                      <td className={styles.td}>
                        <div className={styles.deptNameCell}>
                          <span 
                            className={styles.deptTitle}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setEditingDept(dept);
                              setIsModalOpen(true);
                            }}
                          >
                            {dept.name}
                          </span>
                          <span className={styles.deptSub}>
                            ID: {dept.id}
                          </span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {activeBranches.length === 0 ? (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No campuses assigned</span>
                          ) : (
                            activeBranches.map(b => (
                              <span key={b.id} className={styles.campusPill}>
                                <Building2 size={12} />
                                <span>{b.name}</span>
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className={styles.td} style={{ fontWeight: 600 }}>
                        {deptBatchCount} Batches
                      </td>
                      <td className={styles.td} style={{ fontWeight: 600 }}>
                        {facultyCount} Faculty
                      </td>
                      <td className={styles.td}>
                        <StatusBadge status={dept.status} />
                      </td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <TableActionMenu 
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

        {/* 5. Footer Summary Strip */}
        <div className={styles.tableFooterStrip}>
          <span>
            Showing <strong>{filtered.length}</strong> of <strong>{departments.length}</strong> departments
          </span>
        </div>
      </div>

      {/* 6. Department Editor Modal */}
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
