'use client';

import React, { useState } from 'react';
import { useFormValidation } from '@/lib/validation/hooks';
import { categorySchema, type CategoryFormData } from '@/lib/validation/schemas';
import { InputField, TextareaField, FormButton } from '@/components/ui/FormComponents';

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Category',
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    ...initialData,
  });

  const { errors, isSubmitting, handleSubmit, handleFieldChange, handleFieldBlur } =
    useFormValidation({
      schema: categorySchema,
      onSubmit,
      mode: 'onBlur',
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    handleFieldChange(name as keyof CategoryFormData, value);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleFieldBlur(name as keyof CategoryFormData, value);
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      <InputField
        label="Name"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        error={errors.name}
        required
        placeholder="Enter category name"
        helpText="e.g., Fiction, Science, History, Mystery"
      />

      <TextareaField
        label="Description"
        name="description"
        value={formData.description || ''}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        error={errors.description}
        placeholder="Enter category description"
        rows={4}
        helpText="Brief description of what books belong to this category (optional)"
      />

      {errors.general && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{errors.general}</div>
        </div>
      )}

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
