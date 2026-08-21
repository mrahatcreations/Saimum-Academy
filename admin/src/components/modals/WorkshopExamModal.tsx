import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import { 
  Award, 
  Plus,
  Timer
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import { fetchAcademicLookups } from '../../services/batchService';
import { fetchBatches, type BatchItem } from '../../services/batchService';
import { UserAvatar } from '../ui/UserAvatar';

interface WorkshopExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSessionId?: string;
  onRefreshAdmissions?: () => void;
}

interface ExamSummary {
  id: string;
  title: string;
  branchId: string;
  branchName: string;
  subjectId: string;
  subjectName: string;
  examDate: string;
  totalMarks: number;
  passMarks: number;
  availableSeats: number;
  admissionWindowDays: number;
  status: string;
  stats: {
    totalExaminees: number;
    passedCount: number;
    meritOfferedCount: number;
    admittedCount: number;
    waitingCount: number;
    expiredCount: number;
    vacantSeats: number;
  };
}

interface ExamResultItem {
  id: string;
  registrationId: string;
  personId: string;
  marks: number;
  isPassed: boolean;
  meritRank: number | null;
  waitingRank: number | null;
  admissionStatus: 'MERIT_OFFERED' | 'WAITING_LIST' | 'ADMITTED' | 'OFFER_EXPIRED' | 'FAILED';
  offerExpiresAt: string | null;
  examinerFeedback: string | null;
  person: {
    fullNameEn: string;
    fullNameBn?: string;
    phone?: string;
    photoUrl?: string | null;
  };
  registration: {
    registrationNo: string;
  };
}

export default function WorkshopExamModal({
  isOpen,
  onClose,
  currentSessionId = 'ALL',
  onRefreshAdmissions
}: WorkshopExamModalProps) {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [activeExamResults, setActiveExamResults] = useState<ExamResultItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Exam Form State
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);
  const [newExamData, setNewExamData] = useState({
    branchId: '',
    subjectId: '',
    title: '',
    examDate: new Date().toISOString().split('T')[0],
    totalMarks: 100,
    passMarks: 60,
    availableSeats: 50,
    admissionWindowDays: 3
  });

  // Batch Grading State
  const [isGradingMode, setIsGradingMode] = useState(false);
  const [workshopCandidates, setWorkshopCandidates] = useState<any[]>([]);
  const [gradingInputs, setGradingInputs] = useState<Record<string, { marks: string; feedback: string }>>({});

  // Regular Batch Assign State
  const [admittingRegId, setAdmittingRegId] = useState<string | null>(null);
  const [targetBatchId, setTargetBatchId] = useState<string>('');

  // Load All Exams
  const loadExams = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest(`/workshop-exams?sessionId=${currentSessionId}`);
      if (res.success) {
        setExams(res.data || []);
        if (res.data && res.data.length > 0 && !selectedExamId) {
          setSelectedExamId(res.data[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load workshop exams:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, selectedExamId]);

  // Load Exam Details & Results
  const loadExamDetails = useCallback(async (examId: string) => {
    try {
      setIsLoading(true);
      const res = await apiRequest(`/workshop-exams/${examId}`);
      if (res.success && res.data) {
        setActiveExamResults(res.data.results || []);
      }
    } catch (err: any) {
      console.error('Failed to load exam results:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    if (isOpen) {
      loadExams();
      fetchAcademicLookups().then(res => {
        setBranches(res.branches || []);
        setSubjects(res.subjects || []);
        if (res.branches?.[0] && !newExamData.branchId) {
          setNewExamData(prev => ({
            ...prev,
            branchId: res.branches[0].id,
            subjectId: res.subjects?.[0]?.id || ''
          }));
        }
      });
      fetchBatches().then(b => setBatches(b || []));
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, loadExams]);

  useEffect(() => {
    if (selectedExamId) {
      loadExamDetails(selectedExamId);
    }
  }, [selectedExamId, loadExamDetails]);

  if (!isOpen) return null;

  const currentExam = exams.find(e => e.id === selectedExamId);

  // Helper for 3-Day Countdown calculations
  const calculateRemainingTime = (expiresAtStr: string | null) => {
    if (!expiresAtStr) return null;
    const expiry = new Date(expiresAtStr).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;

    if (diff <= 0) return { isExpired: true, text: 'Expired' };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { isExpired: false, text: `${hours}h ${minutes}m left` };
  };

  // Create New Exam Handler
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiRequest('/workshop-exams', {
        method: 'POST',
        data: {
          ...newExamData,
          sessionId: currentSessionId === 'ALL' ? 'active-session' : currentSessionId
        }
      });

      if (res.success) {
        setIsCreatingExam(false);
        setSuccessMsg('Workshop Final Exam created successfully!');
        await loadExams();
        setSelectedExamId(res.data.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create exam.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load candidates for grading
  const handleOpenGradingMode = async () => {
    if (!currentExam) return;
    try {
      setIsLoading(true);
      // Fetch workshop & selected candidates for this branch
      const res = await apiRequest(`/admissions?branchId=${currentExam.branchId}`);
      if (res.success && res.data) {
        const eligible = res.data.filter((r: any) => 
          r.status === 'SELECTED' || r.status === 'WORKSHOP' || r.status === 'REGULAR_STUDENT'
        );
        setWorkshopCandidates(eligible);

        // Pre-fill existing grades if any
        const initialInputs: Record<string, { marks: string; feedback: string }> = {};
        eligible.forEach((c: any) => {
          const existing = activeExamResults.find(r => r.registrationId === c.id);
          initialInputs[c.id] = {
            marks: existing ? String(existing.marks) : '',
            feedback: existing?.examinerFeedback || ''
          };
        });
        setGradingInputs(initialInputs);
        setIsGradingMode(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Batch Marks
  const handleSubmitMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) return;

    try {
      setIsLoading(true);
      setError(null);

      const studentMarks = workshopCandidates
        .filter(c => gradingInputs[c.id]?.marks !== '')
        .map(c => ({
          registrationId: c.id,
          personId: c.person.id,
          marks: parseFloat(gradingInputs[c.id].marks) || 0,
          feedback: gradingInputs[c.id].feedback || ''
        }));

      if (studentMarks.length === 0) {
        setError('Please enter marks for at least one candidate.');
        setIsLoading(false);
        return;
      }

      const res = await apiRequest(`/workshop-exams/${selectedExamId}/results`, {
        method: 'POST',
        data: { studentMarks }
      });

      if (res.success) {
        setIsGradingMode(false);
        setSuccessMsg(res.message || 'Exam results saved successfully.');
        await loadExams();
        await loadExamDetails(selectedExamId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit marks.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run 3-Day Expiry Engine
  const handleRunExpiryEngine = async () => {
    if (!selectedExamId) return;
    if (!confirm('This will expire all overdue 3-day admission offers and auto-release those seats to the Waiting List. Proceed?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await apiRequest(`/workshop-exams/${selectedExamId}/expire-and-release`, {
        method: 'POST',
        data: {}
      });

      if (res.success) {
        setSuccessMsg(res.message || '3-Day expiry engine completed.');
        await loadExams();
        await loadExamDetails(selectedExamId);
        if (onRefreshAdmissions) onRefreshAdmissions();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm Regular Admission
  const handleConfirmAdmission = async (registrationId: string) => {
    if (!selectedExamId) return;

    try {
      setIsLoading(true);
      setError(null);

      const res = await apiRequest(`/workshop-exams/${selectedExamId}/confirm-admission`, {
        method: 'POST',
        data: {
          registrationId,
          targetBatchId: targetBatchId || undefined
        }
      });

      if (res.success) {
        setAdmittingRegId(null);
        setSuccessMsg(`Student admitted as Regular Student! (ID: ${res.studentId})`);
        await loadExams();
        await loadExamDetails(selectedExamId);
        if (onRefreshAdmissions) onRefreshAdmissions();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Status Badge Component
  const getMeritStatusBadge = (res: ExamResultItem) => {
    const countdown = calculateRemainingTime(res.offerExpiresAt);

    switch (res.admissionStatus) {
      case 'MERIT_OFFERED':
        return (
          <div style={{display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end'}}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#059669',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ● Merit Seat Offered
            </span>
            {countdown && !countdown.isExpired && (
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#D97706',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Timer size={11} /> {countdown.text}
              </span>
            )}
            {countdown && countdown.isExpired && (
              <span style={{fontSize: '0.68rem', fontWeight: 700, color: '#DC2626'}}>
                ⚠️ Deadline Expired
              </span>
            )}
          </div>
        );

      case 'WAITING_LIST':
        return (
          <span style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#D97706',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 800
          }}>
            ⏳ Waiting List (WL #{res.waitingRank})
          </span>
        );

      case 'ADMITTED':
        return (
          <span style={{
            background: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#2563EB',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 800
          }}>
            🎓 Admitted (Regular Student)
          </span>
        );

      case 'OFFER_EXPIRED':
        return (
          <span style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#DC2626',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            ❌ 3-Day Offer Expired
          </span>
        );

      default:
        return (
          <span style={{fontSize: '0.72rem', color: 'var(--text-tertiary)'}}>
            Failed ({res.marks} Marks)
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workshop Final Examination & Merit Engine"
      maxWidth="940px"
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        
        {/* Messages */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#DC2626',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600
          }}>
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#059669',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600
          }}>
            ✅ {successMsg}
          </div>
        )}

        {/* Top Action & Exam Selector Strip */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span style={{fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)'}}>
              Select Subject Exam:
            </span>
            <select
              className="select"
              value={selectedExamId || ''}
              onChange={e => setSelectedExamId(e.target.value)}
              style={{minWidth: '260px'}}
              disabled={isCreatingExam || isGradingMode}
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.subjectName} — {ex.branchName} ({ex.stats.totalExaminees} Examinees)
                </option>
              ))}
              {exams.length === 0 && <option value="">No Workshop Exams Created Yet</option>}
            </select>
          </div>

          <div style={{display: 'flex', gap: '8px'}}>
            {!isCreatingExam && !isGradingMode && (
              <>
                <button
                  type="button"
                  className="btnSecondary"
                  onClick={() => setIsCreatingExam(true)}
                  style={{fontSize: '0.78rem'}}
                >
                  <Plus size={13} /> New Subject Exam
                </button>

                {currentExam && (
                  <>
                    <button
                      type="button"
                      className="btnSecondary"
                      onClick={handleOpenGradingMode}
                      style={{fontSize: '0.78rem'}}
                    >
                      <Award size={13} /> Input / Edit Marks
                    </button>

                    <button
                      type="button"
                      onClick={handleRunExpiryEngine}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--brand-orange-border)',
                        background: 'var(--brand-orange-subtle)',
                        color: 'var(--brand-orange)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Timer size={14} /> Run 3-Day Expiry Engine
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: CREATE NEW EXAM FORM
           ========================================================================= */}
        {isCreatingExam && (
          <form onSubmit={handleCreateExam} style={{
            background: 'var(--bg-body, #f8fafc)',
            border: '1px solid var(--border-light, #e2e8f0)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h4 style={{margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)'}}>
                Create Subject Workshop Final Exam
              </h4>
              <button 
                type="button" 
                className="btnCancel" 
                onClick={() => setIsCreatingExam(false)}
                style={{padding: '4px 10px', fontSize: '0.74rem'}}
              >
                Cancel
              </button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
              <div>
                <label className="label">Branch</label>
                <select
                  className="select"
                  value={newExamData.branchId}
                  onChange={e => setNewExamData({...newExamData, branchId: e.target.value})}
                  required
                >
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Master Subject being Examined</label>
                <select
                  className="select"
                  value={newExamData.subjectId}
                  onChange={e => setNewExamData({...newExamData, subjectId: e.target.value})}
                  required
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Exam Date</label>
                <input
                  type="date"
                  className="input"
                  value={newExamData.examDate}
                  onChange={e => setNewExamData({...newExamData, examDate: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="label">Available Regular Seats Quota (মেধা তালিকা আসন)</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={newExamData.availableSeats}
                  onChange={e => setNewExamData({...newExamData, availableSeats: parseInt(e.target.value, 10) || 50})}
                  required
                />
              </div>

              <div>
                <label className="label">Pass Mark (out of 100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="input"
                  value={newExamData.passMarks}
                  onChange={e => setNewExamData({...newExamData, passMarks: parseFloat(e.target.value) || 60})}
                  required
                />
              </div>

              <div>
                <label className="label">Admission Window (Days to Claim Seat)</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  className="input"
                  value={newExamData.admissionWindowDays}
                  onChange={e => setNewExamData({...newExamData, admissionWindowDays: parseInt(e.target.value, 10) || 3})}
                  required
                />
              </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px'}}>
              <button type="button" className="btnCancel" onClick={() => setIsCreatingExam(false)}>Cancel</button>
              <button type="submit" className="btnPrimary" disabled={isLoading}>Create Exam Schedule</button>
            </div>
          </form>
        )}

        {/* =========================================================================
            VIEW 2: BATCH MARKS INPUT MODE
           ========================================================================= */}
        {isGradingMode && currentExam && (
          <form onSubmit={handleSubmitMarks} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <div style={{
              background: 'var(--bg-body)',
              border: '1px solid var(--border-light)',
              borderRadius: '10px',
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong style={{color: 'var(--brand-orange)'}}>{currentExam.subjectName}</strong> Workshop Final Exam
                <span style={{fontSize: '0.76rem', color: 'var(--text-secondary)', marginLeft: '8px'}}>
                  (Pass Marks: {currentExam.passMarks}/100 • Merit Seats: {currentExam.availableSeats})
                </span>
              </div>

              <div style={{display: 'flex', gap: '8px'}}>
                <button type="button" className="btnCancel" onClick={() => setIsGradingMode(false)}>
                  Cancel
                </button>
                <button type="submit" className="btnPrimary" disabled={isLoading}>
                  Save Grades & Publish Merit List
                </button>
              </div>
            </div>

            {/* Examinee Table */}
            <div style={{border: '1px solid var(--border-light)', borderRadius: '10px', overflow: 'hidden', maxHeight: '340px', overflowY: 'auto'}}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 100px 1fr',
                padding: '8px 14px',
                background: 'var(--bg-surface-hover)',
                borderBottom: '1px solid var(--border-light)',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--text-secondary)'
              }}>
                <div>Reg ID</div>
                <div>Candidate Name</div>
                <div>Marks (/100)</div>
                <div>Examiner Remarks</div>
              </div>

              {workshopCandidates.map(cand => (
                <div 
                  key={cand.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr 100px 1fr',
                    padding: '8px 14px',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-light)',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{fontFamily: 'monospace', fontWeight: 700}}>{cand.registrationNo}</div>
                  <div>
                    <strong>{cand.person.fullNameEn}</strong>
                    <span style={{fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block'}}>{cand.person.phone}</span>
                  </div>
                  <div>
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      placeholder="e.g. 85"
                      value={gradingInputs[cand.id]?.marks || ''}
                      onChange={e => setGradingInputs({
                        ...gradingInputs,
                        [cand.id]: {
                          ...gradingInputs[cand.id],
                          marks: e.target.value
                        }
                      })}
                      style={{width: '70px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-light)', fontWeight: 700}}
                    />
                  </div>
                  <div>
                    <input 
                      type="text"
                      placeholder="Vocal range, tone quality..."
                      value={gradingInputs[cand.id]?.feedback || ''}
                      onChange={e => setGradingInputs({
                        ...gradingInputs,
                        [cand.id]: {
                          ...gradingInputs[cand.id],
                          feedback: e.target.value
                        }
                      })}
                      style={{width: '100%', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.76rem'}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </form>
        )}

        {/* =========================================================================
            VIEW 3: ACTIVE EXAM DASHBOARD & MERIT LIST
           ========================================================================= */}
        {!isCreatingExam && !isGradingMode && currentExam && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
            
            {/* Stat Cards (Seats, Merit, Waiting, Expired) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '10px'
            }}>
              <div style={{
                background: 'var(--bg-body)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '10px 12px'
              }}>
                <span style={{fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase'}}>
                  Total Seats
                </span>
                <div style={{fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)'}}>
                  {currentExam.availableSeats}
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                padding: '10px 12px'
              }}>
                <span style={{fontSize: '0.68rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase'}}>
                  Merit Offered
                </span>
                <div style={{fontSize: '1.2rem', fontWeight: 800, color: '#059669'}}>
                  {currentExam.stats.meritOfferedCount}
                </div>
              </div>

              <div style={{
                background: 'rgba(59, 130, 246, 0.06)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
                padding: '10px 12px'
              }}>
                <span style={{fontSize: '0.68rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase'}}>
                  Admitted
                </span>
                <div style={{fontSize: '1.2rem', fontWeight: 800, color: '#2563EB'}}>
                  {currentExam.stats.admittedCount}
                </div>
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.06)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '8px',
                padding: '10px 12px'
              }}>
                <span style={{fontSize: '0.68rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase'}}>
                  Waiting List
                </span>
                <div style={{fontSize: '1.2rem', fontWeight: 800, color: '#D97706'}}>
                  {currentExam.stats.waitingCount}
                </div>
              </div>

              <div style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '10px 12px'
              }}>
                <span style={{fontSize: '0.68rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase'}}>
                  Expired Offers
                </span>
                <div style={{fontSize: '1.2rem', fontWeight: 800, color: '#DC2626'}}>
                  {currentExam.stats.expiredCount}
                </div>
              </div>
            </div>

            {/* Merit & Waiting List Table */}
            <div style={{border: '1px solid var(--border-light)', borderRadius: '10px', overflow: 'hidden'}}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '60px 120px 1fr 80px 180px 120px',
                padding: '10px 14px',
                background: 'var(--bg-surface-hover)',
                borderBottom: '1px solid var(--border-light)',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--text-secondary)'
              }}>
                <div>Rank</div>
                <div>Reg ID</div>
                <div>Candidate Name</div>
                <div>Marks</div>
                <div style={{textAlign: 'right'}}>Admission Status / Timer</div>
                <div style={{textAlign: 'right'}}>Action</div>
              </div>

              <div style={{maxHeight: '320px', overflowY: 'auto'}}>
                {activeExamResults.map(res => (
                  <div 
                    key={res.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 120px 1fr 80px 180px 120px',
                      padding: '10px 14px',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-light)',
                      fontSize: '0.8rem',
                      background: res.admissionStatus === 'MERIT_OFFERED' ? 'rgba(16, 185, 129, 0.02)' : 'transparent'
                    }}
                  >
                    {/* Rank */}
                    <div style={{fontWeight: 800, color: res.meritRank && res.meritRank <= currentExam.availableSeats ? 'var(--brand-orange)' : 'var(--text-secondary)'}}>
                      {res.meritRank ? `#${res.meritRank}` : '—'}
                    </div>

                    {/* Reg ID */}
                    <div style={{fontFamily: 'monospace', fontWeight: 700}}>
                      {res.registration.registrationNo}
                    </div>

                    {/* Name */}
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <UserAvatar
                        name={res.person.fullNameEn}
                        photoUrl={res.person.photoUrl}
                        size={28}
                        shape="circle"
                      />
                      <div>
                        <strong>{res.person.fullNameEn}</strong>
                        <span style={{fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block'}}>
                          {res.person.phone || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Marks */}
                    <div style={{fontWeight: 800, color: res.isPassed ? 'var(--text-primary)' : '#DC2626'}}>
                      {res.marks} / {currentExam.totalMarks}
                    </div>

                    {/* Status / Countdown */}
                    <div style={{textAlign: 'right'}}>
                      {getMeritStatusBadge(res)}
                    </div>

                    {/* Action */}
                    <div style={{textAlign: 'right'}}>
                      {res.admissionStatus === 'MERIT_OFFERED' && (
                        <button
                          type="button"
                          onClick={() => setAdmittingRegId(res.registrationId)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#059669',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Admit Student
                        </button>
                      )}

                      {res.admissionStatus === 'ADMITTED' && (
                        <span style={{fontSize: '0.72rem', color: '#2563EB', fontWeight: 700}}>
                          ✓ Enrolled
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {activeExamResults.length === 0 && (
                  <div style={{padding: '36px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.84rem'}}>
                    No candidates graded for this exam yet. Click "Input / Edit Marks" above to grade examinees.
                  </div>
                )}
              </div>
            </div>

            {/* ADMIT MODAL PROMPT */}
            {admittingRegId && (
              <div style={{
                background: 'var(--bg-body)',
                border: '1px solid var(--brand-orange-border)',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-primary)'}}>
                    Confirm Regular Admission for Candidate ID: {admittingRegId}
                  </div>
                  <div style={{fontSize: '0.76rem', color: 'var(--text-secondary)'}}>
                    Select the ongoing regular subject batch to enroll:
                  </div>
                </div>

                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <select
                    className="select"
                    value={targetBatchId}
                    onChange={e => setTargetBatchId(e.target.value)}
                    style={{minWidth: '200px'}}
                  >
                    <option value="">Select Regular Batch (Optional)</option>
                    {batches
                      .filter(b => b.branchId === currentExam.branchId && b.subjectId === currentExam.subjectId)
                      .map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))
                    }
                  </select>

                  <button
                    type="button"
                    className="btnCancel"
                    onClick={() => setAdmittingRegId(null)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btnPrimary"
                    onClick={() => handleConfirmAdmission(admittingRegId)}
                    disabled={isLoading}
                  >
                    Confirm & Admit
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </Modal>
  );
}
