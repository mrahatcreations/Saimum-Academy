import React from 'react';
import styles from './FloatingActionBar.module.css';

export interface BulkActionItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'primary';
  disabled?: boolean;
  title?: string;
}

interface FloatingActionBarProps {
  selectedCount: number;
  onDiscard: () => void;
  actions?: BulkActionItem[];
  children?: React.ReactNode;
}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  selectedCount,
  onDiscard,
  actions = [],
  children
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className={styles.floatingWrapper}>
      <div className={styles.actionBar}>
        <div className={styles.countSection}>
          <span className={styles.countText}>
            Selected: <strong>{selectedCount}</strong>
          </span>
        </div>

        <div className={styles.divider} />

        <div className={styles.actionsSection}>
          {actions.map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              disabled={act.disabled}
              title={act.title || act.label}
              className={`${styles.actionBtn} ${
                act.variant === 'danger' ? styles.dangerAction : ''
              } ${act.variant === 'primary' ? styles.primaryAction : ''}`}
            >
              {act.icon && <span className={styles.btnIcon}>{act.icon}</span>}
              <span>{act.label}</span>
            </button>
          ))}
          {children}
        </div>

        <div className={styles.divider} />

        <button
          type="button"
          onClick={onDiscard}
          className={styles.discardBtn}
          title="Clear selection"
        >
          <span>Discard</span>
        </button>
      </div>
    </div>
  );
};
