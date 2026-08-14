import { Plus, Sun, Moon } from 'lucide-react';
import styles from '../../App.module.css';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function Topbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
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
          <h1 key={title} className={styles.titleTransition}>{title}</h1>
        </div>
        <div className={styles.togglePills}>
          <div className={`${styles.togglePill} ${styles.active}`}>Overview</div>
          <div className={styles.togglePill}>Analytics</div>
        </div>
      </div>
      <div className={styles.profile}>
        <button 
          className={styles.actionBtn} 
          onClick={toggleTheme} 
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <div className={styles.actionBtn} title="Add New">
          <Plus size={20} />
        </div>
        <div className={styles.avatar}>
          <img src="https://i.pravatar.cc/150?img=11" alt="Super Admin" />
        </div>
      </div>
    </header>
  );
}
