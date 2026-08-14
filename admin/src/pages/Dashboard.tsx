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
                  <div style={{width: 38, height: 38, borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', flexShrink: 0}}>
                    <Building2 size={20} />
                  </div>
                  <span className={styles.cardTitle} style={{fontSize: '1.15rem'}}>Active Branches</span>
                </div>
              </div>
              
              {/* Detailed High-Energy Stock/Activity Sparkline */}
              <div style={{margin: '18px 0', height: '70px', display: 'flex', alignItems: 'center', width: '100%'}}>
                <svg width="100%" height="70" viewBox="0 0 240 70" fill="none" preserveAspectRatio="none" style={{overflow: 'visible'}}>
                  {/* Reference baseline */}
                  <line x1="0" y1="42" x2="240" y2="42" stroke="#F1F5F9" strokeWidth="1.5" />
                  
                  {/* Dynamic smooth multi-fluctuation curve */}
                  <path 
                    d="M 4,52 C 12,42 18,30 26,32 C 34,34 38,48 44,50 C 50,52 54,38 62,38 C 70,38 74,48 80,48 C 86,48 90,56 96,56 C 104,56 108,16 118,14 C 128,12 132,36 138,38 C 144,40 148,30 154,32 C 160,34 162,54 170,54 C 176,54 178,12 184,10" 
                    stroke="#14B8A6" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  
                  {/* Faded rippling tail on the right */}
                  <path 
                    d="M 184,10 L 194,30 L 204,16 L 216,28 L 226,18 L 236,24" 
                    stroke="#14B8A6" 
                    strokeWidth="2.2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeOpacity="0.35"
                  />
                </svg>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto'}}>
                <div>
                  <h2 className={styles.statValue} style={{fontSize: '2rem', lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '6px'}}>04</h2>
                  <p style={{fontSize: '0.85rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px'}}>
                    <TrendingUp size={15} /> +1 <span style={{color: 'var(--text-tertiary)', fontWeight: 500}}>this year</span>
                  </p>
                </div>
                <button className={styles.pillActionBtn} title="View Branches">
                  <ArrowRight size={18} strokeWidth={2.2} />
                </button>
              </div>
            </div>

            {/* Card 3: Pending Admissions */}
            <div className={styles.dashCardDashed}>
              <div>
                <div className={styles.cardTitle} style={{marginBottom: '8px'}}>Pending Admissions</div>
                <div style={{display: 'inline-flex', alignItems: 'center', background: '#FEF3C7', color: '#D97706', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', fontWeight: 700}}>
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
                  <img src="https://i.pravatar.cc/150?img=33" className={styles.recentAvatar} />
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
                  <img src="https://i.pravatar.cc/150?img=11" className={styles.recentAvatar} />
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
            <div><span className={`${styles.statusPill} ${styles.statusPending}`} style={{backgroundColor: '#FEE2E2', color: '#EF4444'}}>Rejected</span></div>
            <div style={{color: 'var(--text-secondary)'}}>Aug 12th, 2026</div>
            <div className={styles.amountText}>Applicant</div>
            <div><button className={styles.btnDetails}>Details</button></div>
          </div>
        </div>
      </section>
    </>
  );
}
