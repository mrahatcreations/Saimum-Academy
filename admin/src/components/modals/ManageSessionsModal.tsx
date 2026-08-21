import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import type { AdmissionSession } from '../../types/admission';
import { 
  Plus, 
  Save, 
  Edit2, 
  Trash2, 
  ArrowLeft 
} from 'lucide-react';
import { fetchAcademicLookups } from '../../services/batchService';
import styles from './ManageSessionsModal.module.css';

interface ManageSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: AdmissionSession[];
  onRefreshSessions: () => void;
  onToggleActive: (sessionId: string) => Promise<void>;
  onCreateSession: (newSession: Partial<AdmissionSession>) => Promise<void>;
  onUpdateSession?: (id: string, updated: Partial<AdmissionSession>) => Promise<void>;
  onDeleteSession?: (id: string) => Promise<void>;
}

export default function ManageSessionsModal({
  isOpen,
  onClose,
  sessions,
  onRefreshSessions,
  onToggleActive,
  onCreateSession,
  onUpdateSession,
  onDeleteSession
}: ManageSessionsModalProps) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(`${new Date().getFullYear()}-03-31`);
  const [applicationFee, setApplicationFee] = useState(200);
  const [isActive, setIsActive] = useState(true);
  
  // Branch & Subject Offerings
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['All Branches']);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  const [regPrefix, setRegPrefix] = useState('SA-2026-');
  const [regStartNumber, setRegStartNumber] = useState(1001);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableBranches, setAvailableBranches] = useState<{ id: string; name: string }[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchAcademicLookups()
        .then(lookups => {
          setAvailableBranches(lookups.branches || []);
          setAvailableSubjects(lookups.subjects || []);
        })
        .catch(() => {
          setAvailableBranches([]);
          setAvailableSubjects([]);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setYear(new Date().getFullYear());
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(`${new Date().getFullYear()}-03-31`);
    setApplicationFee(200);
    setIsActive(true);
    setSelectedBranches(['All Branches']);
    setSelectedSubjects([]);
    setRegPrefix(`SA-${new Date().getFullYear()}-`);
    setRegStartNumber(1001);
    setEditingSessionId(null);
    setView('list');
  };

  const handleOpenCreate = () => {
    resetForm();
    setView('form');
  };

  const handleOpenEdit = (s: AdmissionSession) => {
    setEditingSessionId(s.id);
    setTitle(s.title);
    setYear(s.year);
    setStartDate(s.startDate);
    setEndDate(s.endDate);
    setApplicationFee(s.applicationFee);
    setIsActive(s.isActive);
    setSelectedBranches(s.targetBranches && s.targetBranches.length > 0 ? s.targetBranches : ['All Branches']);
    setSelectedSubjects(s.targetSubjects || []);
    setRegPrefix(s.regPrefix || `SA-${s.year}-`);
    setRegStartNumber(s.regStartNumber || 1001);
    setView('form');
  };

  const handleToggleBranch = (name: string) => {
    if (name === 'All Branches') {
      setSelectedBranches(['All Branches']);
      return;
    }

    setSelectedBranches(prev => {
      const filtered = prev.filter(b => b !== 'All Branches');
      if (filtered.includes(name)) {
        const next = filtered.filter(b => b !== name);
        return next.length === 0 ? ['All Branches'] : next;
      } else {
        return [...filtered, name];
      }
    });
  };

  const handleToggleSubject = (name: string) => {
    setSelectedSubjects(prev => 
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a session title.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<AdmissionSession> = {
        title: title.trim(),
        sessionCode: `${year}-S${Date.now().toString().slice(-4)}`,
        year,
        startDate,
        endDate,
        applicationFee: Number(applicationFee) || 200,
        isActive,
        targetBranches: selectedBranches,
        targetSubjects: selectedSubjects,
        regPrefix: regPrefix.trim() || `SA-${year}-`,
        regStartNumber: Number(regStartNumber) || 1001
      };

      if (editingSessionId && onUpdateSession) {
        await onUpdateSession(editingSessionId, payload);
      } else {
        await onCreateSession(payload);
      }

      resetForm();
      onRefreshSessions();
    } catch (err: any) {
      console.error('Failed to save session:', err);
      alert(err.message || 'Failed to save session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, sTitle: string) => {
    if (window.confirm(`Delete intake session "${sTitle}"?`)) {
      if (onDeleteSession) {
        await onDeleteSession(id);
        onRefreshSessions();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admission Sessions" size="lg">
      <div className={styles.modalWrapper}>
        
        {view === 'list' ? (
          <>
            {/* Header with Title & Action */}
            <div className={styles.headerRow}>
              <div>
                <h3 className={styles.headerTitle}>Intake Sessions ({sessions.length})</h3>
                <p className={styles.headerSubtext}>Manage branch-specific intake circulars and serial formats</p>
              </div>
              <button 
                type="button" 
                className={styles.btnPrimary}
                onClick={handleOpenCreate}
              >
                <Plus size={14} /> New Session
              </button>
            </div>

            {/* Flat Table */}
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Session Name</th>
                    <th className={styles.th}>Target Branch</th>
                    <th className={styles.th}>Period</th>
                    <th className={styles.th}>Fee</th>
                    <th className={styles.th}>Applicants</th>
                    <th className={styles.th}>Status</th>
                    <th className={`${styles.th} ${styles.actionsCell}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{padding: '30px', textAlign: 'center', color: 'var(--text-tertiary)'}}>
                        No admission sessions configured. Click "+ New Session" to create one.
                      </td>
                    </tr>
                  ) : (
                    sessions.map(s => (
                      <tr key={s.id} className={styles.tr}>
                        <td className={styles.td}>
                          <div className={styles.sessionCell}>
                            <span className={styles.sessionTitle}>{s.title}</span>
                            <span className={styles.sessionSub}>
                              {s.sessionCode} • Format: {s.regPrefix || 'SA-2026-'}{s.regStartNumber || 1001}
                            </span>
                          </div>
                        </td>

                        <td className={styles.td}>
                          <span style={{
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-surface-hover, #F4F4F5)',
                            color: 'var(--text-secondary, #475569)'
                          }}>
                            {s.targetBranches && s.targetBranches.length > 0 
                              ? s.targetBranches.join(', ') 
                              : 'All Branches'}
                          </span>
                        </td>

                        <td className={`${styles.td} ${styles.dateCell}`}>
                          {s.startDate} → {s.endDate}
                        </td>

                        <td className={`${styles.td} ${styles.feeCell}`}>
                          ৳{s.applicationFee}
                        </td>

                        <td className={styles.td}>
                          <strong>{s.totalApplicants || 0}</strong>
                        </td>

                        <td className={styles.td}>
                          <button
                            type="button"
                            onClick={() => onToggleActive(s.id)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.70rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: s.isActive ? '1px solid #A7F3D0' : '1px solid var(--border-light)',
                              backgroundColor: s.isActive ? '#ECFDF5' : 'var(--bg-surface-hover)',
                              color: s.isActive ? '#059669' : 'var(--text-tertiary)'
                            }}
                          >
                            {s.isActive ? 'ACTIVE ● LIVE' : 'CLOSED'}
                          </button>
                        </td>

                        <td className={`${styles.td} ${styles.actionsCell}`}>
                          <div className={styles.actionBtns}>
                            <button
                              type="button"
                              className={styles.iconBtn}
                              onClick={() => handleOpenEdit(s)}
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              className={`${styles.iconBtn} ${styles.deleteBtn}`}
                              onClick={() => handleDelete(s.id, s.title)}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Clean 1-Page Minimal Form */
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.headerRow}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className={styles.btnSecondary}
                  style={{padding: '5px 10px'}}
                >
                  <ArrowLeft size={13} /> Back
                </button>
                <h3 className={styles.headerTitle}>
                  {editingSessionId ? 'Edit Session' : 'Create Session'}
                </h3>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Session Title*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spring 2026 Central Intake"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Year*</label>
                <input
                  type="number"
                  required
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  className={styles.input}
                />
              </div>
            </div>

            {/* Target Branch Selector */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Target Branch(es)*</label>
              <div className={styles.pillGroup}>
                <button
                  type="button"
                  onClick={() => handleToggleBranch('All Branches')}
                  className={`${styles.pill} ${selectedBranches.includes('All Branches') ? styles.pillSelected : ''}`}
                >
                  {selectedBranches.includes('All Branches') ? '✓ ' : '+ '} All Branches
                </button>
                {availableBranches.map(branch => {
                  const isSelected = selectedBranches.includes(branch.name);
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => handleToggleBranch(branch.name)}
                      className={`${styles.pill} ${isSelected ? styles.pillSelected : ''}`}
                    >
                      {isSelected ? '✓ ' : '+ '} {branch.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Start Date*</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Deadline (End Date)*</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Application Fee (৳ BDT)*</label>
                <input
                  type="number"
                  required
                  value={applicationFee}
                  onChange={e => setApplicationFee(Number(e.target.value))}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Registration Code Prefix</label>
                <input
                  type="text"
                  placeholder="e.g. SA-2026-"
                  value={regPrefix}
                  onChange={e => setRegPrefix(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            {/* Target Subjects Selection */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Open Subjects</label>
              <div className={styles.pillGroup}>
                {(availableSubjects.length > 0 ? availableSubjects : [
                  { id: '1', name: 'Music' },
                  { id: '2', name: 'Drama & Acting' },
                  { id: '3', name: 'Recitation' }
                ]).map(sub => {
                  const isSelected = selectedSubjects.includes(sub.name);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleToggleSubject(sub.name)}
                      className={`${styles.pill} ${isSelected ? styles.pillSelected : ''}`}
                    >
                      {isSelected ? '✓ ' : '+ '} {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.formActions}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  style={{accentColor: 'var(--brand-orange)'}}
                />
                Set as Active Live Intake
              </label>

              <div style={{display: 'flex', gap: '8px'}}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setView('list')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={isSubmitting}
                >
                  <Save size={13} /> {isSubmitting ? 'Saving...' : 'Save Session'}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </Modal>
  );
}
