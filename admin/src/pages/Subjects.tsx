import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import AddSubjectModal from '../components/modals/AddSubjectModal';
import TableActionMenu from '../components/ui/TableActionMenu';
import { StatusBadge } from '../components/ui/StatusBadge';
import { academicService, type SubjectItem } from '../services/academicService';

// Reusable Corporate UI Kit
import { PageHeader } from '../components/ui/PageHeader';
import { DataTableToolbar } from '../components/ui/DataTableToolbar';

import styles from './Students.module.css';

export default function Subjects() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubj, setEditingSubj] = useState<SubjectItem | null>(null);
  const [search, setSearch] = useState('');

  const loadSubjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await academicService.getSubjects();
      if (res.success) {
        setSubjects(res.data);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const handleAddSubject = async (formData: { name: string; code: string }) => {
    try {
      if (editingSubj) {
        const res = await academicService.updateSubject(editingSubj.id, {
          name: formData.name,
          code: formData.code
        });
        if (res.success) {
          setSubjects(prev => prev.map(s => s.id === editingSubj.id ? { ...s, ...res.data } : s));
        }
        setEditingSubj(null);
      } else {
        const res = await academicService.createSubject({
          name: formData.name,
          code: formData.code,
          status: 'ACTIVE'
        });
        if (res.success) {
          setSubjects(prev => [...prev, res.data]);
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save subject:', err);
      alert(err.message || 'Failed to save subject');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await academicService.updateSubject(id, { status: nextStatus });
      if (res.success) {
        setSubjects(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));
      }
    } catch (err) {
      console.error('Failed to toggle subject status:', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete master subject "${name}"?`)) {
      try {
        const res = await academicService.deleteSubject(id);
        if (res.success) {
          setSubjects(prev => prev.filter(s => s.id !== id));
        }
      } catch (err: any) {
        console.error('Failed to delete subject:', err);
        alert(err.message || 'Failed to delete subject');
      }
    }
  };

  const filtered = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.code && s.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={styles.container}>
      {/* 1. Standard Page Header without Subtitles or Counts */}
      <PageHeader 
        title="Subjects" 
      />

      {/* 2. Global Table Toolbar */}
      <DataTableToolbar 
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search subjects by name or code..."
        primaryActionLabel="Add Subject"
        onPrimaryActionClick={() => {
          setEditingSubj(null);
          setIsModalOpen(true);
        }}
        primaryActionIcon={<Plus size={15} strokeWidth={2.5} />}
      />

      {/* 3. Global Standard Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Subject Name</th>
              <th className={styles.th}>Code</th>
              <th className={styles.th}>Status</th>
              <th className={`${styles.th} ${styles.actionTd}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className={styles.loadingRow}>
                  Loading subjects directory...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyRow}>
                  No subjects found.
                </td>
              </tr>
            ) : (
              filtered.map(subj => (
                <tr className={styles.tr} key={subj.id}>
                  <td className={styles.td} style={{ fontWeight: 700 }}>{subj.name}</td>
                  <td className={styles.td} style={{ color: 'var(--text-secondary)' }}>{subj.code || '-'}</td>
                  <td className={styles.td}>
                    <StatusBadge status={subj.status} />
                  </td>
                  <td className={`${styles.td} ${styles.actionTd}`}>
                    <TableActionMenu 
                      items={[]}
                      status={subj.status}
                      onEdit={() => {
                        setEditingSubj(subj);
                        setIsModalOpen(true);
                      }}
                      onToggleStatus={() => handleToggleStatus(subj.id, subj.status)}
                      onDelete={() => handleDelete(subj.id, subj.name)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddSubjectModal 
        isOpen={isModalOpen} 
        initialData={editingSubj}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubj(null);
        }} 
        onAdd={handleAddSubject} 
      />
    </div>
  );
}
