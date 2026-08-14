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
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <div style={{width: 32, height: 32, borderRadius: '50%', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1'}}>
                    <Building2 size={16} />
                  </div>
                  <span className={styles.cardTitle}>Active Branches</span>
                </div>
              </div>
              
              {/* SVG Mock line chart - Beautiful curve, edge to edge */}
              <div style={{margin: 'auto -24px 0 -24px', overflow: 'hidden'}}>
                <svg width="100%" height="45" viewBox="0 0 200 45" preserveAspectRatio="none" style={{display: 'block'}}>
                  <path d="M0 25 C 30 5, 70 45, 100 25 C 130 5, 170 45, 200 25" fill="none" stroke="#34D399" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M0 25 C 30 5, 70 45, 100 25 C 130 5, 170 45, 200 25 L 200 45 L 0 45 Z" fill="url(#gradient)" stroke="none" opacity="0.5"/>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34D399"/>
                      <stop offset="100%" stopColor="#34D399" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px'}}>
                <div>
                  <h2 className={styles.statValue}>04</h2>
                  <p style={{fontSize: '0.8rem', color: '#10B981', fontWeight: 700}}>↗ +1 <span style={{color: 'var(--text-tertiary)', fontWeight: 600}}>this year</span></p>
                </div>
                <div style={{width: 32, height: 32, minWidth: 32, flexShrink: 0, borderRadius: '50%', background: 'var(--text-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>→</div>
              </div>
            </div>

            {/* Card 3: Pending Admissions */}
            <div className={styles.dashCardDashed}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Pending Admissions</span>
              </div>
              <div style={{marginTop: 'auto'}}>
                <div style={{background: '#FEF3C7', color: '#D97706', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', display: 'inline-block', fontWeight: 700, marginBottom: '16px'}}>
                  Action Required
                </div>
                
                <div className={styles.mockBarChart}>
                  <div className={`${styles.bar} ${styles.bar1}`} title="Dhaka: 40%">Dhk</div>
                  <div className={`${styles.bar} ${styles.bar2}`} title="Mirpur: 70%">Mir</div>
                  <div className={`${styles.bar} ${styles.bar3}`} title="Uttara: 100%">Utt</div>
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
