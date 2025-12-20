import React from 'react';
import { COMMON_STYLES } from '../../constants/styles';

interface FormTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  rows = 3,
  required = false,
  placeholder,
  className = '',
  error
}) => {
  return (
    <div>
      <label htmlFor={id} className={COMMON_STYLES.FORM_LABEL}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`${COMMON_STYLES.FORM_TEXTAREA} ${className}`}
        required={required}
        placeholder={placeholder}
      />
      {error && <p className={COMMON_STYLES.TEXT_ERROR}>{error}</p>}
    </div>
  );
};
