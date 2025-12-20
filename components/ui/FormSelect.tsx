import React from 'react';
import { COMMON_STYLES } from '../../constants/styles';

interface FormSelectProps {
  id?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder,
  className = '',
  error,
  disabled = false,
  children
}) => {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div>
      <label htmlFor={selectId} className={COMMON_STYLES.FORM_LABEL}>
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        className={`${COMMON_STYLES.FORM_SELECT} ${className}`}
        required={required}
        disabled={disabled}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {children || (options && options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )))}
      </select>
      {error && <p className={COMMON_STYLES.TEXT_ERROR}>{error}</p>}
    </div>
  );
};
