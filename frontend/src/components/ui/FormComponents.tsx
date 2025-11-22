import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  helpText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  required = false,
  children,
  helpText,
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <div className="mt-1 flex items-center text-sm text-red-600">
          <ExclamationCircleIcon className="mr-1 h-4 w-4" />
          {error}
        </div>
      )}
      {helpText && !error && <p className="text-sm text-gray-500">{helpText}</p>}
    </div>
  );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helpText,
  required,
  className = '',
  ...props
}) => {
  const inputClasses = `
    block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset
    ${error ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-green-500'}
    placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
    ${className}
  `;

  return (
    <FormField
      label={label}
      name={props.name || ''}
      error={error}
      required={required}
      helpText={helpText}
    >
      <input
        {...props}
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.name}-error` : undefined}
      />
    </FormField>
  );
};

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  error,
  helpText,
  required,
  className = '',
  rows = 3,
  ...props
}) => {
  const textareaClasses = `
    block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset
    ${error ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-green-500'}
    placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
    ${className}
  `;

  return (
    <FormField
      label={label}
      name={props.name || ''}
      error={error}
      required={required}
      helpText={helpText}
    >
      <textarea
        {...props}
        rows={rows}
        className={textareaClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.name}-error` : undefined}
      />
    </FormField>
  );
};

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helpText?: string;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  error,
  helpText,
  required,
  options,
  placeholder,
  className = '',
  ...props
}) => {
  const selectClasses = `
    block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset
    ${error ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-green-500'}
    focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
    ${className}
  `;

  return (
    <FormField
      label={label}
      name={props.name || ''}
      error={error}
      required={required}
      helpText={helpText}
    >
      <select
        {...props}
        className={selectClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.name}-error` : undefined}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  error,
  helpText,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <input
          {...props}
          type="checkbox"
          className={`h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.name}-error` : undefined}
        />
        <label htmlFor={props.name} className="ml-2 block text-sm text-gray-900">
          {label}
        </label>
      </div>
      {error && (
        <div className="mt-1 flex items-center text-sm text-red-600">
          <ExclamationCircleIcon className="mr-1 h-4 w-4" />
          {error}
        </div>
      )}
      {helpText && !error && <p className="text-sm text-gray-500">{helpText}</p>}
    </div>
  );
};

interface FileFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
  onFileChange: (file: File | null) => void;
}

export const FileField: React.FC<FileFieldProps> = ({
  label,
  error,
  helpText,
  required,
  onFileChange,
  className = '',
  ...props
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
  };

  const inputClasses = `
    block w-full text-sm text-gray-900 border rounded-lg cursor-pointer bg-gray-50
    ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-green-500'}
    file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold
    file:bg-green-50 file:text-green-700 hover:file:bg-green-100
    ${className}
  `;

  return (
    <FormField
      label={label}
      name={props.name || ''}
      error={error}
      required={required}
      helpText={helpText}
    >
      <input
        {...props}
        type="file"
        onChange={handleFileChange}
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.name}-error` : undefined}
      />
    </FormField>
  );
};

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const FormButton: React.FC<FormButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';

  const variantClasses = {
    primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-gray-400',
    secondary:
      'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-green-500 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-400',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  return (
    <button {...props} className={buttonClasses} disabled={disabled || loading}>
      {loading && (
        <svg
          className="-ml-1 mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};
