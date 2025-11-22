'use client';

import React, { useState } from 'react';
import { useFormValidation } from '@/lib/validation/hooks';
import { customerSchema, type CustomerFormData } from '@/lib/validation/schemas';
import { InputField, TextareaField, FormButton } from '@/components/ui/FormComponents';

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Customer',
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    ...initialData,
  });

  const { errors, isSubmitting, handleSubmit, handleFieldChange, handleFieldBlur } =
    useFormValidation({
      schema: customerSchema,
      onSubmit,
      mode: 'onBlur',
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    handleFieldChange(name as keyof CustomerFormData, value);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleFieldBlur(name as keyof CustomerFormData, value);
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <InputField
          label="First Name"
          name="first_name"
          type="text"
          value={formData.first_name}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.first_name}
          required
          placeholder="Enter customer's first name"
        />

        <InputField
          label="Last Name"
          name="last_name"
          type="text"
          value={formData.last_name}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.last_name}
          required
          placeholder="Enter customer's last name"
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
          placeholder="customer@example.com"
          autoComplete="email"
        />

        <InputField
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.phone}
          placeholder="(555) 123-4567"
          helpText="Format: (XXX) XXX-XXXX"
          autoComplete="tel"
        />
      </div>

      <TextareaField
        label="Address"
        name="address"
        value={formData.address || ''}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        error={errors.address}
        placeholder="Enter customer's address"
        rows={3}
        helpText="Full mailing address (optional)"
      />

      <div className="flex justify-end space-x-3">
        <FormButton type="button" variant="secondary" onClick={() => window.history.back()}>
          Cancel
        </FormButton>
        <FormButton type="submit" loading={isSubmitting || isLoading}>
          {submitLabel}
        </FormButton>
      </div>
    </form>
  );
};
