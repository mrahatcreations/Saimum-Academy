import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  LibraryBig, 
  BookOpen, 
  Settings, 
  LogOut, 
  ChevronLeft
} from 'lucide-react';
import styles from '../../App.module.css';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  closeMobileDrawer?: () => void;
}

export default function Sidebar({ isCollapsed, toggleSidebar, closeMobileDrawer }: SidebarProps) {
  const getNavClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? `${styles.navItem} ${styles.active}` : styles.navItem;

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Collapse Toggle Button (Desktop) */}
      <div className={styles.collapseBtn} onClick={toggleSidebar}>
        <div className={`${styles.iconRotator} ${isCollapsed ? styles.rotated : ''}`}>
          <ChevronLeft size={16} />
        </div>
      </div>
      
      {/* 1. Header: Logo & Brand Name */}
      <div className={styles.sidebarHeader}>
        <div className={styles.brand}>
          <img src="/logo.png" alt="Saimum Logo" className={styles.logoImage} />
          <span className={styles.brandName}>Saimum</span>
        </div>
        {/* Mobile Close Button */}
        {closeMobileDrawer && (
          <button className={styles.mobileDrawerCloseBtn} onClick={closeMobileDrawer} aria-label="Close Menu">
            ✕
          </button>
        )}
      </div>
      
      {/* 2. Body: Navigation Menus (Independently Scrollable) */}
      <nav className={styles.sidebarBody}>
        <div className={styles.navSection}>
          <span className={styles.navLabel}>MAIN MENU</span>
          <NavLink to="/" className={getNavClass} end title="Dashboard">
            <span className={styles.navIcon}><LayoutDashboard size={18} /></span> 
            <span className={styles.navText}>Dashboard</span>
          </NavLink>
          <NavLink to="/students" className={getNavClass} title="Students">
            <span className={styles.navIcon}><Users size={18} /></span> 
            <span className={styles.navText}>Students</span>
          </NavLink>
          <NavLink to="/branches" className={getNavClass} title="Branches">
            <span className={styles.navIcon}><Building2 size={18} /></span> 
            <span className={styles.navText}>Branches</span>
          </NavLink>
          <NavLink to="/departments" className={getNavClass} title="Departments">
            <span className={styles.navIcon}><LibraryBig size={18} /></span> 
            <span className={styles.navText}>Departments</span>
          </NavLink>
          <NavLink to="/subjects" className={getNavClass} title="Subjects">
            <span className={styles.navIcon}><BookOpen size={18} /></span> 
            <span className={styles.navText}>Subjects</span>
          </NavLink>
        </div>
        
        <div className={styles.navSection}>
          <span className={styles.navLabel}>ACADEMICS</span>
          <NavLink to="/batches" className={getNavClass} title="Active Batches">
            <div className={styles.navIcon} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div className={`${styles.navDot} ${styles.dotOrange}`}></div>
            </div>
            <span className={styles.navText}>Active Batches</span>
          </NavLink>
          <NavLink to="/admissions" className={getNavClass} title="Pending Admissions">
            <div className={styles.navIcon} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div className={`${styles.navDot} ${styles.dotBlue}`}></div>
            </div>
            <span className={styles.navText}>Pending Admissions</span>
          </NavLink>
        </div>
      </nav>
      
      {/* 3. Footer: Settings & Log Out (Always Pinned at Bottom) */}
      <div className={styles.sidebarFooter}>
        <NavLink to="/settings" className={getNavClass} title="Settings">
          <span className={styles.navIcon}><Settings size={18} /></span> 
          <span className={styles.navText}>Settings</span>
        </NavLink>
        <a href="#" className={styles.navItem} onClick={(e) => e.preventDefault()} title="Log Out">
          <span className={styles.navIcon}><LogOut size={18} /></span> 
          <span className={styles.navText}>Log Out</span>
        </a>
      </div>
    </aside>
  );
}
