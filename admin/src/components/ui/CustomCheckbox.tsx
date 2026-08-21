import React from 'react';
import { Check } from 'lucide-react';
import styles from './CustomCheckbox.module.css';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  id,
  ariaLabel
}) => {
  return (
    <label 
      className={`${styles.checkboxContainer} ${disabled ? styles.disabled : ''}`}
      htmlFor={id}
    >
      <input
        type="checkbox"
        id={id}
        aria-label={ariaLabel}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={styles.hiddenInput}
      />
      <div 
        className={`${styles.customBox} ${checked ? styles.checked : ''} ${indeterminate ? styles.indeterminate : ''}`}
      >
        {checked && !indeterminate && <Check size={12} strokeWidth={3} className={styles.checkIcon} />}
        {indeterminate && <div className={styles.indeterminateDash} />}
      </div>
    </label>
  );
};
