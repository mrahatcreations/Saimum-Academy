import { Users, Building2, Search, ArrowRight, TrendingUp } from 'lucide-react';
import styles from '../App.module.css';

export default function Dashboard() {
  return (
    <>
      {/* Dashboard Grid */}
      <div className={styles.topGrid}>
        
        {/* Left Section: 3 Cards + 2 Horizontal Pills */}
        <div className={styles.leftSection}>
          
          <div className={styles.threeCardsRow}>
            {/* Card 1: Total Students */}
            <div className={styles.dashCardDashed}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Total<br/>Students</span>
                <span className={styles.cardIcon}><Users size={18} /></span>
              </div>
              <div style={{marginTop: 'auto'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}>
                  <div style={{background: '#3B82F6', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800}}>NEW</div>
                  <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600}}>
                    August 2026 Batch
                  </p>
                </div>
                <div className={styles.avatarGroup}>
                  <img src="https://i.pravatar.cc/150?img=33" className={styles.avatarSmall} alt="Student" />
                  <img src="https://i.pravatar.cc/150?img=12" className={styles.avatarSmall} alt="Student" />
                  <img src="https://i.pravatar.cc/150?img=5" className={styles.avatarSmall} alt="Student" />
                  <div className={styles.avatarSmall}>1.2k+</div>
                </div>
              </div>
            </div>

            {/* Card 2: Active Branches */}
            <div className={styles.dashCardDashed}>
              <div className={styles.cardHeader}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div className={styles.metricIconWrap}>
                    <Building2 size={18} />
                  </div>
                  <span className={styles.cardTitle}>Active Branches</span>
                </div>
                <button className={styles.pillActionBtn} title="View Branches">
                  <ArrowRight size={14} strokeWidth={2.2} />
                </button>
              </div>
              
              {/* Ultra Clean Modern Fluid Sparkline - Tall Proportions */}
              <div className={styles.sparklineContainer}>
                <svg width="100%" height="84" viewBox="0 0 240 84" fill="none" preserveAspectRatio="none" style={{overflow: 'visible'}}>
                  <defs>
                    <linearGradient id="branchSparkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Subtle soft gradient area fill */}
                  <path 
                    d="M 0,60 C 25,60 40,40 60,44 C 80,48 95,70 115,70 C 135,70 145,24 165,18 C 185,14 195,44 210,40 C 225,36 235,12 240,10 L 240,84 L 0,84 Z" 
                    fill="url(#branchSparkGradient)" 
                  />
                  
                  {/* Smooth confident wave curve */}
                  <path 
                    d="M 0,60 C 25,60 40,40 60,44 C 80,48 95,70 115,70 C 135,70 145,24 165,18 C 185,14 195,44 210,40 C 225,36 235,12 240,10" 
                    stroke="#10B981" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  
                  {/* Endpoint indicator */}
                  <circle cx="240" cy="10" r="4.5" fill="#10B981" />
                </svg>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto'}}>
                <div>
                  <div className={styles.statValue}>04</div>
                  <div className={styles.growthBadgePositive}>
                    <TrendingUp size={13} strokeWidth={2.5} />
                    <span>+1 this year</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Pending Admissions */}
            <div className={styles.dashCardDashed}>
              <div>
                <div className={styles.cardTitle} style={{marginBottom: '8px'}}>Pending Admissions</div>
                <div className={styles.badgeWarning}>
                  Action Required
                </div>
              </div>
              
              <div style={{marginTop: 'auto'}}>
                <div className={styles.mockBarChart}>
                  <div className={`${styles.bar} ${styles.bar1}`} title="Dhaka: 40%">
                    <span>Dhaka</span>
                  </div>
                  <div className={`${styles.bar} ${styles.bar2}`} title="Mirpur: 70%">
                    <span>Mirpur</span>
                  </div>
                  <div className={`${styles.bar} ${styles.bar3}`} title="Uttara: 100%">
                    <span>Uttara</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Registrations */}
          <div>
            <h3 className={styles.recentPaymentsHeader}>Recent Registrations</h3>
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
                <div className={`${styles.statusPill} ${styles.statusPending}`}>Pending</div>
                <div style={{color: 'var(--text-tertiary)', letterSpacing: '2px'}}>•••</div>
              </div>

              <div className={styles.horizontalCard}>
                <div className={styles.recentUser}>
                  <img src="https://i.pravatar.cc/150?img=11" className={styles.recentAvatar} alt="Karim" />
                  <div>
                    <div style={{fontWeight: 700, fontSize: '0.9rem'}}>Karim Hasan</div>
                    <div style={{color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 500}}>Aug 14, 2026</div>
                  </div>
                </div>
                <div style={{fontWeight: 800, fontSize: '0.95rem'}}>Mirpur</div>
                <div className={`${styles.statusPill} ${styles.statusDone}`}>Selected</div>
                <div style={{color: 'var(--text-tertiary)', letterSpacing: '2px'}}>•••</div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Section: Gradient Card */}
        <div>
          <div className={styles.dashCardPrimary}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle} style={{fontSize: '2.5rem', lineHeight: 1.1}}>
                2026<br/>
                <span style={{fontSize: '0.9rem', fontWeight: 500, opacity: 0.9}}>Admissions Open</span>
              </span>
            </div>
            <div>
              <h3 style={{fontSize: '1.4rem', lineHeight: 1.3}}>Review Pending<br/>Applications!</h3>
              <div className={styles.cardActions}>
                <button className={styles.btnWhite}>View List</button>
                <button className={styles.btnDark}>Settings</button>
              </div>
            </div>
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
