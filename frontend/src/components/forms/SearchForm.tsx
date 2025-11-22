'use client';

import React, { useState } from 'react';
import { useFormValidation } from '@/lib/validation/hooks';
import { searchSchema, type SearchFormData } from '@/lib/validation/schemas';
import { InputField, FormButton } from '@/components/ui/FormComponents';

interface SearchFormProps {
  onSubmit: (data: SearchFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<SearchFormData>;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onSubmit,
  isLoading = false,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<SearchFormData>({
    query: '',
    ...initialData,
  });

  const { errors, isSubmitting, handleSubmit, handleFieldChange, handleFieldBlur } =
    useFormValidation({
      schema: searchSchema,
      onSubmit,
      mode: 'onChange',
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    handleFieldChange(name as keyof SearchFormData, value);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleFieldBlur(name as keyof SearchFormData, value);
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
  };

  const handleClearFilters = () => {
    const clearedData = { query: '' };
    setFormData(clearedData);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <form onSubmit={onFormSubmit} className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <InputField
              label=""
              name="query"
              type="text"
              value={formData.query}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              error={errors.query}
              placeholder="Search for books, authors, or ISBNs..."
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <FormButton type="submit" loading={isSubmitting || isLoading} className="px-6">
              Search
            </FormButton>

            <FormButton type="button" variant="secondary" onClick={handleClearFilters}>
              Clear
            </FormButton>
          </div>
        </div>

        {errors.general && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{errors.general}</div>
          </div>
        )}
      </form>
    </div>
  );
};
