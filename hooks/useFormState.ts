import { useState, useEffect } from 'react';

export interface UseFormStateOptions<T> {
  initialData?: T | null;
  resetOnClose?: boolean;
  isOpen?: boolean;
}

export function useFormState<T extends Record<string, any>>(
  defaultValues: T,
  options: UseFormStateOptions<T> = {}
) {
  const { initialData, resetOnClose = true, isOpen } = options;
  const [formData, setFormData] = useState<T>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultValues, ...initialData });
    } else if (resetOnClose) {
      setFormData(defaultValues);
    }
    setErrors({});
  }, [initialData, isOpen, resetOnClose]);

  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const setFieldError = <K extends keyof T>(field: K, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const reset = () => {
    setFormData(defaultValues);
    setErrors({});
  };

  return {
    formData,
    errors,
    updateField,
    setFieldError,
    clearErrors,
    reset,
    setFormData
  };
}
