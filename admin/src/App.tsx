import React from 'react';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.collapseBtn}>&lt;</div>
        
        <div className={styles.brand}>
          <div className={styles.logoBox}></div>
          <span className={styles.brandName}>Saimum</span>
        </div>
        
        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>MAIN MENU</span>
            <a href="#" className={`${styles.navItem} ${styles.active}`}>
              <span className={styles.navIcon}>⊞</span> Dashboard
            </a>
            <a href="#" className={styles.navItem}>
              <span className={styles.navIcon}>👥</span> Users
            </a>
            <a href="#" className={styles.navItem}>
              <span className={styles.navIcon}>💳</span> Accounts
            </a>
            <a href="#" className={styles.navItem}>
              <span className={styles.navIcon}>📊</span> Statistics
            </a>
          </div>
          
          <div className={styles.navSection}>
            <span className={styles.navLabel}>TEAMS</span>
            <a href="#" className={styles.navItem}>
              <div className={`${styles.navDot} ${styles.dotOrange}`}></div> Marketing
            </a>
            <a href="#" className={styles.navItem}>
              <div className={`${styles.navDot} ${styles.dotBlue}`}></div> Development
            </a>
          </div>
        </nav>
        
        <div className={styles.sidebarFooter}>
          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>⚙️</span> Settings
          </a>
          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>🚪</span> Log Out
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.pageTitle}>
            <h1>Analytics</h1>
          </div>
          <div className={styles.profile}>
            <div className={styles.actionBtn}>+</div>
            <div className={styles.avatar}>
              {/* Dummy Image for user avatar */}
              <img src="https://i.pravatar.cc/150?img=47" alt="User" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.content}>
          
          {/* Dashboard Grid */}
          <div className={styles.dashboardGrid}>
            
            {/* Card 1: Team Payments */}
            <div className={styles.dashCardDashed}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Team<br/>Payments</span>
                <span className={styles.cardIcon}>🔔</span>
              </div>
              <div>
                <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 600}}>
                  🗓 07 Dec approval
                </p>
                <div className={styles.avatarGroup}>
                  <img src="https://i.pravatar.cc/150?img=33" className={styles.avatarSmall} alt="User" />
                  <img src="https://i.pravatar.cc/150?img=12" className={styles.avatarSmall} alt="User" />
                  <img src="https://i.pravatar.cc/150?img=5" className={styles.avatarSmall} alt="User" />
                  <div className={styles.avatarSmall}>25+</div>
                </div>
              </div>
            </div>

            {/* Card 2: Savings */}
            <div className={styles.dashCardDashed}>
              <div className={styles.cardHeader}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <div style={{width: 24, height: 24, borderRadius: '50%', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1', fontSize: '12px'}}>📈</div>
                  <span className={styles.cardTitle}>Savings</span>
                </div>
              </div>
              
              {/* SVG Mock line chart */}
              <div style={{margin: '12px 0'}}>
                <svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none">
                  <path d="M0 30 Q 20 20, 40 30 T 80 15 T 120 25 T 160 10 T 200 20" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                <div>
                  <h2 className={styles.statValue}>$5,839</h2>
                  <p style={{fontSize: '0.8rem', color: '#EF4444', fontWeight: 600}}>↘ -11% <span style={{color: 'var(--text-tertiary)'}}>last week</span></p>
                </div>
                <div style={{width: 32, height: 32, borderRadius: '50%', background: 'var(--text-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>→</div>
              </div>
            </div>

            {/* Card 3: Gradient Card */}
            <div className={styles.dashCardPrimary}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle} style={{fontSize: '2rem'}}>
                  $95.9<br/>
                  <span style={{fontSize: '0.85rem', fontWeight: 500, opacity: 0.9}}>Per Month</span>
                </span>
              </div>
              <div>
                <h3 style={{fontSize: '1.25rem', lineHeight: 1.3}}>Choose Best Plan<br/>For You!</h3>
                <div className={styles.cardActions}>
                  <button className={styles.btnWhite}>Details</button>
                  <button className={styles.btnDark}>Upgrade</button>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Transactions</h2>
              <div className={styles.searchBox}>
                <span>🔍 Search</span>
              </div>
            </div>
            
            <div className={styles.table}>
              {/* Header */}
              <div className={styles.tableHeader}>
                <div></div>
                <div>Reciever</div>
                <div>Type</div>
                <div>Status</div>
                <div>Date</div>
                <div>Amount</div>
                <div></div>
              </div>
              
              {/* Row 1 */}
              <div className={styles.tableRow}>
                <div><div className={styles.checkbox}></div></div>
                <div className={styles.userCell}>
                  <img src="https://i.pravatar.cc/150?img=33" className={styles.userAvatar} alt="Emma" />
                  Emma Ryan Jr.
                </div>
                <div style={{color: 'var(--text-secondary)'}}>Salary</div>
                <div><span className={`${styles.statusPill} ${styles.statusPending}`}>Pending</span></div>
                <div style={{color: 'var(--text-secondary)'}}>Feb 19th, 2023</div>
                <div className={styles.amountText}>$3,892</div>
                <div><button className={styles.btnDetails}>Details</button></div>
              </div>
              
              {/* Row 2 */}
              <div className={styles.tableRow}>
                <div><div className={styles.checkbox}></div></div>
                <div className={styles.userCell}>
                  <img src="https://i.pravatar.cc/150?img=11" className={styles.userAvatar} alt="Adrian" />
                  Adrian Daren
                </div>
                <div style={{color: 'var(--text-secondary)'}}>Bonus</div>
                <div><span className={`${styles.statusPill} ${styles.statusDone}`}>Done</span></div>
                <div style={{color: 'var(--text-secondary)'}}>Feb 18th, 2023</div>
                <div className={styles.amountText}>$1073</div>
                <div><button className={styles.btnDetails}>Details</button></div>
              </div>

              {/* Row 3 */}
              <div className={styles.tableRow}>
                <div><div className={styles.checkbox}></div></div>
                <div className={styles.userCell}>
                  <img src="https://i.pravatar.cc/150?img=5" className={styles.userAvatar} alt="Roxanne" />
                  Roxanne Hills
                </div>
                <div style={{color: 'var(--text-secondary)'}}>Salary</div>
                <div><span className={`${styles.statusPill} ${styles.statusDone}`}>Done</span></div>
                <div style={{color: 'var(--text-secondary)'}}>Apr 16th, 2023</div>
                <div className={styles.amountText}>$2,790</div>
                <div><button className={styles.btnDetails}>Details</button></div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default App;
