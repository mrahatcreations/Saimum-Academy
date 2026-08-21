import { useState, useEffect, useCallback, useMemo } from 'react';
import { Trash2, CheckCircle2 } from 'lucide-react';
import AddStudentModal from '../components/modals/AddStudentModal';
import TableActionMenu from '../components/ui/TableActionMenu';
import { UserAvatar } from '../components/ui/UserAvatar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { academicService, type StudentItem } from '../services/academicService';

// Reusable UI Kit
import { PageHeader } from '../components/ui/PageHeader';
import { MetricsStrip, type MetricItem } from '../components/ui/MetricsStrip';
import { SubNavTabs, type TabItem } from '../components/ui/SubNavTabs';
import { DataTableToolbar } from '../components/ui/DataTableToolbar';
import { CustomCheckbox } from '../components/ui/CustomCheckbox';
import { FloatingActionBar, type BulkActionItem } from '../components/ui/FloatingActionBar';

import styles from './Students.module.css';

export default function Students() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const loadStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await academicService.getStudents({ search });
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleAdd = async (formData: { fullName: string; phone: string; email: string }) => {
    try {
      if (editingStudent) {
        const res = await academicService.updateStudent(editingStudent.id, {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email
        });
        if (res.success) {
          setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...res.data } : s));
        }
        setEditingStudent(null);
      } else {
        const res = await academicService.createStudent({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          status: 'ACTIVE'
        });
        if (res.success) {
          setStudents(prev => [res.data, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save student:', err);
      alert(err.message || 'Failed to save student');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await academicService.updateStudent(id, { status: nextStatus });
      if (res.success) {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));
      }
    } catch (err) {
      console.error('Failed to toggle student status:', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete student "${name}"?`)) {
      try {
        const res = await academicService.deleteStudent(id);
        if (res.success) {
          setStudents(prev => prev.filter(s => s.id !== id));
          setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      } catch (err: any) {
        console.error('Failed to delete student:', err);
        alert(err.message || 'Failed to delete student');
      }
    }
  };

  // Metric counts
  const totalCount = students.length;
  const activeCount = students.filter(s => s.status === 'ACTIVE').length;
  const inactiveCount = students.filter(s => s.status === 'INACTIVE').length;

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (activeTab === 'ACTIVE' && s.status !== 'ACTIVE') return false;
      if (activeTab === 'INACTIVE' && s.status !== 'INACTIVE') return false;
      return true;
    });
  }, [students, activeTab]);

  // Selection
  const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s.id));
  const isSomeSelected = filteredStudents.some(s => selectedIds.has(s.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleToggleRowSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const metricsData: MetricItem[] = [
    {
      id: 'total',
      label: 'Enrolled Students',
      value: totalCount,
      sparklineData: [40, 45, 48, 55, 52, 60, totalCount || 60],
      sparklineColor: '#FF790E'
    },
    {
      id: 'active',
      label: 'Active Regular',
      value: activeCount,
      sparklineData: [35, 40, 42, 48, 50, activeCount || 55],
      sparklineColor: '#10B981'
    },
    {
      id: 'inactive',
      label: 'Inactive / On Leave',
      value: inactiveCount,
      sparklineData: [8, 7, 9, 6, 8, inactiveCount || 5],
      sparklineColor: '#F59E0B'
    },
    {
      id: 'graduated',
      label: 'Graduated Alumni',
      value: 142,
      sparklineData: [100, 110, 115, 125, 130, 142],
      sparklineColor: '#6366F1'
    }
  ];

  const tabItems: TabItem<string>[] = [
    { id: 'ALL', label: 'All Students', count: totalCount },
    { id: 'ACTIVE', label: 'Active Regular', count: activeCount },
    { id: 'INACTIVE', label: 'Inactive / On Leave', count: inactiveCount }
  ];

  const bulkActions: BulkActionItem[] = [
    {
      id: 'bulk-activate',
      label: 'Mark Active',
      icon: <CheckCircle2 size={14} />,
      onClick: () => {
        alert(`Activated ${selectedIds.size} student(s)`);
        setSelectedIds(new Set());
      }
    },
    {
      id: 'bulk-delete',
      label: 'Delete Selected',
      icon: <Trash2 size={14} />,
      variant: 'danger',
      onClick: () => {
        if (confirm(`Delete ${selectedIds.size} selected students?`)) {
          setSelectedIds(new Set());
        }
      }
    }
  ];

  return (
    <div className={styles.container}>
      {/* 1. Page Header without count next to title */}
      <PageHeader
        title="Students"
        userName="Super Admin"
      />

      {/* 2. Top KPI Metrics */}
      <MetricsStrip metrics={metricsData} />

      {/* 3. Sub-Nav Tabs */}
      <SubNavTabs
        tabs={tabItems}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* 4. Toolbar */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by student name, ID, phone..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        primaryActionLabel="Register Student"
        onPrimaryActionClick={() => {
          setEditingStudent(null);
          setIsModalOpen(true);
        }}
      />

      {/* 5. Flat Data Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxTh}>
                <CustomCheckbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected && !isAllSelected}
                  onChange={handleToggleSelectAll}
                  ariaLabel="Select all students"
                />
              </th>
              <th className={styles.th}>Student ID</th>
              <th className={styles.th}>Full Name</th>
              <th className={styles.th}>Contact</th>
              <th className={styles.th}>Status</th>
              <th className={`${styles.th} ${styles.actionTd}`}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className={styles.loadingRow}>
                  Loading students...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = selectedIds.has(student.id);

                return (
                  <tr
                    key={student.id}
                    className={`${styles.tr} ${isSelected ? styles.trSelected : ''}`}
                  >
                    <td 
                      className={styles.checkboxTd}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CustomCheckbox
                        checked={isSelected}
                        onChange={(checked) => handleToggleRowSelect(student.id, checked)}
                        ariaLabel={`Select ${student.fullName}`}
                      />
                    </td>

                    <td className={`${styles.td} ${styles.studentIdCell}`}>
                      {student.studentId}
                    </td>

                    <td className={styles.td}>
                      <div className={styles.personCell}>
                        <UserAvatar
                          name={student.fullName}
                          photoUrl={student.photoUrl}
                          size="sm"
                        />
                        <div className={styles.personMeta}>
                          <span className={styles.personName}>{student.fullName}</span>
                        </div>
                      </div>
                    </td>

                    <td className={styles.td}>
                      <div className={styles.contactCell}>
                        <span className={styles.phoneText}>{student.phone || '—'}</span>
                        {student.email && (
                          <span className={styles.emailText}>{student.email}</span>
                        )}
                      </div>
                    </td>

                    <td className={styles.td}>
                      <StatusBadge status={student.status} />
                    </td>

                    <td 
                      className={`${styles.td} ${styles.actionTd}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TableActionMenu
                        items={[]}
                        status={student.status}
                        onEdit={() => {
                          setEditingStudent(student);
                          setIsModalOpen(true);
                        }}
                        onToggleStatus={() => handleToggleStatus(student.id, student.status)}
                        onDelete={() => handleDelete(student.id, student.fullName)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 6. Floating Action Bar */}
      <FloatingActionBar
        selectedCount={selectedIds.size}
        onDiscard={() => setSelectedIds(new Set())}
        actions={bulkActions}
      />

      <AddStudentModal
        isOpen={isModalOpen}
        initialData={editingStudent}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
        }}
        onAdd={handleAdd}
      />
    </div>
  );
}
