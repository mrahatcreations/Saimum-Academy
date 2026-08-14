import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from '../../App.module.css';

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={styles.layout}>
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      <main className={styles.main}>
        <Topbar />
        <div className={styles.content}>
          <div key={location.pathname} className={styles.pageTransition}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
