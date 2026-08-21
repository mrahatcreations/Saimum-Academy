import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus,
  Users, 
  Layers,
  Building2, 
  LibraryBig, 
  BookOpen, 
  SlidersHorizontal,
  Settings, 
  LogOut, 
  ChevronLeft,
  Sparkles,
  Network,
  CreditCard,
  TrendingUp
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
      <div className={styles.collapseBtn} onClick={toggleSidebar} title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
        <div className={`${styles.iconRotator} ${isCollapsed ? styles.rotated : ''}`}>
          <ChevronLeft size={16} />
        </div>
      </div>
      
      {/* 1. Header: Logo & Brand Name */}
      <div className={styles.sidebarHeader}>
        <div className={styles.brand}>
          <img src="/logo.png" alt="Saimum Logo" className={styles.logoImage} />
          <div className={styles.brandInfo}>
            <span className={styles.brandName}>Saimum</span>
            <span className={styles.brandSubtitle}>Central Academy</span>
          </div>
        </div>
        {/* Mobile Close Button */}
        {closeMobileDrawer && (
          <button className={styles.mobileDrawerCloseBtn} onClick={closeMobileDrawer} aria-label="Close Menu">
            ✕
          </button>
        )}
      </div>
      
      {/* 2. Body: Navigation Menus */}
      <nav className={styles.sidebarBody}>
        {/* Section 1: Overview & Admissions */}
        <div className={styles.navSection}>
          <span className={styles.navLabel}>MAIN MENU</span>
          <NavLink to="/" className={getNavClass} end title="Dashboard">
            <span className={styles.navIcon}><LayoutDashboard size={18} /></span> 
            <span className={styles.navText}>Dashboard</span>
          </NavLink>
          <NavLink to="/admissions" className={getNavClass} title="Admissions">
            <span className={styles.navIcon}><UserPlus size={18} /></span> 
            <span className={styles.navText}>Admissions</span>
          </NavLink>
          <NavLink to="/students" className={getNavClass} title="Students">
            <span className={styles.navIcon}><Users size={18} /></span> 
            <span className={styles.navText}>Students</span>
          </NavLink>
        </div>
        
        {/* Section 2: Academics Management */}
        <div className={styles.navSection}>
          <span className={styles.navLabel}>ACADEMICS</span>
          <NavLink to="/workshops" className={getNavClass} title="Cultural Workshops">
            <span className={styles.navIcon}><Sparkles size={18} /></span> 
            <span className={styles.navText}>Workshops</span>
          </NavLink>
          <NavLink to="/batches" className={getNavClass} title="Batches">
            <span className={styles.navIcon}><Layers size={18} /></span> 
            <span className={styles.navText}>Batches</span>
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
          <NavLink to="/form-builder" className={getNavClass} title="Form Builder">
            <span className={styles.navIcon}><SlidersHorizontal size={18} /></span> 
            <span className={styles.navText}>Form Builder</span>
          </NavLink>
        </div>

        {/* Section 3: Finance & Accounts */}
        <div className={styles.navSection}>
          <span className={styles.navLabel}>FINANCE</span>
          <NavLink to="/payments" className={getNavClass} title="Payments & Fee Collections">
            <span className={styles.navIcon}><CreditCard size={18} /></span> 
            <span className={styles.navText}>Payments</span>
          </NavLink>
          <NavLink to="/financial-report" className={getNavClass} title="Financial Reports & Accounts">
            <span className={styles.navIcon}><TrendingUp size={18} /></span> 
            <span className={styles.navText}>Financial Report</span>
          </NavLink>
        </div>

        {/* Section 4: Administration */}
        <div className={styles.navSection}>
          <span className={styles.navLabel}>ADMINISTRATION</span>
          <NavLink to="/hierarchy" className={getNavClass} title="Org Hierarchy Canvas">
            <span className={styles.navIcon}><Network size={18} /></span> 
            <span className={styles.navText}>Org Hierarchy</span>
          </NavLink>
          <NavLink to="/staff" className={getNavClass} title="Staff Management">
            <span className={styles.navIcon}><Users size={18} /></span> 
            <span className={styles.navText}>Staff Management</span>
          </NavLink>
        </div>
      </nav>
      
      {/* 3. Footer: Settings & Log Out */}
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
