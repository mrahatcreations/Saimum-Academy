import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit3, Trash2, Eye, Power } from 'lucide-react';
import styles from './TableActionMenu.module.css';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'warning';
}

interface TableActionMenuProps {
  items?: ActionMenuItem[];
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onToggleStatus?: () => void;
  status?: string;
  mode?: 'dropdown' | 'inline';
}

export default function TableActionMenu({
  items,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  status,
  mode = 'inline'
}: TableActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (mode === 'inline') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, mode]);

  // 1. Direct Inline Action Buttons Mode (3 direct action buttons)
  if (mode === 'inline') {
    return (
      <div className={styles.inlineActionRow} onClick={(e) => e.stopPropagation()}>
        {onView && (
          <button
            type="button"
            className={`${styles.inlineBtn} ${styles.inlineBtnView}`}
            onClick={onView}
            title="View Details"
            aria-label="View Details"
          >
            <Eye size={14} />
          </button>
        )}

        {onEdit && (
          <button
            type="button"
            className={`${styles.inlineBtn} ${styles.inlineBtnEdit}`}
            onClick={onEdit}
            title="Edit Details"
            aria-label="Edit Details"
          >
            <Edit3 size={14} />
          </button>
        )}

        {onToggleStatus && (
          <button
            type="button"
            className={`${styles.inlineBtn} ${styles.inlineBtnToggle}`}
            onClick={onToggleStatus}
            title={status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            aria-label={status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            style={status === 'INACTIVE' ? { color: 'var(--status-success-text, #047857)' } : undefined}
          >
            <Power size={14} />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            className={`${styles.inlineBtn} ${styles.inlineBtnDanger}`}
            onClick={onDelete}
            title="Delete Record"
            aria-label="Delete Record"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    );
  }

  // 2. Dropdown Mode (3-dots fallback)
  const actionItems: ActionMenuItem[] = items && items.length > 0 ? items : [
    ...(onView ? [{
      label: 'View Details',
      icon: <Eye size={14} />,
      onClick: onView
    }] : []),
    ...(onEdit ? [{
      label: 'Edit Details',
      icon: <Edit3 size={14} />,
      onClick: onEdit
    }] : []),
    ...(onToggleStatus ? [{
      label: status === 'ACTIVE' ? 'Deactivate' : 'Activate',
      icon: <Power size={14} />,
      onClick: onToggleStatus,
      variant: (status === 'ACTIVE' ? 'warning' : 'default') as any
    }] : []),
    ...(onDelete ? [{
      label: 'Delete Record',
      icon: <Trash2 size={14} />,
      onClick: onDelete,
      variant: 'danger' as any
    }] : []),
  ];

  return (
    <div className={styles.actionMenuWrapper} ref={menuRef}>
      <button 
        type="button"
        className={`${styles.actionTriggerBtn} ${isOpen ? styles.active : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="More Actions"
        aria-label="Actions Menu"
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
          {actionItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.menuItem} ${item.variant === 'danger' ? styles.itemDanger : item.variant === 'warning' ? styles.itemWarning : ''}`}
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
            >
              {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
