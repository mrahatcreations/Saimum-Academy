import { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Building2, 
  BookOpen, 
  Layers, 
  UserPlus, 
  Trash2, 
  Phone, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { 
  fetchBatchStudents, 
  removeStudentFromBatch, 
  enrollStudentInBatch,
  type BatchItem, 
  type BatchStudentItem 
} from '../../services/batchService';
import { admissionService } from '../../services/admissionService';
import type { Registration } from '../../types/admission';
import { UserAvatar } from '../ui/UserAvatar';
import styles from './BatchDetailsDrawer.module.css';

interface BatchDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  batch: BatchItem | null;
  onBatchUpdated?: () => void;
}

export default function BatchDetailsDrawer({
  isOpen,
  onClose,
  batch,
  onBatchUpdated
}: BatchDetailsDrawerProps) {
  const [students, setStudents] = useState<BatchStudentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableCandidates, setAvailableCandidates] = useState<Registration[]>([]);
  const [showEnrollSection, setShowEnrollSection] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (isOpen && batch) {
      loadStudents();
      loadCandidates();
      setShowEnrollSection(false);
      setSelectedPersonId('');
    }
  }, [isOpen, batch]);

  const loadStudents = async () => {
    if (!batch) return;
    try {
      setLoading(true);
      const list = await fetchBatchStudents(batch.id);
      setStudents(list);
    } catch (err) {
      console.error('Failed to load batch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async () => {
    try {
      const res = await admissionService.getAdmissions();
      const regs = res.data || [];
      // Candidates selected or regular
      const eligible = regs.filter((r: Registration) => 
        r.status === 'SELECTED' || 
        r.status === 'REGULAR_STUDENT' ||
        r.branchId === batch?.branchId
      );
      setAvailableCandidates(eligible);
      if (eligible.length > 0) {
        setSelectedPersonId(eligible[0].person.id);
      }
    } catch (err) {
      console.error('Candidate fetch error:', err);
    }
  };

  const handleEnroll = async () => {
    if (!batch || !selectedPersonId) return;
    try {
      setEnrolling(true);
      await enrollStudentInBatch(batch.id, { personId: selectedPersonId });
      await loadStudents();
      if (onBatchUpdated) onBatchUpdated();
      setShowEnrollSection(false);
    } catch (err: any) {
      alert(err.message || 'Failed to enroll student in batch.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemove = async (membershipId: string, studentName: string) => {
    if (!batch) return;
    if (!confirm(`Are you sure you want to remove "${studentName}" from this batch?`)) return;

    try {
      await removeStudentFromBatch(batch.id, membershipId);
      setStudents(students.filter(s => s.membershipId !== membershipId));
      if (onBatchUpdated) onBatchUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to remove student.');
    }
  };

  if (!isOpen || !batch) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={e => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.batchIconBox}>
              <Layers size={22} />
            </div>
            <div>
              <div className={styles.batchTitleRow}>
                <h3 className={styles.batchTitle}>{batch.name}</h3>
                <span className={styles.statusPill}>{batch.status}</span>
              </div>
              <div className={styles.metaRow}>
                <span><Building2 size={13} /> {batch.branchName}</span>
                <span>•</span>
                <span><BookOpen size={13} /> {batch.subjectName} ({batch.departmentName})</span>
              </div>
            </div>
          </div>

          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Enrolled Students</span>
            <span className={styles.statValue}>{students.length} Members</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Branch Type</span>
            <span className={styles.statValue}>{batch.branchType}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Cohort Established</span>
            <span className={styles.statValue}>{batch.createdAt}</span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarTitle}>
            <Users size={16} color="var(--brand-orange)" />
            <span>Student Roster ({students.length})</span>
          </div>

          <button 
            className={styles.btnEnroll} 
            onClick={() => setShowEnrollSection(!showEnrollSection)}
          >
            <UserPlus size={15} />
            <span>{showEnrollSection ? 'Close Enrollment' : '+ Enroll Candidate'}</span>
          </button>
        </div>

        {/* Enroll Candidate Form Box */}
        {showEnrollSection && (
          <div className={styles.enrollBox}>
            <h4 style={{fontSize: '0.85rem', fontWeight: 700, color: '#F1F5F9', marginBottom: '8px'}}>
              Enroll Qualified Candidate to Batch
            </h4>
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
              <select 
                className="select" 
                style={{flex: 1, fontSize: '0.84rem'}}
                value={selectedPersonId}
                onChange={e => setSelectedPersonId(e.target.value)}
              >
                {availableCandidates.map(c => (
                  <option key={c.id} value={c.person.id}>
                    {c.person.fullNameEn} ({c.registrationNo}) • {c.subjectName}
                  </option>
                ))}
              </select>
              <button 
                className="btnSubmit" 
                style={{padding: '8px 16px', fontSize: '0.84rem', whiteSpace: 'nowrap'}}
                onClick={handleEnroll}
                disabled={enrolling || !selectedPersonId}
              >
                {enrolling ? 'Enrolling...' : 'Enroll Student'}
              </button>
            </div>
          </div>
        )}

        {/* Student Roster List */}
        <div className={styles.body}>
          {loading ? (
            <div style={{textAlign: 'center', padding: '32px', color: '#94A3B8'}}>
              Loading student roster...
            </div>
          ) : students.length === 0 ? (
            <div className={styles.emptyBox}>
              <Users size={36} color="#475569" />
              <p>No students have been enrolled in this batch yet.</p>
              <button 
                className={styles.btnEnroll} 
                style={{marginTop: '12px'}}
                onClick={() => setShowEnrollSection(true)}
              >
                <UserPlus size={15} /> Enroll First Student
              </button>
            </div>
          ) : (
            <div className={styles.studentList}>
              {students.map((s, idx) => (
                <div className={styles.studentCard} key={s.membershipId || idx}>
                  <div className={styles.studentLeft}>
                    <UserAvatar
                      name={s.fullNameEn}
                      photoUrl={s.photoUrl}
                      size={34}
                      shape="circle"
                    />
                    <div>
                      <div className={styles.studentNameRow}>
                        <span className={styles.studentName}>{s.fullNameEn}</span>
                        {s.fullNameBn && <span className={styles.studentBn}>({s.fullNameBn})</span>}
                      </div>
                      <div className={styles.studentMeta}>
                        <span className={styles.studentIdBadge}>{s.studentId}</span>
                        {s.phone && (
                          <span style={{display: 'inline-flex', alignItems: 'center', gap: '3px'}}>
                            <Phone size={12} /> {s.phone}
                          </span>
                        )}
                        <span>
                          <Calendar size={12} /> Joined: {s.joinedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.studentRight}>
                    <span className={styles.memberStatusTag}>
                      <CheckCircle2 size={12} /> Active Member
                    </span>
                    <button 
                      className={styles.btnRemove}
                      onClick={() => handleRemove(s.membershipId, s.fullNameEn)}
                      title="Remove from batch"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div style={{fontSize: '0.8rem', color: '#64748B'}}>
            Central Batch Membership • Saimum Academy Management
          </div>
          <button className={styles.btnCloseBottom} onClick={onClose}>
            Close Roster
          </button>
        </div>

      </div>
    </div>
  );
}
