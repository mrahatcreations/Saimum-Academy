import React from 'react';
import { Users, Building2, Search } from 'lucide-react';
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
              <div>
                <div style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px'}}>
                  <div style={{background: '#3B82F6', color: 'white', fontSize: '0.6rem', padding: '2px 4px', borderRadius: '4px'}}>NEW</div>
                  <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600}}>
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
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <div style={{width: 28, height: 28, borderRadius: '50%', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1'}}>
                    <Building2 size={16} />
                  </div>
                  <span className={styles.cardTitle}>Active Branches</span>
                </div>
              </div>
              
              {/* SVG Mock line chart */}
              <div style={{margin: '12px 0'}}>
                <svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none">
                  <path d="M0 30 Q 20 15, 40 25 T 80 15 T 120 25 T 160 5 T 200 15" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                <div>
                  <h2 className={styles.statValue}>04</h2>
                  <p style={{fontSize: '0.75rem', color: '#10B981', fontWeight: 600}}>↗ +1 <span style={{color: 'var(--text-tertiary)', fontWeight: 500}}>this year</span></p>
                </div>
                <div style={{width: 24, height: 24, borderRadius: '50%', background: 'var(--text-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>→</div>
              </div>
            </div>

            {/* Card 3: Pending Admissions */}
            <div className={styles.dashCardDashed}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Pending Admissions</span>
              </div>
              <div>
                <div style={{background: '#FEF3C7', color: '#D97706', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', fontWeight: 600}}>
                  Action Required
                </div>
                
                <div className={styles.mockBarChart}>
                  <div className={`${styles.bar} ${styles.bar1}`} style={{background: '#FCA5A5', color: '#991B1B'}}>Dhaka</div>
                  <div className={`${styles.bar} ${styles.bar2}`} style={{background: '#FDE047', color: '#854D0E'}}>Mirpur</div>
                  <div className={`${styles.bar} ${styles.bar3}`} style={{background: '#FCD34D', color: '#92400E'}}>Uttara</div>
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
