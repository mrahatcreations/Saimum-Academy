import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  RefreshCw 
} from 'lucide-react';
import { staffService, type StaffItem, type CreateStaffPayload } from '../services/staffService';
import { academicService, type BranchItem, type DepartmentItem } from '../services/academicService';
import { fetchBatches, type BatchItem } from '../services/batchService';
import { PageHeader } from '../components/ui/PageHeader';
import { MetricsStrip, type MetricItem } from '../components/ui/MetricsStrip';
import { OrgHierarchyCanvas } from '../components/hierarchy/OrgHierarchyCanvas';
import StaffStudio from '../components/staff/StaffStudio';
import styles from './Staff.module.css';

export default function OrgHierarchy() {
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);

  // Edit Staff State
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [staffRes, branchesRes, departmentsRes, batchesRes] = await Promise.all([
        staffService.getStaff({ role: 'ALL', status: 'ALL' }),
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
    } catch (err) {
      console.error('Failed to load hierarchy data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Save Staff
  const handleSaveStaff = async (payload: CreateStaffPayload) => {
    try {
      if (editingStaff) {
        await staffService.updateStaff(editingStaff.id, payload);
        setEditingStaff(null);
      } else {
        await staffService.createStaff(payload);
      }
      setIsStudioOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save staff member.');
    }
  };

  // Metrics
  const superAdminCount = staffList.filter(s => s.role === 'SUPER_ADMIN').length;
  const coordinatorCount = staffList.filter(s => s.role === 'COORDINATOR' || s.role === 'BRANCH_ADMIN').length;

  const metricItems: MetricItem[] = [
    {
      id: 'branches',
      label: 'Operational Branches',
      value: branches.length,
      delta: { value: 'Central & Zonal', isPositive: true },
      sparklineData: [1, 2, 3, 3, 4, 4, 4, branches.length || 4],
      sparklineColor: '#FF790E'
    },
    {
      id: 'departments',
      label: 'Master Departments',
      value: departments.length,
      delta: { value: 'Curriculum Units', isPositive: true },
      sparklineData: [2, 3, 4, 4, 5, 5, 5, departments.length || 5],
      sparklineColor: '#10B981'
    },
    {
      id: 'hq-admins',
      label: 'Central Super Admins',
      value: superAdminCount,
      delta: { value: 'HQ Directorate', isPositive: true },
      sparklineData: [1, 1, 1, 1, 1, 1, 1, superAdminCount || 1],
      sparklineColor: '#8B5CF6'
    },
    {
      id: 'coordinators',
      label: 'Branch & Faculty Staff',
      value: coordinatorCount,
      delta: { value: 'Faculty & Management', isPositive: true },
      sparklineData: [1, 2, 2, 3, 3, 4, 4, coordinatorCount || 8],
      sparklineColor: '#2563EB'
    }
  ];

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

  return (
    <div className={styles.container}>
      {/* 1. Page Header */}
      <PageHeader 
        title="Organizational Hierarchy Canvas"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button" 
              className={styles.refreshBtn}
              onClick={loadData}
              title="Refresh Hierarchy"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className={styles.addStaffBtn}
              onClick={() => {
                setEditingStaff(null);
                setIsStudioOpen(true);
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Add Staff / Coordinator</span>
            </button>
          </div>
        }
      />

      {/* 2. Top Summary KPI Metrics */}
      <MetricsStrip metrics={metricItems} />

      {/* 3. Infinite Visual Tree Canvas */}
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
    </div>
  );
}
