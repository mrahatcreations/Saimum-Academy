import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import styles from './CustomSelect.module.css';

export interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  placeholder?: string;
  variant?: 'toolbar' | 'form' | 'compact';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  prefix,
  placeholder = 'Select...',
  variant = 'toolbar',
  fullWidth = false,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const isCustomSelected = value !== 'ALL' && value !== '';

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    if (disabled) return;
    onChange(val);
    setIsOpen(false);
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'form': return styles.variantForm;
      case 'compact': return styles.variantCompact;
      default: return styles.variantToolbar;
    }
  };

  return (
    <div 
      className={`${styles.selectContainer} ${fullWidth ? styles.fullWidth : ''} ${className}`} 
      ref={containerRef}
    >
      <button
        type="button"
        disabled={disabled}
        className={`${styles.triggerBtn} ${getVariantClass()} ${isCustomSelected ? styles.triggerActive : ''} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
      >
        <span className={styles.labelWrapper}>
          {prefix && <span className={styles.labelPrefix}>{prefix}</span>}
          <span className={styles.labelText}>{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown 
          size={14} 
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} 
        />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map(opt => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`${styles.optionItem} ${isSelected ? styles.optionSelected : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} className={styles.checkIcon} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
