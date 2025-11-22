import { useState, useCallback } from 'react';
import { z } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  onSubmit?: (data: T) => void | Promise<void>;
  mode?: 'onChange' | 'onSubmit' | 'onBlur';
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  onSubmit,
  mode = 'onChange',
}: UseFormValidationOptions<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    (name: keyof T, value: any) => {
      try {
        // Get the field schema - check if it's a ZodObject with shape property
        const fieldSchema = (schema as any).shape?.[name as string];
        if (fieldSchema) {
          fieldSchema.parse(value);
          // Clear error if validation passes
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name as string];
            return newErrors;
          });
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.issues[0];
          setErrors(prev => ({
            ...prev,
            [name as string]: fieldError.message,
          }));
        }
      }
    },
    [schema]
  );

  // Validate the entire form
  const validateForm = useCallback(
    (data: T): { isValid: boolean; errors: Record<string, string> } => {
      try {
        schema.parse(data);
        return { isValid: true, errors: {} };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formErrors: Record<string, string> = {};
          error.issues.forEach(issue => {
            const field = issue.path.join('.');
            formErrors[field] = issue.message;
          });
          return { isValid: false, errors: formErrors };
        }
        return { isValid: false, errors: { general: 'Validation failed' } };
      }
    },
    [schema]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: T) => {
      setIsSubmitting(true);
      setIsValidating(true);

      try {
        const validation = validateForm(data);
        if (!validation.isValid) {
          setErrors(validation.errors);
          return { success: false, errors: validation.errors };
        }

        setErrors({});

        if (onSubmit) {
          await onSubmit(data);
        }

        return { success: true, errors: {} };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Submission failed';
        setErrors({ general: errorMessage });
        return { success: false, errors: { general: errorMessage } };
      } finally {
        setIsSubmitting(false);
        setIsValidating(false);
      }
    },
    [validateForm, onSubmit]
  );

  // Handle field change with validation
  const handleFieldChange = useCallback(
    (name: keyof T, value: any) => {
      if (mode === 'onChange') {
        validateField(name, value);
      }
    },
    [validateField, mode]
  );

  // Handle field blur with validation
  const handleFieldBlur = useCallback(
    (name: keyof T, value: any) => {
      if (mode === 'onBlur' || mode === 'onChange') {
        validateField(name, value);
      }
    },
    [validateField, mode]
  );

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Clear specific field error
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Get error for specific field
  const getFieldError = useCallback(
    (fieldName: string) => {
      return errors[fieldName];
    },
    [errors]
  );

  // Check if form has any errors
  const hasErrors = Object.keys(errors).length > 0;

  // Check if specific field has error
  const hasFieldError = useCallback(
    (fieldName: string) => {
      return !!errors[fieldName];
    },
    [errors]
  );

  return {
    errors,
    isValidating,
    isSubmitting,
    hasErrors,
    validateField,
    validateForm,
    handleSubmit,
    handleFieldChange,
    handleFieldBlur,
    clearErrors,
    clearFieldError,
    getFieldError,
    hasFieldError,
  };
}

// Utility function to create form validation hook with specific schema
export function createFormValidation<T extends Record<string, any>>(schema: z.ZodSchema<T>) {
  return (options?: Omit<UseFormValidationOptions<T>, 'schema'>) => {
    return useFormValidation({ ...options, schema });
  };
}

// Real-time validation hook for individual fields
export function useFieldValidation<T>(schema: z.ZodSchema<T>, initialValue: T, debounceMs = 300) {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(
    async (newValue: T) => {
      setIsValidating(true);

      try {
        await schema.parseAsync(newValue);
        setError(null);
        return true;
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.issues[0].message);
        } else {
          setError('Validation failed');
        }
        return false;
      } finally {
        setIsValidating(false);
      }
    },
    [schema]
  );

  // Debounced validation
  const debouncedValidate = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (newValue: T) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => validate(newValue), debounceMs);
      };
    })(),
    [validate, debounceMs]
  );

  const updateValue = useCallback(
    (newValue: T) => {
      setValue(newValue);
      debouncedValidate(newValue);
    },
    [debouncedValidate]
  );

  return {
    value,
    setValue: updateValue,
    error,
    isValidating,
    validate: () => validate(value),
    isValid: !error && !isValidating,
  };
}
