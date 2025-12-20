import React from 'react';
import { XIcon } from '../Icons';
import { Button } from './Button';
import { COMMON_STYLES } from '../../constants/styles';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const getMaxWidthClass = (maxWidth: string): string => {
  switch (maxWidth) {
    case 'sm':
      return 'max-w-sm';
    case 'md':
      return 'max-w-md';
    case 'lg':
      return 'max-w-lg';
    case 'xl':
      return 'max-w-xl';
    default:
      return 'max-w-md';
  }
};

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Save',
  showFooter = true,
  maxWidth = 'md'
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  const content = (
    <div className={`${COMMON_STYLES.MODAL_CONTAINER} ${getMaxWidthClass(maxWidth)}`}>
      <div className={COMMON_STYLES.MODAL_HEADER}>
        <h3 className={COMMON_STYLES.MODAL_TITLE}>{title}</h3>
        <button onClick={onClose} className={COMMON_STYLES.MODAL_CLOSE_BUTTON}>
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      
      <div className={COMMON_STYLES.MODAL_CONTENT}>
        {children}
      </div>
      
      {showFooter && (
        <div className={COMMON_STYLES.MODAL_FOOTER}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {onSubmit && (
            <Button type="submit" variant="primary">
              {submitLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={COMMON_STYLES.MODAL_BACKDROP}>
      {onSubmit ? (
        <form onSubmit={handleSubmit}>
          {content}
        </form>
      ) : (
        content
      )}
    </div>
  );
};
