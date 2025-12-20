import React from 'react';
import { COMMON_STYLES } from '../../constants/styles';

interface FormInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'password';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
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
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`${COMMON_STYLES.FORM_INPUT} ${className}`}
        required={required}
        placeholder={placeholder}
      />
      {error && <p className={COMMON_STYLES.TEXT_ERROR}>{error}</p>}
    </div>
  );
};
