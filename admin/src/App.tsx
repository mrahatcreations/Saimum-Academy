import React from 'react';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.collapseBtn}>&lt;</div>
        
        <div className={styles.brand}>
          <div className={styles.logoBox}>SA</div>
          <span className={styles.brandName}>Saimum</span>
        </div>
        
        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>MAIN MENU</span>
            <a href="#" className={`${styles.navItem} ${styles.active}`}>Dashboard</a>
            <a href="#" className={styles.navItem}>Users</a>
            <a href="#" className={styles.navItem}>Accounts</a>
            <a href="#" className={styles.navItem}>Statistics</a>
          </div>
          
          <div className={styles.navSection}>
            <span className={styles.navLabel}>TEAMS</span>
            <a href="#" className={styles.navItem}>Marketing</a>
            <a href="#" className={styles.navItem}>Development</a>
          </div>
        </nav>
        
        <div className={styles.sidebarFooter}>
          <a href="#" className={styles.navItem}>Settings</a>
          <a href="#" className={styles.navItem}>Log Out</a>
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
            <div className={styles.avatar}>SA</div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.content}>
          
          {/* Dribbble Style Top Cards */}
          <div className={styles.dashboardGrid}>
            <div className={styles.dashCardDashed}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Team<br/>Payments</span>
              </div>
              <div>
                <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>07 Dec approval</p>
              </div>
            </div>

            <div className={styles.dashCardDashed}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Savings</span>
              </div>
              <div>
                <h2 className={styles.statValue}>$5,839</h2>
                <p style={{fontSize: '0.8rem', color: 'var(--brand-orange)'}}>-11% last week</p>
              </div>
            </div>

            <div className={styles.dashCardPrimary}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>$95.9<br/><span style={{fontSize: '0.8rem', fontWeight: 400}}>Per Month</span></span>
              </div>
              <div style={{marginTop: '2rem'}}>
                <h3>Choose Best Plan<br/>For You!</h3>
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
              <div className={styles.tableHeader}>
                <div>Receiver</div>
                <div>Type</div>
                <div>Status</div>
                <div>Amount</div>
              </div>
              
              <div className={styles.tableRow}>
                <div>Emma Ryan Jr.</div>
                <div style={{color: 'var(--text-secondary)', fontWeight: 500}}>Salary</div>
                <div><span className={styles.statusPill}>Pending</span></div>
                <div>$3,892</div>
              </div>
              
              <div className={styles.tableRow}>
                <div>Adrian Daren</div>
                <div style={{color: 'var(--text-secondary)', fontWeight: 500}}>Bonus</div>
                <div><span className={`${styles.statusPill} ${styles.done}`}>Done</span></div>
                <div>$1073</div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default App;
