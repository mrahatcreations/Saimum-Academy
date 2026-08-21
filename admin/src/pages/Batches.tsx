import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Layers,
  Plus, 
  Users, 
  Building2, 
  BookOpen, 
  GraduationCap, 
  Calendar,
  Eye,
  Trash2,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  fetchBatches, 
  fetchAcademicLookups, 
  updateBatch,
  deleteBatch,
  type BatchItem 
} from '../services/batchService';
import CreateBatchModal from '../components/modals/CreateBatchModal';
import BatchDetailsDrawer from '../components/modals/BatchDetailsDrawer';
import TableActionMenu from '../components/ui/TableActionMenu';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CustomSelect } from '../components/ui/CustomSelect';

// Reusable Corporate UI Kit (Matching Admissions & Students pages)
import { PageHeader } from '../components/ui/PageHeader';
import { MetricsStrip, type MetricItem } from '../components/ui/MetricsStrip';
import { SubNavTabs, type TabItem } from '../components/ui/SubNavTabs';
import { DataTableToolbar } from '../components/ui/DataTableToolbar';
import { CustomCheckbox } from '../components/ui/CustomCheckbox';
import { FloatingActionBar, type BulkActionItem } from '../components/ui/FloatingActionBar';

import styles from './Batches.module.css';

export default function Batches() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'UPCOMING' | 'INACTIVE'>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Lookups for filters
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);

  // Modals & Drawers state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);
  const [viewingBatch, setViewingBatch] = useState<BatchItem | null>(null);

  useEffect(() => {
    loadLookups();
    loadBatches();
  }, []);

  const loadLookups = async () => {
    try {
      const data = await fetchAcademicLookups();
      setBranches(data.branches);
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  };

  const loadBatches = useCallback(async () => {
    try {
      setLoading(true);
      const list = await fetchBatches({
        branchId: selectedBranch,
        status: activeTab,
        search
      });
      setBatches(list);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, activeTab, search]);

  // Re-fetch when filters or search change
  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  // Single Action Handlers
  const handleToggleStatus = async (batch: BatchItem) => {
    const nextStatus = batch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateBatch(batch.id, { status: nextStatus });
      setBatches(prev => prev.map(b => b.id === batch.id ? { ...b, status: nextStatus } : b));
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      alert(err.message || 'Failed to update batch status');
    }
  };

  const handleDelete = async (batch: BatchItem) => {
    if (confirm(`Are you sure you want to delete batch "${batch.name}"?`)) {
      try {
        await deleteBatch(batch.id);
        setBatches(prev => prev.filter(b => b.id !== batch.id));
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(batch.id);
          return next;
        });
      } catch (err: any) {
        console.error('Failed to delete batch:', err);
        alert(err.message || 'Failed to delete batch');
      }
    }
  };

  // Bulk Selection Handlers
  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      const matchesSearch = !search || 
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.subjectName.toLowerCase().includes(search.toLowerCase()) ||
        b.branchName.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [batches, search]);

  const isAllSelected = filteredBatches.length > 0 && selectedIds.size === filteredBatches.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < filteredBatches.length;

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredBatches.map(b => b.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkActions: BulkActionItem[] = [
    {
      id: 'bulk-active',
      label: 'Mark Active',
      icon: <CheckCircle2 size={14} />,
      onClick: async () => {
        try {
          for (const id of Array.from(selectedIds)) {
            await updateBatch(id, { status: 'ACTIVE' });
          }
          setBatches(prev => prev.map(b => selectedIds.has(b.id) ? { ...b, status: 'ACTIVE' } : b));
          setSelectedIds(new Set());
        } catch {
          alert('Failed to update some batches');
        }
      }
    },
    {
      id: 'bulk-delete',
      label: 'Delete Selected',
      icon: <Trash2 size={14} />,
      variant: 'danger',
      onClick: async () => {
        if (confirm(`Delete ${selectedIds.size} selected batches?`)) {
          try {
            for (const id of Array.from(selectedIds)) {
              await deleteBatch(id);
            }
            setBatches(prev => prev.filter(b => !selectedIds.has(b.id)));
            setSelectedIds(new Set());
          } catch {
            alert('Failed to delete some batches');
          }
        }
      }
    }
  ];

  // Metric counts
  const totalCount = batches.length;
  const activeCount = batches.filter(b => b.status === 'ACTIVE').length;
  const upcomingCount = batches.filter(b => b.status === 'UPCOMING').length;
  const inactiveCount = batches.filter(b => b.status === 'INACTIVE').length;
  const totalStudentsEnrolled = batches.reduce((sum, b) => sum + (b.totalStudents || 0), 0);
  const physicalBatches = batches.filter(b => b.branchType === 'PHYSICAL').length;
  const onlineBatches = batches.filter(b => b.branchType === 'ONLINE').length;

  const metricItems: MetricItem[] = useMemo(() => [
    {
      id: 'total-batches',
      label: 'Total Batches',
      value: totalCount,
      delta: { value: `${activeCount} active`, isPositive: true },
      sparklineData: [4, 6, 5, 8, 9, 11, 14, totalCount || 10],
      sparklineColor: '#FF790E'
    },
    {
      id: 'active-cohorts',
      label: 'Active Cohorts',
      value: activeCount,
      delta: { value: '100% Operational', isPositive: true },
      sparklineData: [3, 5, 6, 7, 8, 10, 11, activeCount || 8],
      sparklineColor: '#10B981'
    },
    {
      id: 'enrolled-students',
      label: 'Enrolled Students',
      value: totalStudentsEnrolled,
      delta: { value: '+12% this term', isPositive: true },
      sparklineData: [20, 35, 45, 60, 75, 90, 120, totalStudentsEnrolled || 150],
      sparklineColor: '#3B82F6'
    },
    {
      id: 'campus-distribution',
      label: 'Physical / Online',
      value: `${physicalBatches} / ${onlineBatches}`,
      delta: { value: 'Multi-campus', isPositive: true },
      sparklineData: [2, 4, 3, 5, 6, 7, 8, physicalBatches + onlineBatches || 10],
      sparklineColor: '#8B5CF6'
    }
  ], [totalCount, activeCount, totalStudentsEnrolled, physicalBatches, onlineBatches]);

  const tabs: TabItem<'ALL' | 'ACTIVE' | 'UPCOMING' | 'INACTIVE'>[] = [
    { id: 'ALL', label: 'All Batches', count: totalCount },
    { id: 'ACTIVE', label: 'Active', count: activeCount },
    { id: 'UPCOMING', label: 'Upcoming', count: upcomingCount },
    { id: 'INACTIVE', label: 'Inactive', count: inactiveCount },
  ];

  const handleCreateSuccess = (newBatch: BatchItem) => {
    if (editingBatch) {
      setBatches(batches.map(b => b.id === newBatch.id ? newBatch : b));
    } else {
      setBatches([newBatch, ...batches]);
    }
    setEditingBatch(null);
  };

  return (
    <div className={styles.container}>
      
      {/* 1. Standard Page Header */}
      <PageHeader 
        title="Batch & Cohort Management" 
      />

      {/* 2. Overview Metrics Strip */}
      <MetricsStrip metrics={metricItems} />

      {/* 3. Sub Navigation Tabs (Status Filter) */}
      <SubNavTabs<'ALL' | 'ACTIVE' | 'UPCOMING' | 'INACTIVE'> 
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id)}
        actions={
          <button 
            type="button" 
            className={styles.refreshBtn}
            onClick={loadBatches}
            title="Refresh Batches"
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
        searchPlaceholder="Search by batch, subject, branch..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        primaryActionLabel="New Batch"
        onPrimaryActionClick={() => {
          setEditingBatch(null);
          setIsCreateOpen(true);
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
                    ariaLabel="Select all batches"
                  />
                </th>
                <th className={styles.th}>Batch & Cohort</th>
                <th className={styles.th}>Subject</th>
                <th className={styles.th}>Branch</th>
                <th className={styles.th}>Department</th>
                <th className={styles.th}>Enrolled</th>
                <th className={styles.th}>Established</th>
                <th className={styles.th}>Status</th>
                <th className={`${styles.th} ${styles.actionTd}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className={styles.loadingRow}>
                    Loading batches directory...
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyRow}>
                    <div className={styles.emptyStateBox}>
                      <Layers size={36} color="var(--text-tertiary)" />
                      <div>No batches match your filter criteria.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBatches.map(batch => {
                  const isSelected = selectedIds.has(batch.id);
                  return (
                    <tr 
                      key={batch.id} 
                      className={`${styles.tr} ${isSelected ? styles.trSelected : ''}`}
                      onClick={() => setViewingBatch(batch)}
                    >
                      <td className={styles.checkboxTd} onClick={(e) => e.stopPropagation()}>
                        <CustomCheckbox
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(batch.id)}
                          ariaLabel={`Select batch ${batch.name}`}
                        />
                      </td>

                      <td className={styles.td}>
                        <div className={styles.batchNameCell}>
                          <span className={styles.batchNameTitle}>{batch.name}</span>
                          <span className={styles.batchCodeBadge}>ID: {batch.id.slice(0, 8)}</span>
                        </div>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.subjectCell}>
                          <BookOpen size={13} color="var(--brand-orange)" />
                          <span>{batch.subjectName}</span>
                        </div>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.branchCell}>
                          <span className={styles.branchName}>{batch.branchName}</span>
                          <span className={styles.branchTypeTag}>{batch.branchType}</span>
                        </div>
                      </td>

                      <td className={styles.td} style={{ color: 'var(--text-secondary)' }}>
                        {batch.departmentName}
                      </td>

                      <td className={styles.td}>
                        <span className={styles.studentBadge}>
                          <Users size={13} color="var(--brand-orange)" />
                          {batch.totalStudents || 0}
                        </span>
                      </td>

                      <td className={styles.td} style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
                        {batch.createdAt}
                      </td>

                      <td className={styles.td}>
                        <StatusBadge status={batch.status} />
                      </td>

                      <td className={`${styles.td} ${styles.actionTd}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.tableActions}>
                          <button 
                            type="button"
                            className={styles.btnRosterSmall}
                            onClick={() => setViewingBatch(batch)}
                            title="View Student Roster"
                          >
                            <Eye size={12} />
                            <span>Roster</span>
                          </button>
                          <TableActionMenu 
                            items={[]}
                            status={batch.status}
                            onView={() => setViewingBatch(batch)}
                            onEdit={() => {
                              setEditingBatch(batch);
                              setIsCreateOpen(true);
                            }}
                            onToggleStatus={() => handleToggleStatus(batch)}
                            onDelete={() => handleDelete(batch)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className={styles.batchesGrid}>
          {filteredBatches.map(batch => (
            <div className={styles.batchCard} key={batch.id}>
              
              {/* Card Top */}
              <div className={styles.cardTop}>
                <div className={styles.batchNameBox}>
                  <span className={styles.batchName}>{batch.name}</span>
                  <span className={styles.subjectBadge}>
                    <BookOpen size={12} /> {batch.subjectName}
                  </span>
                </div>
                <StatusBadge status={batch.status} />
              </div>

              {/* Card Key Details */}
              <div className={styles.cardDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <Building2 size={13} /> Branch
                  </span>
                  <span className={styles.detailValue}>
                    {batch.branchName} ({batch.branchType})
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <GraduationCap size={13} /> Department
                  </span>
                  <span className={styles.detailValue}>
                    {batch.departmentName}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <Calendar size={13} /> Established
                  </span>
                  <span className={styles.detailValue}>
                    {batch.createdAt}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className={styles.cardFooter}>
                <div className={styles.studentCountBadge}>
                  <Users size={15} color="var(--brand-orange)" />
                  <span>{batch.totalStudents || 0} Enrolled</span>
                </div>

                <div className={styles.cardActions}>
                  <button 
                    type="button"
                    className={styles.btnViewRoster}
                    onClick={() => setViewingBatch(batch)}
                  >
                    <Eye size={13} />
                    <span>View Roster</span>
                  </button>
                  <TableActionMenu 
                    items={[]}
                    status={batch.status}
                    onView={() => setViewingBatch(batch)}
                    onEdit={() => {
                      setEditingBatch(batch);
                      setIsCreateOpen(true);
                    }}
                    onToggleStatus={() => handleToggleStatus(batch)}
                    onDelete={() => handleDelete(batch)}
                  />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 6. Floating Bulk Actions Bar */}
      <FloatingActionBar 
        selectedCount={selectedIds.size}
        onDiscard={() => setSelectedIds(new Set())}
        actions={bulkActions}
      />

      {/* 7. Modals & Drawers */}
      <CreateBatchModal 
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingBatch(null);
        }}
        onSuccess={handleCreateSuccess}
        initialBatch={editingBatch}
      />

      <BatchDetailsDrawer 
        isOpen={!!viewingBatch}
        onClose={() => setViewingBatch(null)}
        batch={viewingBatch}
        onBatchUpdated={loadBatches}
      />

    </div>
  );
}
