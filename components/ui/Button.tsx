import React from 'react';
import { COMMON_STYLES } from '../../constants/styles';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const getVariantStyles = (variant: ButtonVariant): string => {
  switch (variant) {
    case 'primary':
      return COMMON_STYLES.BUTTON_PRIMARY;
    case 'secondary':
      return COMMON_STYLES.BUTTON_SECONDARY;
    case 'danger':
      return COMMON_STYLES.BUTTON_DANGER;
    default:
      // This should never happen due to TypeScript type checking
      const exhaustiveCheck: never = variant;
      return COMMON_STYLES.BUTTON_PRIMARY;
  }
};

export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  onClick,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${getVariantStyles(variant as ButtonVariant)} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};
