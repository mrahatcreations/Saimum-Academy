import React from 'react';
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

export default function Sidebar() {
  const getNavClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? `${styles.navItem} ${styles.active}` : styles.navItem;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.collapseBtn}>
        <ChevronLeft size={16} />
      </div>
      
      <div className={styles.brand}>
        <img src="/logo.png" alt="Saimum Logo" className={styles.logoImage} />
        <span className={styles.brandName}>Saimum</span>
      </div>
      
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <span className={styles.navLabel}>MAIN MENU</span>
          <NavLink to="/" className={getNavClass} end>
            <span className={styles.navIcon}><LayoutDashboard size={18} /></span> Dashboard
          </NavLink>
          <NavLink to="/students" className={getNavClass}>
            <span className={styles.navIcon}><Users size={18} /></span> Students
          </NavLink>
          <NavLink to="/branches" className={getNavClass}>
            <span className={styles.navIcon}><Building2 size={18} /></span> Branches
          </NavLink>
          <NavLink to="/departments" className={getNavClass}>
            <span className={styles.navIcon}><LibraryBig size={18} /></span> Departments
          </NavLink>
          <NavLink to="/subjects" className={getNavClass}>
            <span className={styles.navIcon}><BookOpen size={18} /></span> Subjects
          </NavLink>
        </div>
        
        <div className={styles.navSection}>
          <span className={styles.navLabel}>ACADEMICS</span>
          <NavLink to="/batches" className={getNavClass}>
            <div className={`${styles.navDot} ${styles.dotOrange}`}></div> Active Batches
          </NavLink>
          <NavLink to="/admissions" className={getNavClass}>
            <div className={`${styles.navDot} ${styles.dotBlue}`}></div> Pending Admissions
          </NavLink>
        </div>
      </nav>
      
      <div className={styles.sidebarFooter}>
        <NavLink to="/settings" className={getNavClass}>
          <span className={styles.navIcon}><Settings size={18} /></span> Settings
        </NavLink>
        <a href="#" className={styles.navItem} onClick={(e) => e.preventDefault()}>
          <span className={styles.navIcon}><LogOut size={18} /></span> Log Out
        </a>
      </div>
    </aside>
  );
}
