'use client';

import React, { useState } from 'react';
import { useFormValidation } from '@/lib/validation/hooks';
import { loginSchema, type LoginFormData } from '@/lib/validation/schemas';
import { InputField, FormButton } from '@/components/ui/FormComponents';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { errors, isSubmitting, handleSubmit, handleFieldChange, handleFieldBlur } =
    useFormValidation({
      schema: loginSchema,
      onSubmit,
      mode: 'onBlur',
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    handleFieldChange(name as keyof LoginFormData, value);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleFieldBlur(name as keyof LoginFormData, value);
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      <InputField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        error={errors.email}
        required
        placeholder="Enter your email"
        autoComplete="email"
      />

      <div className="relative">
        <InputField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.password}
          required
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 top-6 flex items-center pr-3"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <span className="text-sm text-gray-400">Hide</span>
          ) : (
            <span className="text-sm text-gray-400">Show</span>
          )}
        </button>
      </div>

      {errors.general && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{errors.general}</div>
        </div>
      )}

      <FormButton type="submit" loading={isSubmitting || isLoading} className="w-full">
        Sign In
      </FormButton>
    </form>
  );
};
