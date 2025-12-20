import React from 'react';
import { COMMON_STYLES } from '../../constants/styles';

interface FormCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={COMMON_STYLES.FORM_CHECKBOX}
      />
      <label htmlFor={id} className="ml-2 block text-sm text-slate-900">
        {label}
      </label>
    </div>
  );
};
