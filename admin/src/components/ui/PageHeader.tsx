import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { UserAvatar } from './UserAvatar';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  count?: number | string;
  userPhotoUrl?: string;
  userName?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  count,
  userPhotoUrl,
  userName = 'Admin User',
  actions,
  children
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        {count !== undefined && <span className={styles.countText}>{count}</span>}
      </div>

      <div className={styles.right}>
        {actions}

        {/* Day / Night Theme Toggle Button */}
        <button 
          type="button" 
          onClick={toggleTheme} 
          className={styles.themeToggleBtn} 
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Account Profile Avatar Icon */}
        <div className={styles.profileAvatarWrapper} title={userName}>
          <UserAvatar
            name={userName}
            photoUrl={userPhotoUrl}
            size={34}
            shape="circle"
            showStatus={true}
            statusColor="#10B981"
          />
        </div>

        {children}
      </div>
    </div>
  );
};
