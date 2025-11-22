'use client';

import React, { useState } from 'react';
import { useFormValidation } from '@/lib/validation/hooks';
import { authorSchema, type AuthorFormData } from '@/lib/validation/schemas';
import { InputField, TextareaField, FormButton } from '@/components/ui/FormComponents';

interface AuthorFormProps {
  initialData?: Partial<AuthorFormData>;
  onSubmit: (data: AuthorFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export const AuthorForm: React.FC<AuthorFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Author',
}) => {
  const [formData, setFormData] = useState<AuthorFormData>({
    first_name: '',
    last_name: '',
    biography: '',
    nationality: '',
    website: '',
    ...initialData,
  });

  const { errors, isSubmitting, handleSubmit, handleFieldChange, handleFieldBlur } =
    useFormValidation({
      schema: authorSchema,
      onSubmit,
      mode: 'onBlur',
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    handleFieldChange(name as keyof AuthorFormData, value);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleFieldBlur(name as keyof AuthorFormData, value);
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
          placeholder="Enter author's first name"
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
          placeholder="Enter author's last name"
        />

        <InputField
          label="Nationality"
          name="nationality"
          type="text"
          value={formData.nationality || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.nationality}
          placeholder="e.g., American, British, French"
        />

        <InputField
          label="Website"
          name="website"
          type="url"
          value={formData.website || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.website}
          placeholder="https://example.com"
          helpText="Author's official website (optional)"
        />
      </div>

      <TextareaField
        label="Biography"
        name="biography"
        value={formData.biography || ''}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        error={errors.biography}
        placeholder="Enter author's biography"
        rows={6}
        helpText="Brief biography of the author (optional)"
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
