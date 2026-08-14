import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from '../../App.module.css';

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      <main className={styles.main}>
        <Topbar />
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
