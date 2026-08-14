import { Users, Building2, Search, ArrowRight, TrendingUp } from 'lucide-react';
import styles from '../App.module.css';

export default function Dashboard() {
  return (
    <>
      {/* Top 4-Card Row matching Reference Grid Layout */}
      <div className={styles.fourCardsGrid}>
        
        {/* Card 1: Total Students (Team Payments in ref) */}
        <div className={styles.dashCardDashed}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardCategoryTitle}>Total Students</span>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px'}}>
                <span className={styles.dateBadgeIcon}>📅</span>
                <span style={{fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600}}>07 Aug intake</span>
              </div>
            </div>
            <div className={styles.bellIconBadge}>
              <Users size={16} />
            </div>
          </div>

          <div style={{marginTop: 'auto'}}>
            <div className={styles.avatarGroup}>
              <img src="https://i.pravatar.cc/150?img=33" className={styles.avatarSmall} alt="Student" />
              <img src="https://i.pravatar.cc/150?img=12" className={styles.avatarSmall} alt="Student" />
              <img src="https://i.pravatar.cc/150?img=5" className={styles.avatarSmall} alt="Student" />
              <div className={styles.avatarSmall}>25+</div>
            </div>
          </div>
        </div>

        {/* Card 2: Active Branches (Savings in ref) */}
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
              <div className={styles.statValue}>04</div>
              <p style={{fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'}}>
                <TrendingUp size={13} /> +1 <span style={{color: 'var(--text-tertiary)', fontWeight: 400}}>this year</span>
              </p>
            </div>
            <button className={styles.pillActionBtn} title="View Branches">
              <ArrowRight size={14} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Card 3: Pending Admissions (Income Statistics in ref) */}
        <div className={styles.dashCardDashed}>
          <div className={styles.cardHeader}>
            <span className={styles.cardCategoryTitle}>Admissions</span>
            <span className={styles.growthPillBadge}>+8%</span>
          </div>
          
          <div style={{marginTop: 'auto', display: 'flex', alignItems: 'flex-end', gap: '8px'}}>
            <div className={styles.chartYAxis}>
              <span>$2m</span>
              <span>$1m</span>
              <span>$0m</span>
            </div>
            <div className={styles.refBarGroup}>
              <div className={styles.barCol}>
                <div className={`${styles.barRef} ${styles.barRef1}`}></div>
                <span className={styles.barPercent}>15%</span>
              </div>
              <div className={styles.barCol}>
                <div className={`${styles.barRef} ${styles.barRef2}`}></div>
                <span className={styles.barPercent}>21%</span>
              </div>
              <div className={styles.barCol}>
                <div className={`${styles.barRef} ${styles.barRef3}`}></div>
                <span className={styles.barPercent}>32%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Hero Plan / Admissions Open (Teal Plan Card in ref) */}
        <div className={styles.dashCardHeroWrap}>
          <div className={styles.dashCardHero}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div>
                <span className={styles.heroAmount}>2026</span>
                <span className={styles.heroSubText}>Admissions</span>
              </div>
              <span className={styles.heroStarIcon}>✦</span>
            </div>
            <p className={styles.heroCallout}>Review Pending Applications!</p>
          </div>
          <div className={styles.heroActionsRow}>
            <button className={styles.heroBtnDetails}>Details</button>
            <button className={styles.heroBtnUpgrade}>Review</button>
          </div>
        </div>

      </div>

      {/* Row 2: Recently Registrations (2 Columns) */}
      <div className={styles.recentSectionWrap}>
        <h3 className={styles.recentPaymentsHeader}>Recently Registrations</h3>
        <div className={styles.recentPaymentsGrid}>
          
          <div className={styles.horizontalCard}>
            <div className={styles.recentUser}>
              <img src="https://i.pravatar.cc/150?img=33" className={styles.recentAvatar} alt="Rahim" />
              <div>
                <div style={{fontWeight: 700, fontSize: '0.9rem'}}>Rahim Uddin</div>
                <div style={{color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 500}}>Aug 15, 2026</div>
              </div>
            </div>
            <div style={{fontWeight: 800, fontSize: '0.95rem'}}>Dhaka Central</div>
            <div className={`${styles.statusPill} ${styles.statusDone}`}>Done</div>
            <div style={{color: 'var(--text-tertiary)', letterSpacing: '2px', cursor: 'pointer'}}>•••</div>
          </div>

          <div className={styles.horizontalCard}>
            <div className={styles.recentUser}>
              <img src="https://i.pravatar.cc/150?img=11" className={styles.recentAvatar} alt="Karim" />
              <div>
                <div style={{fontWeight: 700, fontSize: '0.9rem'}}>Karim Hasan</div>
                <div style={{color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 500}}>Aug 14, 2026</div>
              </div>
            </div>
            <div style={{fontWeight: 800, fontSize: '0.95rem'}}>Mirpur Branch</div>
            <div className={`${styles.statusPill} ${styles.statusPending}`}>Pending</div>
            <div style={{color: 'var(--text-tertiary)', letterSpacing: '2px', cursor: 'pointer'}}>•••</div>
          </div>

        </div>
      </div>

      {/* Table Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Activities</h2>
          <div className={styles.searchBox}>
            <Search size={16} /> <span>Search</span>
          </div>
        </div>
        
        <div className={styles.table}>
          {/* Header */}
          <div className={styles.tableHeader}>
            <div></div>
            <div>Applicant Name</div>
            <div>Branch</div>
            <div>Status</div>
            <div>Date</div>
            <div>Role</div>
            <div></div>
          </div>
          
          {/* Row 1 */}
          <div className={styles.tableRow}>
            <div><div className={styles.checkbox}></div></div>
            <div className={styles.userCell}>
              <img src="https://i.pravatar.cc/150?img=33" className={styles.userAvatar} alt="Rahim" />
              Rahim Uddin
            </div>
            <div style={{color: 'var(--text-secondary)'}}>Dhaka Central</div>
            <div><span className={`${styles.statusPill} ${styles.statusPending}`}>Viva Pending</span></div>
            <div style={{color: 'var(--text-secondary)'}}>Aug 15th, 2026</div>
            <div className={styles.amountText}>Applicant</div>
            <div><button className={styles.btnDetails}>Details</button></div>
          </div>
          
          {/* Row 2 */}
          <div className={styles.tableRow}>
            <div><div className={styles.checkbox}></div></div>
            <div className={styles.userCell}>
              <img src="https://i.pravatar.cc/150?img=11" className={styles.userAvatar} alt="Karim" />
              Karim Hasan
            </div>
            <div style={{color: 'var(--text-secondary)'}}>Mirpur Branch</div>
            <div><span className={`${styles.statusPill} ${styles.statusDone}`}>Selected</span></div>
            <div style={{color: 'var(--text-secondary)'}}>Aug 14th, 2026</div>
            <div className={styles.amountText}>Student</div>
            <div><button className={styles.btnDetails}>Details</button></div>
          </div>

          {/* Row 3 */}
          <div className={styles.tableRow}>
            <div><div className={styles.checkbox}></div></div>
            <div className={styles.userCell}>
              <img src="https://i.pravatar.cc/150?img=5" className={styles.userAvatar} alt="Sadia" />
              Sadia Amin
            </div>
            <div style={{color: 'var(--text-secondary)'}}>Uttara Branch</div>
            <div><span className={`${styles.statusPill} ${styles.statusRejected}`}>Rejected</span></div>
            <div style={{color: 'var(--text-secondary)'}}>Aug 12th, 2026</div>
            <div className={styles.amountText}>Applicant</div>
            <div><button className={styles.btnDetails}>Details</button></div>
          </div>
        </div>
      </section>
    </>
  );
}
