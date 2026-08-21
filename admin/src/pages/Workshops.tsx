import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Layers, 
  BookOpen, 
  CheckSquare, 
  Award,
  RefreshCw,
  MapPin,
  FileText,
  CheckCircle2,
  Edit2,
  Trash2,
  Clock,
  CalendarDays,
  Printer
} from 'lucide-react';
import { 
  workshopService, 
  type WorkshopSessionItem, 
  type WorkshopBatchItem
} from '../services/workshopService';
import { staffService, type StaffItem } from '../services/staffService';
import { academicService, type BranchItem } from '../services/academicService';

// Reusable Corporate UI Kit
import { PageHeader } from '../components/ui/PageHeader';
import { MetricsStrip, type MetricItem } from '../components/ui/MetricsStrip';
import { SubNavTabs, type TabItem } from '../components/ui/SubNavTabs';
import { DataTableToolbar } from '../components/ui/DataTableToolbar';
import { CustomSelect } from '../components/ui/CustomSelect';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UserAvatar } from '../components/ui/UserAvatar';

// Subcomponents
import ModeratorAssignModal from '../components/workshops/ModeratorAssignModal';
import Modal from '../components/ui/Modal';
import WorkshopAssessmentModal from '../components/modals/WorkshopAssessmentModal';
import GraduateTraineeModal from '../components/modals/GraduateTraineeModal';
import StaffQrScannerModal from '../components/modals/StaffQrScannerModal';
import PrintableAttendanceSheetModal from '../components/modals/PrintableAttendanceSheetModal';
import ManageWorkshopSessionsModal from '../components/modals/ManageWorkshopSessionsModal';

import styles from './Workshops.module.css';

type WorkshopTab = 'BATCH' | 'RESOURCE' | 'ATTENDANCE' | 'EXAM';

// Convert "09:00" -> "09:00 AM", "15:30" -> "03:30 PM"
function format24To12(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return time24;
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, '0')}:${m} ${period}`;
}

// Convert "09:00 AM - 12:00 PM" -> { start: "09:00", end: "12:00" }
function parse12To24Range(timeRangeStr?: string): { start: string; end: string } {
  if (!timeRangeStr) return { start: '09:00', end: '12:00' };
  const parts = timeRangeStr.split('-').map(p => p.trim());
  
  const parseSingle12 = (val: string, defaultVal: string): string => {
    if (!val) return defaultVal;
    const match = val.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return defaultVal;
    let h = parseInt(match[1], 10);
    const m = match[2];
    const period = (match[3] || 'AM').toUpperCase();
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m}`;
  };

  return {
    start: parseSingle12(parts[0], '09:00'),
    end: parseSingle12(parts[1] || parts[0], '12:00')
  };
}

export default function Workshops() {
  const [sessions, setSessions] = useState<WorkshopSessionItem[]>([]);
  const [activeSession, setActiveSession] = useState<WorkshopSessionItem | null>(null);
  const [isManageSessionsOpen, setIsManageSessionsOpen] = useState(false);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [activeTab, setActiveTab] = useState<WorkshopTab>('BATCH');

  // Moderator modal state
  const [moderatorModalBatch, setModeratorModalBatch] = useState<WorkshopBatchItem | null>(null);

  // New & Edit Batch Form Modal state
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<WorkshopBatchItem | null>(null);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchDays, setNewBatchDays] = useState('Friday & Saturday');
  const [newBatchStartTime, setNewBatchStartTime] = useState('09:00');
  const [newBatchEndTime, setNewBatchEndTime] = useState('12:00');
  const [newBatchRoom, setNewBatchRoom] = useState('');
  const [newBatchCapacity, setNewBatchCapacity] = useState<number>(30);
  const [newBatchStatus, setNewBatchStatus] = useState('ACTIVE');
  const [newBatchBranchId, setNewBatchBranchId] = useState('');

  // Resource State
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [resourceBatchId, setResourceBatchId] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceType, setResourceType] = useState('LYRICS');
  const [resourceContent, setResourceContent] = useState('');

  // Attendance & Exam State
  const [attendanceBatchId, setAttendanceBatchId] = useState('');
  const [examBatchId, setExamBatchId] = useState('');
  const [examMarks, setExamMarks] = useState<Record<string, { classTest: number; viva: number }>>({});

  // Operational Modals State
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isPrintAttendanceOpen, setIsPrintAttendanceOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isGraduateModalOpen, setIsGraduateModalOpen] = useState(false);
  const [graduateTraineeData, setGraduateTraineeData] = useState<{
    enrollmentId: string;
    studentName: string;
    studentRegNo?: string;
    compositeScore: number;
    batchId: string;
  } | null>(null);

  const [studentsList, setStudentsList] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [workshopRes, staffRes, branchRes, studentRes] = await Promise.all([
        workshopService.getWorkshops(),
        staffService.getStaff(),
        academicService.getBranches(),
        academicService.getStudents()
      ]);

      if (workshopRes.success && workshopRes.data.length > 0) {
        setSessions(workshopRes.data);
        setActiveSession(prev => {
          if (!prev) return workshopRes.data[0];
          const found = workshopRes.data.find(s => s.id === prev.id);
          return found || workshopRes.data[0];
        });
      } else {
        setSessions([]);
        setActiveSession(null);
      }
      if (staffRes.success) setStaffList(staffRes.data);
      if (branchRes.success) setBranches(branchRes.data);
      if (studentRes.success) setStudentsList(studentRes.data);
    } catch (error) {
      console.error('Failed to load workshop data:', error);
    }
  }, []);

  // Session Handlers
  const handleCreateSession = async (payload: any) => {
    const res = await workshopService.createWorkshop(payload);
    if (res.success) {
      await loadData();
      if (res.data) setActiveSession(res.data);
    }
  };

  const handleUpdateSession = async (id: string, payload: any) => {
    const res = await workshopService.updateWorkshop(id, payload);
    if (res.success) {
      await loadData();
    }
  };

  const handleDeleteSession = async (id: string) => {
    const res = await workshopService.deleteWorkshop(id);
    if (res.success) {
      await loadData();
    }
  };

  const handleToggleSessionStatus = async (sessionId: string, status: string) => {
    const res = await workshopService.updateWorkshopStatus(sessionId, status);
    if (res.success) {
      await loadData();
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived Values
  const currentBatches = useMemo(() => {
    if (!activeSession) return [];
    return activeSession.batches || [];
  }, [activeSession]);

  const filteredBatches = useMemo(() => {
    return currentBatches.filter(batch => {
      const matchesSearch = batch.name.toLowerCase().includes(search.toLowerCase()) ||
        (batch.roomNo && batch.roomNo.toLowerCase().includes(search.toLowerCase()));
      const matchesBranch = selectedBranch === 'ALL' || batch.branchId === selectedBranch;
      return matchesSearch && matchesBranch;
    });
  }, [currentBatches, search, selectedBranch]);

  const allResources = useMemo(() => {
    return currentBatches.flatMap(b => (b.resources || []).map(r => ({ ...r, batchName: b.name })));
  }, [currentBatches]);

  const assignedModeratorsCount = useMemo(() => {
    const staffIds = new Set<string>();
    currentBatches.forEach(b => {
      b.moderators?.forEach(m => staffIds.add(m.staffId));
    });
    return staffIds.size;
  }, [currentBatches]);

  const totalStudents = useMemo(() => {
    return currentBatches.reduce((acc, b) => acc + (b.enrollments?.length || 0), 0);
  }, [currentBatches]);

  // High Density Clean Metrics (Top KPI Strip)
  const metricItems: MetricItem[] = useMemo(() => [
    {
      id: 'total-batches',
      label: 'Total Batches (Cohorts)',
      value: currentBatches.length,
      delta: { value: 'Active', isPositive: true },
      sparklineData: [2, 3, 3, 4, 3, 5],
      sparklineColor: '#FF790E'
    },
    {
      id: 'enrolled-candidates',
      label: 'Enrolled Trainees',
      value: totalStudents,
      delta: { value: `Capacity: ${activeSession?.targetCapacity || 90}`, isPositive: true },
      sparklineData: [10, 25, 40, 55, 70, 90],
      sparklineColor: '#10B981'
    },
    {
      id: 'staff-moderators',
      label: 'Assigned Staff (In-Charge)',
      value: assignedModeratorsCount,
      delta: { value: 'Moderators', isPositive: true },
      sparklineData: [1, 2, 2, 3, 3],
      sparklineColor: '#6366F1'
    },
    {
      id: 'published-resources',
      label: 'Study Materials (Resources)',
      value: allResources.length,
      delta: { value: 'Published', isPositive: true },
      sparklineData: [2, 4, 6, 8, 12],
      sparklineColor: '#F59E0B'
    }
  ], [activeSession, currentBatches, assignedModeratorsCount, totalStudents, allResources.length]);

  // EXACT 4 TABS: Batch | Resource | Attendance | Exam
  const tabs: TabItem<WorkshopTab>[] = [
    { id: 'BATCH', label: 'Batch', count: currentBatches.length, icon: <Layers size={14} /> },
    { id: 'RESOURCE', label: 'Resource', count: allResources.length, icon: <BookOpen size={14} /> },
    { id: 'ATTENDANCE', label: 'Attendance', icon: <CheckSquare size={14} /> },
    { id: 'EXAM', label: 'Exam', icon: <Award size={14} /> }
  ];

  // Save Moderator Assignments
  const handleSaveModerators = async (batchId: string, staffIds: string[]) => {
    try {
      const res = await workshopService.assignModerators(batchId, staffIds);
      if (res.success) {
        setModeratorModalBatch(null);
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update moderators.');
    }
  };

  // Open Edit Batch
  const handleOpenEditBatch = (batch: WorkshopBatchItem) => {
    setEditingBatch(batch);
    setNewBatchName(batch.name);
    setNewBatchDays(batch.scheduleDays || 'Friday & Saturday');
    const { start, end } = parse12To24Range(batch.timeSlot || '09:00 AM - 12:00 PM');
    setNewBatchStartTime(start);
    setNewBatchEndTime(end);
    setNewBatchRoom(batch.roomNo || '');
    setNewBatchCapacity(batch.maxCapacity || 30);
    setNewBatchStatus(batch.status || 'ACTIVE');
    setNewBatchBranchId(batch.branchId || '');
    setIsAddBatchOpen(true);
  };

  // Close Batch Modal
  const handleCloseBatchModal = () => {
    setIsAddBatchOpen(false);
    setEditingBatch(null);
    setNewBatchName('');
    setNewBatchDays('Friday & Saturday');
    setNewBatchStartTime('09:00');
    setNewBatchEndTime('12:00');
    setNewBatchRoom('');
    setNewBatchCapacity(30);
    setNewBatchStatus('ACTIVE');
    setNewBatchBranchId('');
  };

  // Save Batch (Create or Update)
  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !newBatchName.trim()) return;

    const formattedTimeSlot = `${format24To12(newBatchStartTime)} - ${format24To12(newBatchEndTime)}`;

    try {
      if (editingBatch) {
        const res = await workshopService.updateBatch(editingBatch.id, {
          name: newBatchName.trim(),
          scheduleDays: newBatchDays.trim() || undefined,
          timeSlot: formattedTimeSlot || undefined,
          roomNo: newBatchRoom.trim() || undefined,
          maxCapacity: Number(newBatchCapacity) || 30,
          status: newBatchStatus,
          branchId: newBatchBranchId || null
        });

        if (res.success) {
          handleCloseBatchModal();
          loadData();
        }
      } else {
        const res = await workshopService.createBatch(activeSession.id, {
          name: newBatchName.trim(),
          scheduleDays: newBatchDays.trim() || undefined,
          timeSlot: formattedTimeSlot || undefined,
          roomNo: newBatchRoom.trim() || undefined,
          maxCapacity: Number(newBatchCapacity) || 30,
          branchId: newBatchBranchId || null
        });

        if (res.success) {
          handleCloseBatchModal();
          loadData();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save batch.');
    }
  };

  // Delete Batch
  const handleDeleteBatch = async (batch: WorkshopBatchItem) => {
    if (!window.confirm(`Are you sure you want to delete "${batch.name}"?`)) return;
    try {
      const res = await workshopService.deleteBatch(batch.id);
      if (res.success) {
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete batch.');
    }
  };

  const DAY_CHIPS = useMemo(() => [
    { code: 'Fri', full: 'Friday' },
    { code: 'Sat', full: 'Saturday' },
    { code: 'Sun', full: 'Sunday' },
    { code: 'Mon', full: 'Monday' },
    { code: 'Tue', full: 'Tuesday' },
    { code: 'Wed', full: 'Wednesday' },
    { code: 'Thu', full: 'Thursday' }
  ], []);

  // Check if a day is active in newBatchDays
  const isDayChipActive = (code: string, full: string) => {
    if (!newBatchDays) return false;
    const lower = newBatchDays.toLowerCase().trim();
    if (lower === 'everyday' || lower === 'daily') return true;
    
    const tokens = lower
      .split(/(?:,|\/|\+|&|\band\b)/)
      .map(t => t.trim())
      .filter(Boolean);

    return tokens.some(t => t === code.toLowerCase() || t === full.toLowerCase() || t.startsWith(code.toLowerCase()));
  };

  // Toggle day chip for manual days input
  const handleToggleDay = (code: string, full: string) => {
    const lower = (newBatchDays || '').toLowerCase().trim();
    
    if (lower === 'everyday' || lower === 'daily') {
      setNewBatchDays(full);
      return;
    }

    let tokens = (newBatchDays || '')
      .split(/(?:,|\/|\+|&|\band\b)/)
      .map(t => t.trim())
      .filter(Boolean);

    const exists = tokens.some(t => {
      const tl = t.toLowerCase();
      return tl === code.toLowerCase() || tl === full.toLowerCase() || tl.startsWith(code.toLowerCase());
    });

    if (exists) {
      tokens = tokens.filter(t => {
        const tl = t.toLowerCase();
        return !(tl === code.toLowerCase() || tl === full.toLowerCase() || tl.startsWith(code.toLowerCase()));
      });
    } else {
      tokens.push(full);
    }

    if (tokens.length === 0) {
      setNewBatchDays('');
    } else if (tokens.length === 7) {
      setNewBatchDays('Everyday');
    } else if (tokens.length === 2) {
      setNewBatchDays(`${tokens[0]} & ${tokens[1]}`);
    } else {
      setNewBatchDays(tokens.join(', '));
    }
  };

  // Create Resource
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceBatchId || !resourceTitle.trim()) return;

    try {
      const res = await workshopService.createResource(resourceBatchId, {
        title: resourceTitle.trim(),
        type: resourceType,
        content: resourceContent.trim() || undefined,
        uploadedBy: 'Batch Moderator'
      });

      if (res.success) {
        setIsAddResourceOpen(false);
        setResourceTitle('');
        setResourceContent('');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add resource.');
    }
  };

  const branchFilterOptions = useMemo(() => [
    { value: 'ALL', label: 'All Campuses' },
    ...branches.map(b => ({ value: b.id, label: b.name }))
  ], [branches]);

  const batchSelectOptions = useMemo(() => {
    return currentBatches.map(b => ({ value: b.id, label: b.name }));
  }, [currentBatches]);

  const resourceTypeOptions = useMemo(() => [
    { value: 'LYRICS', label: 'Lyrics & Sheet Music' },
    { value: 'SCRIPT', label: 'Drama / Stage Script' },
    { value: 'LECTURE_NOTE', label: 'Lecture Sheet & Notes' }
  ], []);

  const branchModalOptions = useMemo(() => [
    { value: '', label: 'Default / Central Studio Campus' },
    ...branches.map(b => ({ value: b.id, label: `${b.name} (${b.code || 'Campus'})` }))
  ], [branches]);

  const batchStatusOptions = useMemo(() => [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'INACTIVE', label: 'Inactive' }
  ], []);

  // Dynamically derive roster students from active batch enrollments or registered students
  const activeAttendanceBatch = useMemo(() => {
    return currentBatches.find(b => b.id === attendanceBatchId) || currentBatches[0];
  }, [currentBatches, attendanceBatchId]);

  const attendanceStudents = useMemo(() => {
    if (!activeAttendanceBatch) return [];
    if (activeAttendanceBatch.enrollments && activeAttendanceBatch.enrollments.length > 0) {
      return activeAttendanceBatch.enrollments.map((en, idx) => ({
        id: en.id,
        name: en.studentName,
        phone: 'N/A',
        regNo: `WS-${(idx + 1).toString().padStart(3, '0')}`
      }));
    }
    // Real student database fallback
    return studentsList.slice(0, 15).map((st, idx) => ({
      id: st.id,
      name: st.fullName,
      phone: st.phone || 'N/A',
      regNo: st.studentCode || `STU-${(idx + 1).toString().padStart(3, '0')}`
    }));
  }, [activeAttendanceBatch, studentsList]);

  const [isSavingMarks, setIsSavingMarks] = useState(false);

  const activeExamBatch = useMemo(() => {
    return currentBatches.find(b => b.id === examBatchId) || currentBatches[0];
  }, [currentBatches, examBatchId]);

  const examStudents = useMemo(() => {
    if (!activeExamBatch) return [];
    if (activeExamBatch.enrollments && activeExamBatch.enrollments.length > 0) {
      return activeExamBatch.enrollments.map((en, idx) => ({
        id: en.id,
        enrollmentId: en.id,
        name: en.studentName,
        regNo: en.registrationNo || `WS-${(idx + 1).toString().padStart(3, '0')}`,
        attendanceScore: en.attendanceScore || 0,
        classTestScore: en.classTestScore || 0,
        finalExamScore: en.finalExamScore || 0,
        compositeScore: en.compositeScore || 0,
        isQualifiedRegular: en.isQualifiedRegular || false
      }));
    }
    return [];
  }, [activeExamBatch]);

  const handleSaveMarksheet = async () => {
    const targetBatch = activeExamBatch || currentBatches[0];
    if (!targetBatch) return;

    const payload = examStudents.map(st => {
      const marks = examMarks[st.id] || { classTest: st.classTestScore, viva: st.finalExamScore };
      return {
        enrollmentId: st.id,
        classTestScore: marks.classTest,
        finalExamScore: marks.viva
      };
    });

    if (payload.length === 0) {
      alert('No enrolled trainees to save marks for.');
      return;
    }

    try {
      setIsSavingMarks(true);
      const res = await workshopService.saveBatchMarksheet(targetBatch.id, payload);
      if (res.success) {
        alert(res.message || 'Marksheet and composite scores saved successfully!');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save marksheet.');
    } finally {
      setIsSavingMarks(false);
    }
  };

  const sessionOptions = useMemo(() => {
    return sessions.map(s => ({
      value: s.id,
      label: `${s.title} ${s.branch ? `(${s.branch.name})` : '(All Branches)'}`
    }));
  }, [sessions]);

  return (
    <div className={styles.container}>
      {/* 1. Page Header with Session Switcher and Manage Sessions */}
      <PageHeader 
        title="Cultural Workshops"
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '260px' }}>
              <CustomSelect
                options={sessionOptions}
                value={activeSession?.id || ''}
                onChange={(val) => {
                  const found = sessions.find(s => s.id === val);
                  if (found) setActiveSession(found);
                }}
                placeholder="Select Workshop Session"
                aria-label="Filter batches by workshop session"
              />
            </div>
            <button 
              type="button"
              className="btnSecondary" 
              onClick={() => setIsManageSessionsOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '6px 12px' }}
            >
              <Layers size={14} />
              <span>Manage Sessions ({sessions.length})</span>
            </button>
          </div>
        }
      />

      {/* 2. Metrics Strip */}
      <MetricsStrip metrics={metricItems} />

      {/* 3. Sub Navigation Tabs: Batch | Resource | Attendance */}
      <SubNavTabs<WorkshopTab>
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId)}
        actions={
          <button 
            type="button" 
            className={styles.refreshBtn}
            onClick={loadData}
            title="Refresh Data"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        }
      />

      {/* =========================================================================
          TAB 1: BATCH
          ========================================================================= */}
      {activeTab === 'BATCH' && (
        <>
          <DataTableToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search workshop cohorts or studio rooms..."
            primaryActionLabel="New Batch"
            onPrimaryActionClick={() => {
              if (!activeSession) {
                alert('Please create or select an active Workshop Session first.');
                setIsManageSessionsOpen(true);
                return;
              }
              setIsAddBatchOpen(true);
            }}
            primaryActionIcon={<Plus size={15} strokeWidth={2.5} />}
            extraFilters={
              <CustomSelect
                value={selectedBranch}
                onChange={setSelectedBranch}
                options={branchFilterOptions}
                placeholder="All Campuses"
              />
            }
          />

          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th} style={{ width: '26%' }}>Batch Name</th>
                    <th className={styles.th} style={{ width: '22%' }}>Schedule (Days & Time)</th>
                    <th className={styles.th} style={{ width: '16%' }}>Room / Venue</th>
                    <th className={styles.th} style={{ width: '20%' }}>Assigned Officers</th>
                    <th className={styles.th} style={{ width: '8%' }}>Status</th>
                    <th className={styles.th} style={{ width: '8%', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyTd}>
                        No workshop batches found.
                      </td>
                    </tr>
                  ) : (
                    filteredBatches.map(batch => {
                      const enrolledCount = batch.enrollments?.length || 0;
                      return (
                        <tr key={batch.id} className={styles.tr}>
                          <td className={styles.td}>
                            <div className={styles.batchNameCell}>
                              <span className={styles.batchPrimaryName}>{batch.name}</span>
                              <span className={styles.batchCapacityText}>
                                Capacity: {enrolledCount} / {batch.maxCapacity} Enrolled
                              </span>
                            </div>
                          </td>

                          <td className={styles.td}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.80rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                <CalendarDays size={12} color="var(--brand-orange)" />
                                <span>{batch.scheduleDays || 'Friday & Saturday'}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                                <Clock size={11} color="var(--text-tertiary)" />
                                <span>{batch.timeSlot || '09:00 AM - 12:00 PM'}</span>
                              </div>
                            </div>
                          </td>

                          <td className={styles.td}>
                            <div className={styles.roomCell}>
                              <MapPin size={12} color="var(--brand-orange)" />
                              <span>{batch.roomNo || 'Central Studio'}</span>
                            </div>
                          </td>

                          <td className={styles.td}>
                            <div className={styles.moderatorsCell}>
                              {batch.moderators && batch.moderators.length > 0 ? (
                                <div className={styles.modPillRow}>
                                  {batch.moderators.map(m => (
                                    <span key={m.id} className={styles.modPill}>
                                      <UserAvatar name={m.staff?.fullName || 'Staff'} size={18} shape="circle" />
                                      <span>{m.staff?.fullName}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                                  No officer assigned
                                </span>
                              )}
                              <button
                                type="button"
                                className={styles.btnAssignSmall}
                                onClick={() => setModeratorModalBatch(batch)}
                              >
                                Manage
                              </button>
                            </div>
                          </td>

                          <td className={styles.td}>
                            <StatusBadge status={batch.status} />
                          </td>

                          <td className={styles.td} style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                className={styles.actionIconBtn}
                                title="Edit Batch"
                                onClick={() => handleOpenEditBatch(batch)}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                className={`${styles.actionIconBtn} ${styles.actionIconBtnDanger}`}
                                title="Delete Batch"
                                onClick={() => handleDeleteBatch(batch)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.tableFooterStrip}>
              <span>Showing {filteredBatches.length} of {currentBatches.length} workshop batches</span>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          TAB 2: RESOURCE (Lyrics, Scripts, Notes)
          ========================================================================= */}
      {activeTab === 'RESOURCE' && (
        <>
          <div className={styles.resourceHeaderStrip}>
            <span style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Showing {allResources.length} published lyrics, scripts, and study materials
            </span>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th} style={{ width: '32%' }}>Title & Subject</th>
                  <th className={styles.th} style={{ width: '18%' }}>Category</th>
                  <th className={styles.th} style={{ width: '22%' }}>Target Cohort / Batch</th>
                  <th className={styles.th} style={{ width: '18%' }}>Uploaded By</th>
                  <th className={styles.th} style={{ width: '10%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allResources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyTd}>
                      No resources uploaded yet. Click "+ Upload Resource" above.
                    </td>
                  </tr>
                ) : (
                  allResources.map(res => (
                    <tr key={res.id} className={styles.tr}>
                      <td className={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={15} color="var(--brand-orange)" />
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{res.title}</span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.shiftBadge}>
                          {res.type === 'LYRICS' ? 'Lyrics' : res.type === 'SCRIPT' ? 'Drama Script' : 'Lecture Sheet'}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{res.batchName}</span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ color: 'var(--text-tertiary)' }}>{res.uploadedBy || 'Coordinator'}</span>
                      </td>
                      <td className={styles.td}>
                        <button
                          type="button"
                          className={styles.btnAssignSmall}
                          onClick={() => alert(res.content || 'Resource content opened.')}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* =========================================================================
          TAB 3: ATTENDANCE (SECURE QR CODE SCANNER & TIME-GATED LOGS)
          ========================================================================= */}
      {activeTab === 'ATTENDANCE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Attendance Top Controls */}
          <div className={styles.attendanceControlStrip}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Select Cohort:</label>
              <CustomSelect
                options={batchSelectOptions}
                value={attendanceBatchId || currentBatches[0]?.id || ''}
                onChange={setAttendanceBatchId}
                placeholder="Select Cohort"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btnSecondary"
                onClick={() => setIsPrintAttendanceOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <Printer size={14} />
                <span>Print Attendance Sheet</span>
              </button>

              <button
                type="button"
                className="btnPrimary"
                onClick={() => setIsQrScannerOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '6px 14px' }}
              >
                <span>📱 Staff QR Scanner Simulator</span>
              </button>

              <button
                type="button"
                className={styles.refreshBtn}
                onClick={loadData}
                title="Refresh Attendance"
              >
                <RefreshCw size={13} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Attendance Roster Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th} style={{ width: '18%' }}>Reg No</th>
                    <th className={styles.th} style={{ width: '28%' }}>Student Name</th>
                    <th className={styles.th} style={{ width: '18%' }}>Attendance Rate</th>
                    <th className={styles.th} style={{ width: '18%' }}>Score (/30)</th>
                    <th className={styles.th} style={{ width: '18%' }}>QR Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.emptyTd}>
                        No trainees enrolled in this cohort batch yet. Assign trainees from Admissions.
                      </td>
                    </tr>
                  ) : (
                    attendanceStudents.map(student => {
                      const enrollment = currentBatches.find(b => b.id === (attendanceBatchId || currentBatches[0]?.id))?.enrollments?.find(e => e.id === student.id || e.registrationNo === student.regNo);
                      const rate = enrollment?.attendanceRate || 100;
                      const score = Math.round((rate / 100) * 30 * 10) / 10;

                      return (
                        <tr key={student.id} className={styles.tr}>
                          <td className={styles.td} style={{ fontWeight: 600, color: 'var(--brand-orange)' }}>
                            {student.regNo}
                          </td>
                          <td className={styles.td} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {student.name}
                          </td>
                          <td className={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${rate}%`, height: '100%', backgroundColor: rate >= 80 ? '#16A34A' : '#EAB308' }} />
                              </div>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{rate}%</span>
                            </div>
                          </td>
                          <td className={styles.td} style={{ fontWeight: 700, color: '#16A34A' }}>
                            {score} / 30
                          </td>
                          <td className={styles.td}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#DCFCE7',
                              color: '#15803D',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}>
                              QR Verified
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.tableFooterStrip}>
              <span>Showing {attendanceStudents.length} trainees in this batch</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: EXAM & EVALUATION (COMPOSITE SCORING & REGULAR GRADUATION)
          ========================================================================= */}
      {activeTab === 'EXAM' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Exam Control Strip */}
          <div className={styles.attendanceControlStrip}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Select Cohort:</label>
              <CustomSelect
                options={batchSelectOptions}
                value={examBatchId || currentBatches[0]?.id || ''}
                onChange={setExamBatchId}
                placeholder="Select Cohort"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btnSecondary"
                onClick={() => setIsAssessmentModalOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', padding: '6px 12px' }}
              >
                <Plus size={13} />
                <span>Schedule Assessment</span>
              </button>

              <button
                type="button"
                className="btnPrimary"
                onClick={handleSaveMarksheet}
                disabled={isSavingMarks}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', padding: '6px 14px' }}
              >
                <CheckCircle2 size={13} />
                <span>{isSavingMarks ? 'Saving...' : 'Save Marksheet'}</span>
              </button>
            </div>
          </div>

          {/* Formula Info Banner */}
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'var(--bg-surface-elevated, #F8FAFC)',
            border: '1px solid var(--border-light, #E2E8F0)',
            borderRadius: '8px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>
              📐 <strong>Composite Evaluation Formula:</strong> Attendance Score (30%) + Class Tests (30%) + Final Practical (40%) = <strong>100% Final Score</strong>
            </span>
            <span style={{ fontWeight: 700, color: '#16A34A' }}>Passing Mark: 60/100</span>
          </div>

          {/* Exam Marks Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th} style={{ width: '14%' }}>Reg No</th>
                    <th className={styles.th} style={{ width: '22%' }}>Student Name</th>
                    <th className={styles.th} style={{ width: '14%' }}>Attendance (30)</th>
                    <th className={styles.th} style={{ width: '14%' }}>Class Tests (30)</th>
                    <th className={styles.th} style={{ width: '14%' }}>Final Exam (40)</th>
                    <th className={styles.th} style={{ width: '12%' }}>Total Score</th>
                    <th className={styles.th} style={{ width: '10%' }}>Graduation</th>
                  </tr>
                </thead>
                <tbody>
                  {examStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.emptyTd}>
                        No trainees enrolled in this cohort batch for evaluation.
                      </td>
                    </tr>
                  ) : (
                    examStudents.map(student => {
                      const marks = examMarks[student.id] || {
                        classTest: student.classTestScore || 0,
                        viva: student.finalExamScore || 0
                      };
                      const attScore = student.attendanceScore || 0;
                      const total = Math.round((attScore + marks.classTest + marks.viva) * 10) / 10;
                      const isPassed = total >= 60;
                      const grade = total >= 85 ? 'A+' : total >= 75 ? 'A' : total >= 60 ? 'B' : 'Fail';

                      return (
                        <tr key={student.id} className={styles.tr}>
                          <td className={styles.td} style={{ fontWeight: 600, color: 'var(--brand-orange)' }}>
                            {student.regNo}
                          </td>
                          <td className={styles.td} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {student.name}
                          </td>
                          <td className={styles.td} style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {attScore} / 30
                          </td>
                          <td className={styles.td}>
                            <input
                              type="number"
                              className={styles.scoreInput}
                              value={marks.classTest}
                              max={30}
                              min={0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setExamMarks(prev => ({
                                  ...prev,
                                  [student.id]: { ...marks, classTest: Math.min(val, 30) }
                                }));
                              }}
                            />
                          </td>
                          <td className={styles.td}>
                            <input
                              type="number"
                              className={styles.scoreInput}
                              value={marks.viva}
                              max={40}
                              min={0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setExamMarks(prev => ({
                                  ...prev,
                                  [student.id]: { ...marks, viva: Math.min(val, 40) }
                                }));
                              }}
                            />
                          </td>
                          <td className={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '0.86rem', color: isPassed ? '#16A34A' : '#DC2626' }}>
                                {total}
                              </strong>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.70rem',
                                fontWeight: 700,
                                background: isPassed ? '#DCFCE7' : '#FEE2E2',
                                color: isPassed ? '#15803D' : '#B91C1C'
                              }}>
                                {grade}
                              </span>
                            </div>
                          </td>
                          <td className={styles.td}>
                            {isPassed ? (
                              <button
                                type="button"
                                className="btnPrimary"
                                style={{ fontSize: '0.74rem', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => {
                                  setGraduateTraineeData({
                                    enrollmentId: student.id,
                                    studentName: student.name,
                                    studentRegNo: student.regNo,
                                    compositeScore: total,
                                    batchId: examBatchId || currentBatches[0]?.id
                                  });
                                  setIsGraduateModalOpen(true);
                                }}
                              >
                                <span>Graduate</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Incomplete</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.tableFooterStrip}>
              <span>Showing {examStudents.length} evaluated trainees in this batch</span>
            </div>
          </div>
        </div>
      )}

      {/* MODERATOR ASSIGNMENT MODAL */}
      {moderatorModalBatch && (
        <ModeratorAssignModal
          batch={moderatorModalBatch}
          availableStaff={staffList}
          isOpen={true}
          onClose={() => setModeratorModalBatch(null)}
          onSave={handleSaveModerators}
        />
      )}

      {/* ADD / EDIT BATCH MODAL */}
      <Modal
        isOpen={isAddBatchOpen}
        onClose={handleCloseBatchModal}
        title={editingBatch ? 'Edit Workshop Batch' : 'Add New Workshop Batch'}
        size="lg"
      >
        <form onSubmit={handleSaveBatch} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '6px 0' }}>
          <div className="formGroup">
            <label className="label">Cohort / Batch Name *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Workshop Batch 01 (Morning Cohort)"
              value={newBatchName}
              onChange={(e) => setNewBatchName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="formGroup">
              <label className="label">Campus / Branch</label>
              <CustomSelect
                options={branchModalOptions}
                value={newBatchBranchId}
                onChange={setNewBatchBranchId}
                variant="form"
                placeholder="Select Campus"
                fullWidth
              />
            </div>

            <div className="formGroup">
              <label className="label">Classroom / Studio Room</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Studio Room 101"
                value={newBatchRoom}
                onChange={(e) => setNewBatchRoom(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="formGroup">
              <label className="label">Class Days (Schedule Days) *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Friday & Saturday"
                value={newBatchDays}
                onChange={(e) => setNewBatchDays(e.target.value)}
                required
              />
              <div className={styles.dayChipsRow}>
                {DAY_CHIPS.map(day => (
                  <button
                    type="button"
                    key={day.code}
                    className={`${styles.dayChip} ${isDayChipActive(day.code, day.full) ? styles.dayChipActive : ''}`}
                    onClick={() => handleToggleDay(day.code, day.full)}
                  >
                    {day.code}
                  </button>
                ))}
                <button
                  type="button"
                  className={`${styles.presetChip} ${newBatchDays.toLowerCase().trim() === 'everyday' ? styles.dayChipActive : ''}`}
                  onClick={() => setNewBatchDays(newBatchDays.toLowerCase().trim() === 'everyday' ? '' : 'Everyday')}
                >
                  Everyday
                </button>
              </div>
            </div>

            <div className="formGroup">
              <label className="label">Class Time (Start & End) *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <input
                    type="time"
                    className="input"
                    value={newBatchStartTime}
                    onChange={(e) => setNewBatchStartTime(e.target.value)}
                    required
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>
                <div>
                  <input
                    type="time"
                    className="input"
                    value={newBatchEndTime}
                    onChange={(e) => setNewBatchEndTime(e.target.value)}
                    required
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="formGroup">
              <label className="label">Max Capacity (Seats) *</label>
              <input
                type="number"
                className="input"
                min={1}
                max={500}
                placeholder="e.g. 30"
                value={newBatchCapacity}
                onChange={(e) => setNewBatchCapacity(parseInt(e.target.value, 10) || 0)}
                required
              />
            </div>

            <div className="formGroup">
              <label className="label">Batch Status *</label>
              <CustomSelect
                options={batchStatusOptions}
                value={newBatchStatus}
                onChange={setNewBatchStatus}
                variant="form"
                fullWidth
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={handleCloseBatchModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnAddHeader}
            >
              {editingBatch ? 'Update Batch' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD RESOURCE MODAL */}
      <Modal
        isOpen={isAddResourceOpen}
        onClose={() => setIsAddResourceOpen(false)}
        title="Upload Workshop Resource"
        size="md"
      >
        <form onSubmit={handleCreateResource} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '6px 0' }}>
          <div className="formGroup">
            <label className="label">Target Workshop Cohort *</label>
            <CustomSelect
              options={batchSelectOptions}
              value={resourceBatchId}
              onChange={setResourceBatchId}
              variant="form"
              fullWidth
            />
          </div>

          <div className="formGroup">
            <label className="label">Resource Title *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Workshop Lyrics & Notes Sheet"
              value={resourceTitle}
              onChange={(e) => setResourceTitle(e.target.value)}
              required
            />
          </div>

          <div className="formGroup">
            <label className="label">Resource Category *</label>
            <CustomSelect
              options={resourceTypeOptions}
              value={resourceType}
              onChange={setResourceType}
              variant="form"
              fullWidth
            />
          </div>

          <div className="formGroup">
            <label className="label">Text Content / Lyrics Body</label>
            <textarea
              className="input"
              style={{ minHeight: '80px' }}
              placeholder="Paste lyrics, notes, or drama dialogue lines here..."
              value={resourceContent}
              onChange={(e) => setResourceContent(e.target.value)}
            />
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => setIsAddResourceOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnAddHeader}
            >
              Publish Resource
            </button>
          </div>
        </form>
      </Modal>

      {/* Staff QR Attendance Scanner Modal */}
      <StaffQrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        batch={currentBatches.find(b => b.id === (attendanceBatchId || currentBatches[0]?.id)) || currentBatches[0] || null}
        onSuccess={loadData}
      />

      {/* Printable Daily Attendance & Roster Sheet Modal */}
      <PrintableAttendanceSheetModal
        isOpen={isPrintAttendanceOpen}
        onClose={() => setIsPrintAttendanceOpen(false)}
        batchName={currentBatches.find(b => b.id === (attendanceBatchId || currentBatches[0]?.id))?.name || 'Workshop Cohort'}
        scheduleDays={currentBatches.find(b => b.id === (attendanceBatchId || currentBatches[0]?.id))?.scheduleDays || ''}
        timeSlot={currentBatches.find(b => b.id === (attendanceBatchId || currentBatches[0]?.id))?.timeSlot || ''}
        students={attendanceStudents}
        sessionTitle={activeSession?.title || 'Workshop Session'}
      />

      {/* Workshop Assessment Scheduler Modal */}
      <WorkshopAssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        batchId={examBatchId || currentBatches[0]?.id || ''}
        batchName={currentBatches.find(b => b.id === (examBatchId || currentBatches[0]?.id))?.name || 'Selected Cohort'}
        onSuccess={loadData}
      />

      {/* Graduate Trainee to Regular Academy Modal */}
      {graduateTraineeData && (
        <GraduateTraineeModal
          isOpen={isGraduateModalOpen}
          onClose={() => {
            setIsGraduateModalOpen(false);
            setGraduateTraineeData(null);
          }}
          batchId={graduateTraineeData.batchId}
          enrollmentId={graduateTraineeData.enrollmentId}
          studentName={graduateTraineeData.studentName}
          studentRegNo={graduateTraineeData.studentRegNo}
          compositeScore={graduateTraineeData.compositeScore}
          onSuccess={loadData}
        />
      )}

      {/* Manage Workshop Sessions Modal */}
      <ManageWorkshopSessionsModal
        isOpen={isManageSessionsOpen}
        onClose={() => setIsManageSessionsOpen(false)}
        sessions={sessions}
        branches={branches}
        activeSessionId={activeSession?.id}
        onSelectSession={(session) => {
          setActiveSession(session);
        }}
        onCreateSession={handleCreateSession}
        onUpdateSession={handleUpdateSession}
        onDeleteSession={handleDeleteSession}
        onToggleStatus={handleToggleSessionStatus}
      />
    </div>
  );
}
