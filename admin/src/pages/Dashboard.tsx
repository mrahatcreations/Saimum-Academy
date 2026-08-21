import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, ArrowRight, TrendingUp } from 'lucide-react';
import styles from '../App.module.css';
import { academicService, type StudentItem, type BranchItem } from '../services/academicService';
import { admissionService } from '../services/admissionService';
import type { Registration } from '../types/admission';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UserAvatar } from '../components/ui/UserAvatar';
import { SearchInput } from '../components/ui/SearchInput';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';

export default function Dashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [activeSessionTitle, setActiveSessionTitle] = useState('2026 Intake');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [studentsRes, branchesRes, admissionsRes, sessionsRes] = await Promise.all([
        academicService.getStudents().catch(() => ({ success: false, data: [] })),
        academicService.getBranches().catch(() => ({ success: false, data: [] })),
        admissionService.getAdmissions().catch(() => ({ success: false, data: [] })),
        admissionService.getSessions().catch(() => ({ success: false, data: [] }))
      ]);

      if (studentsRes.success) setStudents(studentsRes.data);
      if (branchesRes.success) setBranches(branchesRes.data);
      if (admissionsRes.success) setRegistrations(admissionsRes.data);
      if (sessionsRes.success) {
        const active = sessionsRes.data.find(s => s.isActive);
        if (active) setActiveSessionTitle(active.title);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived counts
  const totalStudentsCount = students.length;
  const activeBranchesCount = branches.filter(b => b.status === 'ACTIVE').length;
  const pendingVivaCount = registrations.filter(r => r.status === 'PENDING_VIVA').length;
  const selectedCount = registrations.filter(r => r.status === 'SELECTED').length;
  const scheduledVivaCount = registrations.filter(r => r.status === 'VIVA_SCHEDULED').length;
  const totalRegistrations = registrations.length;

  const recentRegistrations = registrations.slice(0, 5);

  const filteredRegistrations = registrations.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.person.fullNameEn.toLowerCase().includes(q) ||
      r.registrationNo.toLowerCase().includes(q) ||
      r.branchName.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* 1. Standard Page Header */}
      <PageHeader title="Dashboard" />

      {/* Top 4-Card Row matching Reference Grid Layout */}
      <div className={styles.fourCardsGrid}>
        
        {/* Card 1: Total Students */}
        <div className={styles.dashCardDashed}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardCategoryTitle}>Total Students</span>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px'}}>
                <span className={styles.dateBadgeIcon}>📅</span>
                <span style={{fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600}}>Enrolled Active</span>
              </div>
            </div>
            <div className={styles.bellIconBadge}>
              <Users size={16} />
            </div>
          </div>

          <div style={{marginTop: 'auto'}}>
            <div className={styles.avatarGroup}>
              {students.slice(0, 3).map((s, idx) => (
                <div 
                  key={s.id || idx} 
                  className={styles.avatarSmall} 
                  style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-orange-alpha)', color: 'var(--brand-orange)', fontSize: '11px', fontWeight: 700}}
                >
                  {s.fullName ? s.fullName.charAt(0) : 'S'}
                </div>
              ))}
              <div className={styles.avatarSmall} style={{fontWeight: 700}}>
                {totalStudentsCount > 0 ? `${totalStudentsCount}` : '0'}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Active Branches */}
        <div className={styles.dashCardDashed}>
          <div className={styles.cardHeader}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <div className={styles.pieIconBadge}>
                <Building2 size={16} />
              </div>
              <span className={styles.cardCategoryTitle}>Active Branches</span>
            </div>
          </div>
          
          {/* Reference Sparkline */}
          <div className={styles.sparklineContainer}>
            <svg width="100%" height="48" viewBox="0 0 200 48" fill="none" style={{overflow: 'visible'}}>
              <path 
                d="M 4,32 C 14,24 20,18 28,20 C 36,22 42,34 50,30 C 56,26 62,22 70,24 C 76,26 82,36 88,38 C 94,40 98,28 102,18 C 108,8 114,4 122,4 C 130,4 134,20 140,24 C 146,28 150,22 156,26 C 160,30 162,38 166,38 C 170,38 174,10 178,4" 
                stroke="#14B8A6" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M 178,4 L 184,22 L 190,10 L 196,20 L 200,14" 
                stroke="#14B8A6" 
                strokeWidth="1.8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeOpacity="0.35"
              />
            </svg>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto'}}>
            <div>
              <div className={styles.statValue}>{String(activeBranchesCount).padStart(2, '0')}</div>
              <p style={{fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'}}>
                <TrendingUp size={13} /> {branches.length} <span style={{color: 'var(--text-tertiary)', fontWeight: 400}}>total locations</span>
              </p>
            </div>
            <button 
              className={styles.pillActionBtn} 
              onClick={() => navigate('/branches')}
              title="View Branches"
            >
              <ArrowRight size={14} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Card 3: Admissions Pipeline Distribution */}
        <div className={styles.dashCardDashed}>
          <div className={styles.cardHeader}>
            <span className={styles.cardCategoryTitle}>Admissions</span>
            <span className={styles.growthPillBadge}>{totalRegistrations} total</span>
          </div>
          
          <div style={{marginTop: 'auto', display: 'flex', alignItems: 'flex-end', gap: '8px'}}>
            <div className={styles.chartYAxis}>
              <span>{Math.max(pendingVivaCount, scheduledVivaCount, selectedCount, 10)}</span>
              <span>{Math.round(Math.max(pendingVivaCount, scheduledVivaCount, selectedCount, 10) / 2)}</span>
              <span>0</span>
            </div>
            <div className={styles.refBarGroup}>
              <div className={styles.barCol} title={`Pending Viva: ${pendingVivaCount}`}>
                <div className={`${styles.barRef} ${styles.barRef1}`}></div>
                <span className={styles.barPercent}>{pendingVivaCount}</span>
              </div>
              <div className={styles.barCol} title={`Viva Scheduled: ${scheduledVivaCount}`}>
                <div className={`${styles.barRef} ${styles.barRef2}`}></div>
                <span className={styles.barPercent}>{scheduledVivaCount}</span>
              </div>
              <div className={styles.barCol} title={`Selected: ${selectedCount}`}>
                <div className={`${styles.barRef} ${styles.barRef3}`}></div>
                <span className={styles.barPercent}>{selectedCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Hero Active Intake */}
        <div className={styles.dashCardHeroWrap}>
          <div className={styles.dashCardHero}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div>
                <span className={styles.heroAmount}>2026</span>
                <span className={styles.heroSubText}>Admissions</span>
              </div>
              <span className={styles.heroStarIcon}>✦</span>
            </div>
            <p className={styles.heroCallout}>{activeSessionTitle}</p>
          </div>
          <div className={styles.heroActionsRow}>
            <button className={styles.heroBtnDetails} onClick={() => navigate('/admissions/sessions')}>Sessions</button>
            <button className={styles.heroBtnUpgrade} onClick={() => navigate('/admissions')}>Review</button>
          </div>
        </div>

      </div>

      {/* Row 2: Recently Registered Applicants */}
      <div className={styles.recentSectionWrap}>
        <h3 className={styles.recentPaymentsHeader}>Recent Registrations</h3>
        <div className={styles.recentPaymentsGrid}>
          
          {recentRegistrations.slice(0, 2).map(reg => (
            <div className={styles.horizontalCard} key={reg.id} onClick={() => navigate('/admissions')}>
              <div className={styles.recentUser}>
                <UserAvatar 
                  name={reg.person.fullNameEn} 
                  photoUrl={reg.person.photoUrl} 
                  size="sm" 
                  shape="circle" 
                />
                <div>
                  <div className={styles.recentUserName}>{reg.person.fullNameEn}</div>
                  <div className={styles.recentUserDate}>{reg.appliedDate} • {reg.registrationNo}</div>
                </div>
              </div>
              <div className={styles.recentValue}>{reg.branchName}</div>
              <div className={styles.recentActions}>
                <StatusBadge status={reg.status} />
              </div>
            </div>
          ))}

          {recentRegistrations.length === 0 && (
            <div style={{padding: '16px', color: 'var(--text-tertiary)', fontSize: '0.85rem'}}>
              No applicant registrations yet.
            </div>
          )}

        </div>
      </div>

      {/* Table Section: Recent Activities */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Recent Applicant Activities</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px'}}>
              Live intake submissions and status changes from candidate applications.
            </p>
          </div>
          <SearchInput 
            value={search} 
            onChange={setSearch} 
            placeholder="Search activity..." 
          />
        </div>
        
        <div className={styles.tableScrollWrapper}>
          <div className={styles.table}>
            {/* Header */}
            <div className={styles.tableHeader} style={{gridTemplateColumns: '1.8fr 1.2fr 1fr 1fr 1fr 0.5fr'}}>
              <div>Applicant Name</div>
              <div>Branch</div>
              <div>Registration ID</div>
              <div>Status</div>
              <div>Applied Date</div>
              <div style={{textAlign: 'right'}}>Action</div>
            </div>
            
            {isLoading ? (
              <div style={{padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)'}}>
                Loading recent activities...
              </div>
            ) : filteredRegistrations.slice(0, 6).map(reg => (
              <div className={styles.tableRow} key={reg.id} style={{gridTemplateColumns: '1.8fr 1.2fr 1fr 1fr 1fr 0.5fr'}}>
                <div className={styles.userCell}>
                  <UserAvatar 
                    name={reg.person.fullNameEn} 
                    photoUrl={reg.person.photoUrl} 
                    size="sm" 
                    shape="circle" 
                  />
                  <div>
                    <span style={{fontWeight: 700, display: 'block'}}>{reg.person.fullNameEn}</span>
                    <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>{reg.person.phone}</span>
                  </div>
                </div>
                <div style={{color: 'var(--text-secondary)'}}>{reg.branchName}</div>
                <div style={{color: 'var(--text-secondary)', fontWeight: 600}}>{reg.registrationNo}</div>
                <div className={styles.statusCell}>
                  <StatusBadge status={reg.status} />
                </div>
                <div style={{color: 'var(--text-secondary)'}}>{reg.appliedDate}</div>
                <div style={{textAlign: 'right'}}>
                  <Button 
                    variant="secondary"
                    onClick={() => navigate('/admissions')}
                    style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}

            {!isLoading && filteredRegistrations.length === 0 && (
              <div style={{padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)'}}>
                No recent activity records.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
