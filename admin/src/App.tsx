import React from 'react';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logoBox}>SA</div>
          <span className={styles.brandName}>Saimum Admin</span>
        </div>
        
        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>OVERVIEW</span>
            <a href="#" className={`${styles.navItem} ${styles.active}`}>Dashboard</a>
            <a href="#" className={styles.navItem}>Admissions</a>
            <a href="#" className={styles.navItem}>Students</a>
          </div>
          
          <div className={styles.navSection}>
            <span className={styles.navLabel}>ACADEMICS</span>
            <a href="#" className={styles.navItem}>Branches</a>
            <a href="#" className={styles.navItem}>Departments</a>
            <a href="#" className={styles.navItem}>Subjects</a>
            <a href="#" className={styles.navItem}>Batches</a>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.pageTitle}>
            <h1>Dashboard</h1>
            <p>Welcome back, Super Admin</p>
          </div>
          <div className={styles.profile}>
            <div className={styles.avatar}>SA</div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.content}>
          
          {/* Summary Cards */}
          <div className={styles.cardGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Students</span>
              <h2 className={styles.statValue}>1,248</h2>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Active Branches</span>
              <h2 className={styles.statValue}>4</h2>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Pending Admissions</span>
              <h2 className={styles.statValue}>32</h2>
            </div>
          </div>

          {/* Main Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Recent Activities</h2>
              <button className={styles.btnPrimary}>View All</button>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.emptyState}>
                <p>No recent activities found.</p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default App;
