import React from 'react';
import { Plus } from 'lucide-react';
import styles from '../../App.module.css';
import { useLocation } from 'react-router-dom';

export default function Topbar() {
  const location = useLocation();
  
  // Create page title from path
  let title = 'Dashboard';
  if (location.pathname !== '/') {
    const path = location.pathname.split('/')[1];
    title = path.charAt(0).toUpperCase() + path.slice(1);
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.pageTitleGroup}>
        <div className={styles.pageTitle}>
          <h1>{title}</h1>
        </div>
        <div className={styles.togglePills}>
          <div className={`${styles.togglePill} ${styles.active}`}>Overview</div>
          <div className={styles.togglePill}>Analytics</div>
        </div>
      </div>
      <div className={styles.profile}>
        <div className={styles.actionBtn}>
          <Plus size={20} />
        </div>
        <div className={styles.avatar}>
          <img src="https://i.pravatar.cc/150?img=11" alt="Super Admin" />
        </div>
      </div>
    </header>
  );
}
