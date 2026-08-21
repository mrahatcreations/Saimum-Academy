import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Award, 
  FileText,
  Phone,
  Mail,
  Plus,
  Layers,
  Filter
} from 'lucide-react';
import { admissionService } from '../services/admissionService';
import { fetchAcademicLookups } from '../services/batchService';
import type { Registration, AdmissionSession } from '../types/admission';

// Modals & Drawers
import ApplicantProfileDrawer from '../components/modals/ApplicantProfileDrawer';
import ScheduleVivaModal from '../components/modals/ScheduleVivaModal';
import BulkScheduleVivaModal from '../components/modals/BulkScheduleVivaModal';
import WorkshopDistributionModal from '../components/modals/WorkshopDistributionModal';
import PrintableVivaSheetModal from '../components/modals/PrintableVivaSheetModal';
import NewAdmissionModal from '../components/modals/NewAdmissionModal';
import EditAdmissionModal from '../components/modals/EditAdmissionModal';
import ManageSessionsModal from '../components/modals/ManageSessionsModal';
import EvaluateVivaModal from '../components/modals/EvaluateVivaModal';
import WorkshopExamModal from '../components/modals/WorkshopExamModal';
import AssignWorkshopModal from '../components/modals/AssignWorkshopModal';

// Reusable Corporate Minimal UI Kit
import { PageHeader } from '../components/ui/PageHeader';
import { MetricsStrip, type MetricItem } from '../components/ui/MetricsStrip';
import { SubNavTabs, type TabItem } from '../components/ui/SubNavTabs';
import { DataTableToolbar } from '../components/ui/DataTableToolbar';
import { CustomCheckbox } from '../components/ui/CustomCheckbox';
import { ScoreMeter } from '../components/ui/ScoreMeter';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FloatingActionBar, type BulkActionItem } from '../components/ui/FloatingActionBar';
import { UserAvatar } from '../components/ui/UserAvatar';
import { CustomSelect } from '../components/ui/CustomSelect';
import TableActionMenu from '../components/ui/TableActionMenu';

import styles from './Admissions.module.css';

type SortOption = 'NEWEST' | 'OLDEST' | 'NAME_AZ' | 'NAME_ZA' | 'SCORE_HIGH' | 'SCORE_LOW';

export default function Admissions() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [sessions, setSessions] = useState<AdmissionSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  
  // Sort State
  const [sortOrder, setSortOrder] = useState<SortOption>('NEWEST');

  // Filter States
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [ageRangeFilter, setAgeRangeFilter] = useState('ALL');
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [bloodFilter, setBloodFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [scoreFilter, setScoreFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Pagination
  const [pageSize, setPageSize] = useState<number | 'ALL'>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dynamic lookups
  const [branchOptions, setBranchOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [subjectOptions, setSubjectOptions] = useState<Array<{ id: string; name: string }>>([]);

  // Modals
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [vivaModalReg, setVivaModalReg] = useState<Registration | null>(null);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);
  const [isBulkVivaModalOpen, setIsBulkVivaModalOpen] = useState(false);
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isNewAdmissionModalOpen, setIsNewAdmissionModalOpen] = useState(false);
  const [editModalReg, setEditModalReg] = useState<Registration | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [evalModalReg, setEvalModalReg] = useState<Registration | null>(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isWorkshopExamModalOpen, setIsWorkshopExamModalOpen] = useState(false);
  const [isAssignWorkshopOpen, setIsAssignWorkshopOpen] = useState(false);
  const [assignWorkshopModalReg, setAssignWorkshopModalReg] = useState<Registration | null>(null);

  // Age Calculator
  const calculateAge = (dobString?: string): number | null => {
    if (!dobString) return null;
    const birth = new Date(dobString);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Extract unique classes and districts from registrations
  const availableDistricts = useMemo(() => {
    const districts = new Set<string>();
    registrations.forEach(r => {
      if (r.person.presentAddress?.district?.trim()) districts.add(r.person.presentAddress.district.trim());
      if (r.person.permanentAddress?.district?.trim()) districts.add(r.person.permanentAddress.district.trim());
    });
    return Array.from(districts).sort();
  }, [registrations]);

  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    registrations.forEach(r => {
      if (r.person.currentClass?.trim()) classes.add(r.person.currentClass.trim());
    });
    return Array.from(classes).sort();
  }, [registrations]);

  const activeFilterCount = [
    branchFilter !== 'ALL',
    subjectFilter !== 'ALL',
    genderFilter !== 'ALL',
    classFilter !== 'ALL',
    (ageRangeFilter !== 'ALL' || minAge !== '' || maxAge !== ''),
    bloodFilter !== 'ALL',
    districtFilter !== 'ALL',
    scoreFilter !== 'ALL',
    paymentFilter !== 'ALL'
  ].filter(Boolean).length;

  const handleResetAllFilters = () => {
    setBranchFilter('ALL');
    setSubjectFilter('ALL');
    setGenderFilter('ALL');
    setClassFilter('ALL');
    setAgeRangeFilter('ALL');
    setMinAge('');
    setMaxAge('');
    setBloodFilter('ALL');
    setDistrictFilter('ALL');
    setScoreFilter('ALL');
    setPaymentFilter('ALL');
    setSearch('');
  };

  // Load Sessions
  const loadSessions = useCallback(async () => {
    try {
      const res = await admissionService.getSessions();
      if (res.success && res.data.length > 0) {
        setSessions(res.data);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  }, []);

  // Load Admissions
  const loadAdmissions = useCallback(async (sessionIdOverride?: string) => {
    try {
      setIsLoading(true);
      const targetSession = sessionIdOverride !== undefined ? sessionIdOverride : selectedSessionId;
      const res = await admissionService.getAdmissions({
        sessionId: targetSession === 'ALL' ? undefined : targetSession
      });
      if (res.success) {
        setRegistrations(res.data);
      }
    } catch (err) {
      console.error('Failed to load admissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSessionId]);

  // Load Lookups
  const loadFilterOptions = useCallback(async () => {
    try {
      const lookups = await fetchAcademicLookups();
      setBranchOptions(lookups.branches || []);
      setSubjectOptions(lookups.subjects || []);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    loadFilterOptions();
  }, [loadSessions, loadFilterOptions]);

  useEffect(() => {
    loadAdmissions();
    setSelectedIds(new Set());
  }, [selectedSessionId, loadAdmissions]);

  // Metric counts
  const totalCount = registrations.length;
  const pendingVivaCount = registrations.filter(r => r.status === 'PENDING_VIVA').length;
  const scheduledVivaCount = registrations.filter(r => r.status === 'VIVA_SCHEDULED').length;
  const selectedCount = registrations.filter(r => r.status === 'SELECTED' || r.status === 'WORKSHOP').length;
  const rejectedCount = registrations.filter(r => r.status === 'REJECTED').length;

  // Filter & Sort logic
  const filteredRegistrations = useMemo(() => {
    let result = registrations.filter(reg => {
      if (activeTab === 'PENDING_VIVA' && reg.status !== 'PENDING_VIVA') return false;
      if (activeTab === 'VIVA_SCHEDULED' && reg.status !== 'VIVA_SCHEDULED') return false;
      if (activeTab === 'SELECTED' && reg.status !== 'SELECTED' && reg.status !== 'WORKSHOP') return false;
      if (activeTab === 'REJECTED' && reg.status !== 'REJECTED') return false;

      // Text Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNameEn = reg.person.fullNameEn.toLowerCase().includes(q);
        const matchNameBn = reg.person.fullNameBn?.toLowerCase().includes(q) || false;
        const matchPhone = reg.person.phone.includes(q);
        const matchRegNo = reg.registrationNo.toLowerCase().includes(q);
        const matchSub = reg.subjectName?.toLowerCase().includes(q) || false;
        const matchBranch = reg.branchName?.toLowerCase().includes(q) || false;
        const matchInst = reg.person.academicInstitution?.toLowerCase().includes(q) || false;
        const matchClass = reg.person.currentClass?.toLowerCase().includes(q) || false;
        if (!matchNameEn && !matchNameBn && !matchPhone && !matchRegNo && !matchSub && !matchBranch && !matchInst && !matchClass) return false;
      }

      // Branch & Subject
      if (branchFilter !== 'ALL' && reg.branchName !== branchFilter) return false;
      if (subjectFilter !== 'ALL' && reg.subjectName !== subjectFilter) return false;

      // Gender
      if (genderFilter !== 'ALL' && reg.person.gender !== genderFilter) return false;

      // Academic Class
      if (classFilter !== 'ALL') {
        const studentClass = reg.person.currentClass?.trim().toLowerCase() || '';
        if (classFilter === 'PRIMARY' && !['class 1', 'class 2', 'class 3', 'class 4', 'class 5', '1', '2', '3', '4', '5'].some(c => studentClass.includes(c))) return false;
        if (classFilter === 'HIGH_SCHOOL' && !['class 6', 'class 7', 'class 8', 'class 9', 'class 10', 'ssc', 'dakhil', '6', '7', '8', '9', '10'].some(c => studentClass.includes(c))) return false;
        if (classFilter === 'COLLEGE' && !['hsc', 'alim', 'college', '11', '12', 'class 11', 'class 12'].some(c => studentClass.includes(c))) return false;
        if (classFilter === 'UNIVERSITY' && !['honours', 'degree', 'fazil', 'masters', 'kamil', 'bba', 'cse', 'university'].some(c => studentClass.includes(c))) return false;
        if (!['PRIMARY', 'HIGH_SCHOOL', 'COLLEGE', 'UNIVERSITY'].includes(classFilter) && studentClass !== classFilter.toLowerCase()) return false;
      }

      // Age Filter (Manual Custom Min/Max OR Preset Range)
      if (minAge || maxAge) {
        const age = calculateAge(reg.person.dob);
        if (age === null) return false;
        const min = minAge ? parseInt(minAge, 10) : 0;
        const max = maxAge ? parseInt(maxAge, 10) : 999;
        if (!isNaN(min) && age < min) return false;
        if (!isNaN(max) && age > max) return false;
      } else if (ageRangeFilter !== 'ALL') {
        const age = calculateAge(reg.person.dob);
        if (age === null) return false;
        if (ageRangeFilter === 'UNDER_8' && age >= 8) return false;
        if (ageRangeFilter === '8_12' && (age < 8 || age > 12)) return false;
        if (ageRangeFilter === '13_17' && (age < 13 || age > 17)) return false;
        if (ageRangeFilter === '18_25' && (age < 18 || age > 25)) return false;
        if (ageRangeFilter === '25_PLUS' && age < 25) return false;
      }

      // Blood Group
      if (bloodFilter !== 'ALL' && reg.person.bloodGroup !== bloodFilter) return false;

      // District
      if (districtFilter !== 'ALL') {
        const presentDist = reg.person.presentAddress?.district?.toLowerCase() || '';
        const permDist = reg.person.permanentAddress?.district?.toLowerCase() || '';
        const targetDist = districtFilter.toLowerCase();
        if (!presentDist.includes(targetDist) && !permDist.includes(targetDist)) return false;
      }

      // Viva Score Filter
      if (scoreFilter !== 'ALL') {
        const score = reg.viva?.score;
        if (scoreFilter === 'SCORE_80_PLUS' && (score === undefined || score === null || score < 80)) return false;
        if (scoreFilter === 'SCORE_60_79' && (score === undefined || score === null || score < 60 || score >= 80)) return false;
        if (scoreFilter === 'SCORE_UNDER_60' && (score === undefined || score === null || score >= 60)) return false;
        if (scoreFilter === 'NOT_EVALUATED' && score !== undefined && score !== null) return false;
      }

      // Payment Status
      if (paymentFilter !== 'ALL') {
        const isPaid = (reg as any).paymentStatus === 'PAID' || (reg as any).isPaid;
        if (paymentFilter === 'PAID' && !isPaid) return false;
        if (paymentFilter === 'PENDING' && isPaid) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === 'NAME_AZ') {
        return a.person.fullNameEn.localeCompare(b.person.fullNameEn);
      }
      if (sortOrder === 'NAME_ZA') {
        return b.person.fullNameEn.localeCompare(a.person.fullNameEn);
      }
      if (sortOrder === 'SCORE_HIGH') {
        return (b.viva?.score || 0) - (a.viva?.score || 0);
      }
      if (sortOrder === 'SCORE_LOW') {
        return (a.viva?.score || 0) - (b.viva?.score || 0);
      }
      if (sortOrder === 'OLDEST') {
        const d1 = new Date(a.appliedDate || (a as any).createdAt || 0).getTime();
        const d2 = new Date(b.appliedDate || (b as any).createdAt || 0).getTime();
        return d1 - d2;
      }
      // NEWEST by default
      const d1 = new Date(a.appliedDate || (a as any).createdAt || 0).getTime();
      const d2 = new Date(b.appliedDate || (b as any).createdAt || 0).getTime();
      return d2 - d1;
    });

    return result;
  }, [
    registrations,
    activeTab,
    search,
    branchFilter,
    subjectFilter,
    genderFilter,
    classFilter,
    minAge,
    maxAge,
    ageRangeFilter,
    bloodFilter,
    districtFilter,
    scoreFilter,
    paymentFilter,
    sortOrder
  ]);

  // Pagination
  const totalFiltered = filteredRegistrations.length;
  const totalPages = pageSize === 'ALL' ? 1 : Math.ceil(totalFiltered / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = pageSize === 'ALL' ? 0 : (safeCurrentPage - 1) * (typeof pageSize === 'number' ? pageSize : 20);
  const endIndex = pageSize === 'ALL' ? totalFiltered : Math.min(startIndex + (typeof pageSize === 'number' ? pageSize : 20), totalFiltered);
  
  const displayedRegistrations = useMemo(() => {
    if (pageSize === 'ALL') return filteredRegistrations;
    return filteredRegistrations.slice(startIndex, endIndex);
  }, [filteredRegistrations, pageSize, startIndex, endIndex]);

  // Selection handlers
  const isAllSelected = displayedRegistrations.length > 0 && displayedRegistrations.every(r => selectedIds.has(r.id));
  const isSomeSelected = displayedRegistrations.some(r => selectedIds.has(r.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        displayedRegistrations.forEach(r => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        displayedRegistrations.forEach(r => next.add(r.id));
        return next;
      });
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

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert('No applicant records to export.');
      return;
    }

    const headers = ['Registration No', 'Full Name (EN)', 'Full Name (BN)', 'Phone', 'Email', 'Department', 'Branch', 'Gender', 'Status', 'Viva Score', 'Registered Date'];
    const rows = filteredRegistrations.map(r => [
      `"${r.registrationNo}"`,
      `"${r.person.fullNameEn}"`,
      `"${r.person.fullNameBn || ''}"`,
      `"${r.person.phone}"`,
      `"${r.person.email || ''}"`,
      `"${r.departmentName || ''}"`,
      `"${r.branchName || ''}"`,
      `"${r.person.gender}"`,
      `"${r.status}"`,
      `"${r.viva?.score ?? ''}"`,
      `"${r.appliedDate || (r as any).createdAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Saimum_Applicants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Actions
  const handleBulkUpdateStatus = async (status: string) => {
    const regIds = Array.from(selectedIds);
    try {
      const res = await admissionService.bulkUpdateStatus(regIds, status);
      if (res.success) {
        await loadAdmissions();
        setSelectedIds(new Set());
      }
    } catch (err) {
      console.error('Failed to bulk update status:', err);
    }
  };

  const handleUpdateStatus = async (regId: string, newStatus: Registration['status']) => {
    try {
      const res = await admissionService.updateStatus(regId, newStatus);
      if (res.success) {
        setRegistrations(prev => prev.map(r => r.id === regId ? res.data : r));
        if (selectedReg && selectedReg.id === regId) {
          setSelectedReg(res.data);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteRegistration = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete applicant record "${name}"?`)) {
      try {
        const res = await admissionService.deleteAdmission(id);
        if (res.success) {
          setRegistrations(prev => prev.filter(r => r.id !== id));
          setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      } catch (err: any) {
        console.error('Failed to delete admission:', err);
        alert(err.message || 'Failed to delete applicant record');
      }
    }
  };

  // KPI Metrics data matching reference strip
  const metricsData: MetricItem[] = [
    {
      id: 'total',
      label: 'Total Applicants',
      value: totalCount,
      sparklineData: [2, 3, 3, 4, 3, 4, totalCount || 4],
      sparklineColor: '#FF790E'
    },
    {
      id: 'pending',
      label: 'Pending Viva',
      value: pendingVivaCount,
      sparklineData: [4, 3, 2, 1, 1, 0, pendingVivaCount || 0],
      sparklineColor: '#F59E0B'
    },
    {
      id: 'scheduled',
      label: 'Viva Scheduled',
      value: scheduledVivaCount,
      sparklineData: [0, 1, 1, 2, 2, 2, scheduledVivaCount || 2],
      sparklineColor: '#3B82F6'
    },
    {
      id: 'selected',
      label: 'Qualified / Selected',
      value: selectedCount,
      sparklineData: [0, 0, 1, 1, 2, 2, selectedCount || 2],
      sparklineColor: '#10B981'
    }
  ];

  // Sub-nav tab items
  const tabItems: TabItem[] = [
    { id: 'ALL', label: 'All', count: totalCount },
    { id: 'PENDING_VIVA', label: 'Pending Viva', count: pendingVivaCount },
    { id: 'VIVA_SCHEDULED', label: 'Viva Scheduled', count: scheduledVivaCount },
    { id: 'SELECTED', label: 'Selected / Workshop', count: selectedCount },
    { id: 'REJECTED', label: 'Rejected', count: rejectedCount }
  ];

  // Check selected applicants' branches for safe cohort distribution
  const selectedRegistrationsList = useMemo(() => {
    return registrations.filter(r => selectedIds.has(r.id));
  }, [registrations, selectedIds]);

  const selectedBranchNames = useMemo(() => {
    const set = new Set<string>();
    selectedRegistrationsList.forEach(r => {
      if (r.branchName) set.add(r.branchName);
    });
    return Array.from(set);
  }, [selectedRegistrationsList]);

  const isCrossBranchSelected = branchFilter === 'ALL' || selectedBranchNames.length > 1;

  // Bulk actions for Floating Bar
  const bulkActions: BulkActionItem[] = [
    {
      id: 'bulk-viva',
      label: 'Schedule Viva',
      icon: <Calendar size={14} />,
      onClick: () => {
        if (isCrossBranchSelected) {
          alert(`Cannot schedule physical viva across multiple branches (${selectedBranchNames.join(', ') || 'All Branches'}). Please filter by a single branch first.`);
          return;
        }
        setIsBulkVivaModalOpen(true);
      },
      disabled: isCrossBranchSelected,
      title: isCrossBranchSelected
        ? `Filter by a specific branch to schedule viva (Selected applicants span: ${selectedBranchNames.join(', ') || 'All Branches'})`
        : 'Schedule physical/online viva for selected candidates'
    },
    {
      id: 'bulk-batch',
      label: 'Assign Batch',
      icon: <Sparkles size={14} />,
      onClick: () => {
        if (isCrossBranchSelected) {
          alert(`Cannot assign workshop cohort across multiple branches (${selectedBranchNames.join(', ') || 'All Branches'}). Please filter by a single branch first.`);
          return;
        }
        setIsWorkshopModalOpen(true);
      },
      disabled: isCrossBranchSelected,
      title: isCrossBranchSelected
        ? `Filter by a specific branch to assign batch (Selected applicants span: ${selectedBranchNames.join(', ') || 'All Branches'})`
        : 'Assign selected candidates to workshop cohort',
      variant: 'primary'
    },
    {
      id: 'bulk-select',
      label: 'Mark Selected',
      icon: <CheckCircle2 size={14} />,
      onClick: () => handleBulkUpdateStatus('SELECTED')
    },
    {
      id: 'bulk-reject',
      label: 'Mark Rejected',
      icon: <XCircle size={14} />,
      onClick: () => handleBulkUpdateStatus('REJECTED'),
      variant: 'danger'
    }
  ];

  return (
    <div className={styles.container}>
      {/* 1. Page Header without count next to title */}
      <PageHeader
        title="Admissions"
        userName="Super Admin"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ minWidth: '190px' }}>
              <CustomSelect
                options={[
                  { value: 'ALL', label: 'All Intake Sessions' },
                  ...sessions.map(s => ({
                    value: s.id,
                    label: `${s.title} (${s.year})${s.isActive ? ' ● Live' : ''}`
                  }))
                ]}
                value={selectedSessionId}
                onChange={(val) => {
                  setSelectedSessionId(val);
                  loadAdmissions(val);
                }}
                variant="toolbar"
              />
            </div>

            <button
              type="button"
              className={styles.btnPrimaryAction}
              onClick={() => setIsNewAdmissionModalOpen(true)}
            >
              <Plus size={15} strokeWidth={2.5} /> Add Applicant
            </button>
          </div>
        }
      />

      {/* 2. KPI Metrics Strip with Trend Sparklines */}
      <MetricsStrip metrics={metricsData} />

      {/* 3. Sub-Nav Tabs with Quick Tools on the Right */}
      <SubNavTabs
        tabs={tabItems}
        activeTab={activeTab}
        onChange={setActiveTab}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              type="button"
              className={styles.btnSecondary}
              onClick={() => navigate('/admissions/form-builder')}
              title="Form Builder"
            >
              <FileText size={13} /> Form Builder
            </button>

            <button 
              type="button"
              className={styles.btnSecondary}
              onClick={() => setIsWorkshopExamModalOpen(true)}
              title="Workshop Final Exam & Merit"
            >
              <Award size={13} /> Merit Engine
            </button>

            <button 
              type="button"
              className={styles.btnSecondary}
              onClick={() => setIsSessionsModalOpen(true)}
              title="Manage Admission Sessions"
            >
              <Layers size={13} /> Sessions
            </button>
          </div>
        }
      />

      {/* 4. Action & Filter Toolbar (Search + Inline Filter Dropdowns + View Switcher + Export) */}
      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search applicants..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExportClick={handleExportCSV}
        extraFilters={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CustomSelect
              options={[
                { value: 'ALL', label: 'All Branches' },
                ...branchOptions.map(b => ({ value: b.name, label: b.name }))
              ]}
              value={branchFilter}
              onChange={setBranchFilter}
              prefix="Branch"
              variant="compact"
            />

            <CustomSelect
              options={[
                { value: 'ALL', label: 'All Subjects' },
                ...subjectOptions.map(s => ({ value: s.name, label: s.name }))
              ]}
              value={subjectFilter}
              onChange={setSubjectFilter}
              prefix="Subject"
              variant="compact"
            />

            <CustomSelect
              options={[
                { value: 'ALL', label: 'All Genders' },
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' }
              ]}
              value={genderFilter}
              onChange={setGenderFilter}
              prefix="Gender"
              variant="compact"
            />

            <CustomSelect
              options={[
                { value: 'NEWEST', label: 'Date (Newest)' },
                { value: 'OLDEST', label: 'Date (Oldest)' },
                { value: 'NAME_AZ', label: 'Name (A-Z)' },
                { value: 'SCORE_HIGH', label: 'Score (Highest)' }
              ]}
              value={sortOrder}
              onChange={(val) => setSortOrder(val as SortOption)}
              prefix="Sort"
              variant="compact"
            />

            {/* Advanced Filter Toggle Button */}
            <button
              type="button"
              className={`${styles.btnFilterToggle} ${showAdvancedFilters ? styles.btnFilterToggleActive : ''}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              title="More Filter Options (Class, Age, Blood Group, Viva Score, District)"
            >
              <Filter size={13} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className={styles.activeFilterBadge}>{activeFilterCount}</span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className={styles.clearFilterBtn}
              >
                Reset All
              </button>
            )}
          </div>
        }
      />

      {/* 4.1 Advanced Filter Options Panel (Academic Class, Age Range, Blood Group, District, Viva Score, Payment) */}
      {showAdvancedFilters && (
        <div className={styles.advancedFiltersPanel}>
          {/* Academic Class */}
          <CustomSelect
            options={[
              { value: 'ALL', label: 'All Classes' },
              { value: 'PRIMARY', label: 'Primary (Class 1 – 5)' },
              { value: 'HIGH_SCHOOL', label: 'High School (Class 6 – 10 / SSC)' },
              { value: 'COLLEGE', label: 'College (HSC / Alim)' },
              { value: 'UNIVERSITY', label: 'University (Honours / Masters)' },
              ...availableClasses.map(c => ({ value: c, label: c }))
            ]}
            value={classFilter}
            onChange={setClassFilter}
            prefix="Class"
            variant="compact"
          />

          {/* Age Range Preset & Manual Min-Max Inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <CustomSelect
                options={[
                  { value: 'ALL', label: 'All Ages' },
                  { value: 'UNDER_8', label: '< 8 Yrs' },
                  { value: '8_12', label: '8 – 12 Yrs' },
                  { value: '13_17', label: '13 – 17 Yrs' },
                  { value: '18_25', label: '18 – 25 Yrs' },
                  { value: '25_PLUS', label: '25+ Yrs' },
                  { value: 'CUSTOM', label: 'Custom Age' }
                ]}
                value={ageRangeFilter}
                onChange={(val) => {
                  setAgeRangeFilter(val);
                  if (val === 'UNDER_8') { setMinAge('0'); setMaxAge('7'); }
                  else if (val === '8_12') { setMinAge('8'); setMaxAge('12'); }
                  else if (val === '13_17') { setMinAge('13'); setMaxAge('17'); }
                  else if (val === '18_25') { setMinAge('18'); setMaxAge('25'); }
                  else if (val === '25_PLUS') { setMinAge('25'); setMaxAge(''); }
                  else if (val === 'ALL') { setMinAge(''); setMaxAge(''); }
                }}
                prefix="Age"
                variant="compact"
              />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 6px',
              borderRadius: '6px',
              border: '1px solid var(--border-light, #CBD5E1)',
              backgroundColor: 'var(--bg-surface, #FFFFFF)',
              height: '32px',
              boxSizing: 'border-box'
            }}>
              <input
                type="number"
                min={1}
                max={99}
                placeholder="Min"
                value={minAge}
                onChange={(e) => {
                  setMinAge(e.target.value);
                  setAgeRangeFilter('CUSTOM');
                }}
                style={{
                  width: '36px',
                  padding: '2px 2px',
                  fontSize: '0.76rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-light, #E2E8F0)',
                  textAlign: 'center',
                  outline: 'none',
                  backgroundColor: 'var(--bg-body, #F8FAFC)',
                  color: 'var(--text-primary, #0F172A)'
                }}
                title="Minimum Age"
              />
              <span style={{ color: 'var(--text-tertiary, #94A3B8)', fontSize: '0.72rem' }}>–</span>
              <input
                type="number"
                min={1}
                max={99}
                placeholder="Max"
                value={maxAge}
                onChange={(e) => {
                  setMaxAge(e.target.value);
                  setAgeRangeFilter('CUSTOM');
                }}
                style={{
                  width: '36px',
                  padding: '2px 2px',
                  fontSize: '0.76rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-light, #E2E8F0)',
                  textAlign: 'center',
                  outline: 'none',
                  backgroundColor: 'var(--bg-body, #F8FAFC)',
                  color: 'var(--text-primary, #0F172A)'
                }}
                title="Maximum Age"
              />
              <span style={{ color: 'var(--text-tertiary, #94A3B8)', fontSize: '0.68rem', fontWeight: 600 }}>yrs</span>
            </div>
          </div>

          {/* Blood Group */}
          <CustomSelect
            options={[
              { value: 'ALL', label: 'All Blood Groups' },
              { value: 'A+', label: 'A+' },
              { value: 'A-', label: 'A-' },
              { value: 'B+', label: 'B+' },
              { value: 'B-', label: 'B-' },
              { value: 'O+', label: 'O+' },
              { value: 'O-', label: 'O-' },
              { value: 'AB+', label: 'AB+' },
              { value: 'AB-', label: 'AB-' }
            ]}
            value={bloodFilter}
            onChange={setBloodFilter}
            prefix="Blood"
            variant="compact"
          />

          {/* District */}
          <CustomSelect
            options={[
              { value: 'ALL', label: 'All Districts' },
              ...availableDistricts.map(d => ({ value: d, label: d }))
            ]}
            value={districtFilter}
            onChange={setDistrictFilter}
            prefix="District"
            variant="compact"
          />

          {/* Viva Score */}
          <CustomSelect
            options={[
              { value: 'ALL', label: 'All Viva Scores' },
              { value: 'SCORE_80_PLUS', label: '80% - 100% (High Merit)' },
              { value: 'SCORE_60_79', label: '60% - 79% (Qualified)' },
              { value: 'SCORE_UNDER_60', label: 'Below 60%' },
              { value: 'NOT_EVALUATED', label: 'Score Pending' }
            ]}
            value={scoreFilter}
            onChange={setScoreFilter}
            prefix="Score"
            variant="compact"
          />

          {/* Payment Status */}
          <CustomSelect
            options={[
              { value: 'ALL', label: 'All Payments' },
              { value: 'PAID', label: 'Fee Paid' },
              { value: 'PENDING', label: 'Fee Pending' }
            ]}
            value={paymentFilter}
            onChange={setPaymentFilter}
            prefix="Payment"
            variant="compact"
          />
        </div>
      )}

      {/* 5. Flat Full-Width Data Table (or Grid View) */}
      {viewMode === 'list' ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxTh}>
                  <CustomCheckbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected && !isAllSelected}
                    onChange={handleToggleSelectAll}
                    ariaLabel="Select all applicants"
                  />
                </th>
                <th className={styles.th}>Applicant</th>
                <th className={styles.th}>Subject & Branch</th>
                <th className={styles.th}>Contact</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Viva / Score</th>
                <th className={styles.th}>Registered</th>
                <th className={`${styles.th} ${styles.actionTd}`}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className={styles.loadingRow}>
                    Loading applicants...
                  </td>
                </tr>
              ) : displayedRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>
                    No applicants found matching your criteria.
                  </td>
                </tr>
              ) : (
                displayedRegistrations.map((reg) => {
                  const isSelected = selectedIds.has(reg.id);
                  const vivaScore = reg.viva?.score ?? (reg.status === 'SELECTED' ? 10 : reg.status === 'VIVA_SCHEDULED' ? 6 : null);

                  // Format valid date
                  const rawDate = reg.appliedDate || (reg as any).createdAt;
                  let formattedDate = 'Dec 08, 2025';
                  if (rawDate && !isNaN(new Date(rawDate).getTime())) {
                    formattedDate = new Date(rawDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric'
                    });
                  }

                  return (
                    <tr
                      key={reg.id}
                      className={`${styles.tr} ${isSelected ? styles.trSelected : ''}`}
                      onClick={() => {
                        setSelectedReg(reg);
                        setIsDrawerOpen(true);
                      }}
                    >
                      <td 
                        className={styles.checkboxTd}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CustomCheckbox
                          checked={isSelected}
                          onChange={(checked) => handleToggleRowSelect(reg.id, checked)}
                          ariaLabel={`Select ${reg.person.fullNameEn}`}
                        />
                      </td>

                      <td className={styles.td}>
                        <div className={styles.personCell}>
                          <UserAvatar
                            name={reg.person.fullNameEn}
                            photoUrl={reg.person.photoUrl}
                            size="sm"
                          />
                          <div className={styles.personMeta}>
                            <span className={styles.personName}>{reg.person.fullNameEn}</span>
                            <span className={styles.regCode}>{reg.registrationNo}</span>
                          </div>
                        </div>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.categoryCell}>
                          <span className={styles.deptTitle}>{reg.subjectName || 'Vocal Music'}</span>
                          <span className={styles.branchTitle}>{reg.branchName || 'Dhaka Paltan Branch'}</span>
                        </div>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.contactCell}>
                          <span className={styles.phoneText}>{reg.person.phone}</span>
                          {reg.person.email && (
                            <span className={styles.emailText}>{reg.person.email}</span>
                          )}
                        </div>
                      </td>

                      <td className={styles.td}>
                        <StatusBadge status={reg.status} />
                      </td>

                      <td className={styles.td}>
                        <ScoreMeter score={vivaScore} maxScore={10} />
                      </td>

                      <td className={`${styles.td} ${styles.dateCell}`}>
                        {formattedDate}
                      </td>

                      <td 
                        className={`${styles.td} ${styles.actionTd}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TableActionMenu
                          items={[
                            {
                              label: 'View Profile',
                              onClick: () => {
                                setSelectedReg(reg);
                                setIsDrawerOpen(true);
                              }
                            },
                            ...(reg.status === 'SELECTED' || reg.status === 'VIVA_SCHEDULED' ? [{
                              label: 'Assign to Workshop',
                              onClick: () => {
                                setAssignWorkshopModalReg(reg);
                                setIsAssignWorkshopOpen(true);
                              }
                            }] : []),
                            {
                              label: 'Schedule Viva',
                              onClick: () => {
                                setVivaModalReg(reg);
                                setIsVivaModalOpen(true);
                              }
                            },
                            {
                              label: 'Evaluate Viva',
                              onClick: () => {
                                setEvalModalReg(reg);
                                setIsEvalModalOpen(true);
                              }
                            },
                            {
                              label: 'Edit Applicant',
                              onClick: () => {
                                setEditModalReg(reg);
                                setIsEditModalOpen(true);
                              }
                            }
                          ]}
                          onDelete={() => handleDeleteRegistration(reg.id, reg.person.fullNameEn)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Minimal Grid View when Grid Icon is selected */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          padding: '8px 0 24px 0'
        }}>
          {displayedRegistrations.map(reg => {
            const isSelected = selectedIds.has(reg.id);
            const vivaScore = reg.viva?.score ?? (reg.status === 'SELECTED' ? 10 : reg.status === 'VIVA_SCHEDULED' ? 6 : null);

            return (
              <div 
                key={reg.id}
                onClick={() => {
                  setSelectedReg(reg);
                  setIsDrawerOpen(true);
                }}
                style={{
                  border: `1px solid ${isSelected ? 'var(--brand-orange)' : 'var(--border-light, #E2E8F0)'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: 'var(--bg-surface, #FFFFFF)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div onClick={(e) => e.stopPropagation()}>
                      <CustomCheckbox
                        checked={isSelected}
                        onChange={(c) => handleToggleRowSelect(reg.id, c)}
                      />
                    </div>
                    <UserAvatar name={reg.person.fullNameEn} photoUrl={reg.person.photoUrl} size="sm" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{reg.person.fullNameEn}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{reg.registrationNo}</div>
                    </div>
                  </div>
                  <StatusBadge status={reg.status} />
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <div><strong>{reg.departmentName || 'Music'}</strong> • {reg.branchName || 'Dhaka Central'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Phone size={12} /> {reg.person.phone}
                  </div>
                  {reg.person.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <Mail size={12} /> {reg.person.email}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-light, #F1F5F9)' }}>
                  <ScoreMeter score={vivaScore} maxScore={10} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    {reg.appliedDate || 'Dec 08, 2025'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className={styles.paginationFooter}>
        <div className={styles.paginationInfo}>
          Showing <strong>{totalFiltered === 0 ? 0 : startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalFiltered}</strong> applicants
        </div>

        <div className={styles.paginationControls}>
          <CustomSelect
            options={[
              { value: '10', label: '10 per page' },
              { value: '20', label: '20 per page' },
              { value: '50', label: '50 per page' },
              { value: 'ALL', label: 'Show All' }
            ]}
            value={String(pageSize)}
            onChange={(val) => setPageSize(val === 'ALL' ? 'ALL' : Number(val))}
            variant="compact"
          />

          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className={styles.pageBtn}
          >
            Previous
          </button>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className={styles.pageBtn}
          >
            Next
          </button>
        </div>
      </div>

      {/* 6. Sleek Floating Action Bar when 1+ applicants are selected */}
      <FloatingActionBar
        selectedCount={selectedIds.size}
        onDiscard={() => setSelectedIds(new Set())}
        actions={bulkActions}
      />

      {/* Drawers and Modals */}
      <ApplicantProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        registration={selectedReg}
        onScheduleViva={(reg) => {
          setVivaModalReg(reg);
          setIsVivaModalOpen(true);
        }}
        onUpdateStatus={handleUpdateStatus}
        onEdit={(reg) => {
          setEditModalReg(reg);
          setIsEditModalOpen(true);
        }}
        onEvaluateViva={(reg) => {
          setEvalModalReg(reg);
          setIsEvalModalOpen(true);
        }}
      />

      <ScheduleVivaModal
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
        registration={vivaModalReg}
        onConfirmSchedule={async (regId, vivaData) => {
          await admissionService.scheduleViva(regId, {
            vivaDate: vivaData.date,
            vivaTime: vivaData.time,
            room: vivaData.locationOrLink,
            examinerPanel: vivaData.examiner
          });
          await loadAdmissions();
          setIsVivaModalOpen(false);
        }}
      />

      <BulkScheduleVivaModal
        isOpen={isBulkVivaModalOpen}
        onClose={() => setIsBulkVivaModalOpen(false)}
        selectedRegistrations={registrations.filter(r => selectedIds.has(r.id))}
        onConfirmBulkSchedule={async (vivaData) => {
          const regIds = Array.from(selectedIds);
          await admissionService.bulkScheduleViva(regIds, {
            vivaDate: vivaData.date,
            vivaTime: vivaData.time,
            room: vivaData.locationOrLink,
            examinerPanel: vivaData.examiner
          });
          await loadAdmissions();
          setSelectedIds(new Set());
          setIsBulkVivaModalOpen(false);
        }}
      />

      <WorkshopDistributionModal
        isOpen={isWorkshopModalOpen}
        onClose={() => setIsWorkshopModalOpen(false)}
        selectedRegistrations={registrations.filter(r => selectedIds.has(r.id))}
        onSuccess={async () => {
          await loadAdmissions();
          setSelectedIds(new Set());
          setIsWorkshopModalOpen(false);
        }}
      />

      <PrintableVivaSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        registrations={filteredRegistrations}
        sessionTitle={sessions.find(s => s.id === selectedSessionId)?.title || 'All Sessions'}
      />

      <NewAdmissionModal
        isOpen={isNewAdmissionModalOpen}
        onClose={() => setIsNewAdmissionModalOpen(false)}
        onAddAdmission={async (newRegData) => {
          await admissionService.createAdmission(newRegData);
          await loadAdmissions();
          setIsNewAdmissionModalOpen(false);
        }}
        sessions={sessions}
      />

      {editModalReg && (
        <EditAdmissionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditModalReg(null);
          }}
          registration={editModalReg}
          onUpdateRegistration={async (updatedReg) => {
            await admissionService.updateAdmission(updatedReg.id, updatedReg);
            await loadAdmissions();
            setIsEditModalOpen(false);
          }}
        />
      )}

      <ManageSessionsModal
        isOpen={isSessionsModalOpen}
        onClose={() => setIsSessionsModalOpen(false)}
        sessions={sessions}
        onRefreshSessions={loadSessions}
        onToggleActive={async (sessId) => {
          await admissionService.toggleSessionActive(sessId);
          await loadSessions();
          await loadAdmissions();
        }}
        onCreateSession={async (data) => {
          await admissionService.createSession(data);
          await loadSessions();
          await loadAdmissions();
        }}
        onUpdateSession={async (id, data) => {
          await admissionService.updateSession(id, data);
          await loadSessions();
          await loadAdmissions();
        }}
        onDeleteSession={async (id) => {
          await admissionService.deleteSession(id);
          await loadSessions();
          await loadAdmissions('ALL');
        }}
      />

      {evalModalReg && (
        <EvaluateVivaModal
          isOpen={isEvalModalOpen}
          onClose={() => {
            setIsEvalModalOpen(false);
            setEvalModalReg(null);
          }}
          registration={evalModalReg}
          onSuccess={async () => {
            await loadAdmissions();
            setIsEvalModalOpen(false);
          }}
        />
      )}

      <WorkshopExamModal
        isOpen={isWorkshopExamModalOpen}
        onClose={() => setIsWorkshopExamModalOpen(false)}
        currentSessionId={selectedSessionId !== 'ALL' ? selectedSessionId : sessions.find(s => s.isActive)?.id}
        onRefreshAdmissions={loadAdmissions}
      />

      <AssignWorkshopModal
        isOpen={isAssignWorkshopOpen}
        onClose={() => {
          setIsAssignWorkshopOpen(false);
          setAssignWorkshopModalReg(null);
        }}
        applicant={assignWorkshopModalReg}
        onSuccess={loadAdmissions}
      />
    </div>
  );
}
