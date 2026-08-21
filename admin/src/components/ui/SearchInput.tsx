import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  width?: string | number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  width
}) => {
  return (
    <div 
      className={`searchBox ${className}`}
      style={width ? { width } : undefined}
    >
      <Search size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          border: 'none',
          background: 'transparent',
          outline: 'none',
          color: 'var(--text-primary)',
          fontSize: '0.82rem',
          fontFamily: 'inherit',
          width: '100%'
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          title="Clear search"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
