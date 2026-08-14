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
              
              {/* Accurate Reference Sparkline */}
              <div style={{margin: '14px 0', height: '60px', display: 'flex', alignItems: 'center', width: '100%'}}>
                <svg width="100%" height="60" viewBox="0 0 220 60" fill="none" style={{overflow: 'visible'}}>
                  {/* Subtle horizontal reference line */}
                  <line x1="0" y1="32" x2="220" y2="32" stroke="#F1F5F9" strokeWidth="1.5" />
                  
                  {/* Main realistic energetic sparkline with big rounded hill & sharp rise */}
                  <path 
                    d="M 4,38 C 14,30 20,22 28,24 C 36,26 42,40 50,36 C 56,32 62,28 70,30 C 76,32 82,42 88,44 C 94,46 98,34 102,24 C 108,12 114,6 122,6 C 130,6 134,24 140,30 C 146,36 150,28 156,32 C 160,36 162,44 166,44 C 170,44 174,14 178,6" 
                    stroke="#14B8A6" 
                    strokeWidth="2.4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  
                  {/* Faded sawtooth zig-zag tail on the right */}
                  <path 
                    d="M 178,6 L 186,28 L 194,12 L 204,24 L 212,14 L 218,20" 
                    stroke="#14B8A6" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeOpacity="0.3"
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
