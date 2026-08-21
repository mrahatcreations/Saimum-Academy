import React from 'react';

export interface TabOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface SegmentedTabsProps {
  options: TabOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  options,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`segmentedTabs ${className}`}>
      {options.map(tab => {
        const isActive = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            className={`segmentedTab ${isActive ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`tabCountBadge ${isActive ? 'activeCount' : ''}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedTabs;
