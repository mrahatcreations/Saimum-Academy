import React from 'react';
import styles from './SubNavTabs.module.css';

export interface TabItem<T = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface SubNavTabsProps<T = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function SubNavTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  actions,
  children,
  className = ''
}: SubNavTabsProps<T>) {
  return (
    <div className={`${styles.tabsContainer} ${className}`}>
      <div className={styles.tabsList}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`${styles.tabBtn} ${isActive ? styles.active : ''}`}
            >
              {tab.icon && <span className={styles.icon}>{tab.icon}</span>}
              <span className={styles.label}>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`${styles.countBadge} ${isActive ? styles.activeBadge : ''}`}>
                  {tab.count}
                </span>
              )}
              {isActive && <div className={styles.activeIndicator} />}
            </button>
          );
        })}
      </div>

      {(actions || children) && (
        <div className={styles.actionsGroup}>
          {actions}
          {children}
        </div>
      )}
    </div>
  );
}
