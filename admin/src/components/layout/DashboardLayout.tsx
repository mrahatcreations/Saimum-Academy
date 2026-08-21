import { useState, useEffect } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, BookOpen, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import styles from '../../App.module.css';

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className={styles.layout}>
      {/* Mobile Backdrop Overlay */}
      {mobileDrawerOpen && (
        <div 
          className={styles.mobileBackdrop} 
          onClick={() => setMobileDrawerOpen(false)} 
        />
      )}

      {/* Sidebar (Responsive drawer on mobile, collapsible on desktop) */}
      <div className={`${styles.sidebarWrapper} ${mobileDrawerOpen ? styles.mobileDrawerOpen : ''}`}>
        <Sidebar 
          isCollapsed={isCollapsed} 
          toggleSidebar={() => setIsCollapsed(!isCollapsed)} 
          closeMobileDrawer={() => setMobileDrawerOpen(false)}
        />
      </div>

      <main className={styles.main}>
        {/* Mobile-only header toggle */}
        <div className={styles.mobileHeaderBar}>
          <button 
            className={styles.mobileHamburgerBtn} 
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu size={22} />
          </button>
          <span className={styles.mobileHeaderTitle}>Saimum Central Academy</span>
        </div>

        <div className={styles.content}>
          <div key={location.pathname} className={styles.pageTransition}>
            <Outlet />
          </div>
        </div>
      </main>

      {/* Native App-Style Mobile Bottom Navigation Bar */}
      <nav className={styles.mobileBottomNav}>
        <NavLink to="/" end className={({ isActive }) => `${styles.mobileNavItem} ${isActive ? styles.mobileNavActive : ''}`}>
          <LayoutDashboard size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/students" className={({ isActive }) => `${styles.mobileNavItem} ${isActive ? styles.mobileNavActive : ''}`}>
          <Users size={20} />
          <span>Students</span>
        </NavLink>
        <NavLink to="/branches" className={({ isActive }) => `${styles.mobileNavItem} ${isActive ? styles.mobileNavActive : ''}`}>
          <Building2 size={20} />
          <span>Branches</span>
        </NavLink>
        <NavLink to="/subjects" className={({ isActive }) => `${styles.mobileNavItem} ${isActive ? styles.mobileNavActive : ''}`}>
          <BookOpen size={20} />
          <span>Subjects</span>
        </NavLink>
        <button className={styles.mobileNavItem} onClick={() => setMobileDrawerOpen(true)}>
          <Menu size={20} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
