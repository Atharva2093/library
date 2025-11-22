'use client';

import React, { useState } from 'react';
import { useFormValidation } from '@/lib/validation/hooks';
import {
  userRegistrationSchema,
  passwordResetSchema,
  type UserRegistrationData,
  type PasswordResetData,
} from '@/lib/validation/schemas';
import { InputField, SelectField, FormButton } from '@/components/ui/FormComponents';

interface RegisterFormProps {
  onSubmit: (data: UserRegistrationData) => Promise<void>;
  isLoading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<UserRegistrationData>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { errors, isSubmitting, handleSubmit, handleFieldChange, handleFieldBlur } =
    useFormValidation({
      schema: userRegistrationSchema,
      onSubmit,
      mode: 'onBlur',
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    handleFieldChange(name as keyof UserRegistrationData, value);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleFieldBlur(name as keyof UserRegistrationData, value);
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <InputField
          label="Full Name"
          name="full_name"
          type="text"
          value={formData.full_name}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.full_name}
          required
          placeholder="Enter full name"
          autoComplete="name"
        />

        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.email}
          required
          placeholder="user@example.com"
          autoComplete="email"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <InputField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            error={errors.password}
            required
            placeholder="Enter password"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="mt-1 text-sm text-green-600 hover:text-green-500"
          >
            {showPassword ? 'Hide password' : 'Show password'}
          </button>
          <p className="mt-2 text-sm text-gray-500">
            Password must be at least 8 characters long and contain uppercase, lowercase, number,
            and special character.
          </p>
        </div>

        <div>
          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            error={errors.confirmPassword}
            required
            placeholder="Confirm password"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="mt-1 text-sm text-green-600 hover:text-green-500"
          >
            {showConfirmPassword ? 'Hide password' : 'Show password'}
          </button>
        </div>
      </div>

      {errors.general && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{errors.general}</div>
        </div>
      )}

      <FormButton type="submit" loading={isSubmitting || isLoading} className="w-full">
        Create Account
      </FormButton>
    </form>
  );
};

interface PasswordResetFormProps {
  onSubmit: (data: PasswordResetData) => Promise<void>;
  isLoading?: boolean;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PasswordResetData>({
    token: '',
    new_password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { errors, isSubmitting, handleSubmit, handleFieldChange, handleFieldBlur } =
    useFormValidation({
      schema: passwordResetSchema,
      onSubmit,
      mode: 'onBlur',
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    handleFieldChange(name as keyof PasswordResetData, value);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleFieldBlur(name as keyof PasswordResetData, value);
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      <div>
        <InputField
          label="New Password"
          name="new_password"
          type={showPassword ? 'text' : 'password'}
          value={formData.new_password}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.new_password}
          required
          placeholder="Enter new password"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="mt-1 text-sm text-green-600 hover:text-green-500"
        >
          {showPassword ? 'Hide password' : 'Show password'}
        </button>
        <p className="mt-2 text-sm text-gray-500">
          Password must be at least 8 characters long and contain uppercase, lowercase, number, and
          special character.
        </p>
      </div>

      <div>
        <InputField
          label="Confirm New Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.confirmPassword}
          required
          placeholder="Confirm new password"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="mt-1 text-sm text-green-600 hover:text-green-500"
        >
          {showConfirmPassword ? 'Hide password' : 'Show password'}
        </button>
      </div>

      {errors.general && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{errors.general}</div>
        </div>
      )}

      <FormButton type="submit" loading={isSubmitting || isLoading} className="w-full">
        Reset Password
      </FormButton>
    </form>
  );
};
