'use client';

import React, { useState, useEffect } from 'react';
import { useFormValidation } from '@/lib/validation/hooks';
import { bookSchema, type BookFormData } from '@/lib/validation/schemas';
import { InputField, TextareaField, SelectField, FormButton } from '@/components/ui/FormComponents';
import { authorsService, categoriesService } from '@/lib/services';
import type { Author, Category } from '@/lib/types';

interface BookFormProps {
  initialData?: Partial<BookFormData>;
  onSubmit: (data: BookFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export const BookForm: React.FC<BookFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Book',
}) => {
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    isbn: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    publication_date: '',
    publisher: '',
    language: 'English',
    pages: undefined,
    format: 'paperback',
    author_ids: [],
    category_ids: [],
    ...initialData,
  });

  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const { errors, isSubmitting, handleSubmit, handleFieldChange, handleFieldBlur } =
    useFormValidation({
      schema: bookSchema,
      onSubmit,
      mode: 'onBlur',
    });

  // Load authors and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [authorsData, categoriesData] = await Promise.all([
          authorsService.getAuthors(),
          categoriesService.getCategories(),
        ]);
        setAuthors(authorsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load form data:', error);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    // Handle different input types
    if (type === 'number') {
      processedValue = value === '' ? 0 : parseFloat(value);
    }

    const newFormData = { ...formData, [name]: processedValue };
    setFormData(newFormData);
    handleFieldChange(name as keyof BookFormData, processedValue);
  };

  const handleSelectChange = (name: string, value: string | number[]) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    handleFieldChange(name as keyof BookFormData, value);
  };

  const handleInputBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    handleFieldBlur(name as keyof BookFormData, value);
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
  };

  const formatOptions = [
    { value: 'hardcover', label: 'Hardcover' },
    { value: 'paperback', label: 'Paperback' },
    { value: 'ebook', label: 'E-book' },
    { value: 'audiobook', label: 'Audiobook' },
  ];

  const authorOptions = authors.map(author => ({
    value: author.id,
    label: author.name,
  }));

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <InputField
          label="Title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.title}
          required
          placeholder="Enter book title"
        />

        <InputField
          label="ISBN"
          name="isbn"
          type="text"
          value={formData.isbn || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.isbn}
          placeholder="Enter ISBN (optional)"
          helpText="Format: 978-0-123-45678-9"
        />

        <InputField
          label="Price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.price}
          required
          placeholder="0.00"
        />

        <InputField
          label="Stock Quantity"
          name="stock_quantity"
          type="number"
          min="0"
          value={formData.stock_quantity}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.stock_quantity}
          required
          placeholder="0"
        />

        <InputField
          label="Publisher"
          name="publisher"
          type="text"
          value={formData.publisher || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.publisher}
          placeholder="Enter publisher"
        />

        <InputField
          label="Language"
          name="language"
          type="text"
          value={formData.language || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.language}
          placeholder="English"
        />

        <InputField
          label="Pages"
          name="pages"
          type="number"
          min="1"
          value={formData.pages || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.pages}
          placeholder="Number of pages"
        />

        <InputField
          label="Publication Date"
          name="publication_date"
          type="date"
          value={formData.publication_date || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.publication_date}
        />

        <SelectField
          label="Format"
          name="format"
          value={formData.format || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.format}
          options={formatOptions}
          placeholder="Select format"
        />
      </div>

      <TextareaField
        label="Description"
        name="description"
        value={formData.description || ''}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        error={errors.description}
        placeholder="Enter book description"
        rows={4}
        helpText="Brief description of the book (optional)"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Authors <span className="text-red-500">*</span>
          </label>
          <select
            multiple
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            value={formData.author_ids.map(String)}
            onChange={e => {
              const selectedIds = Array.from(e.target.selectedOptions, option =>
                parseInt(option.value)
              );
              handleSelectChange('author_ids', selectedIds);
            }}
            size={Math.min(authors.length, 5)}
          >
            {authors.map(author => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          {errors.author_ids && <p className="mt-1 text-sm text-red-600">{errors.author_ids}</p>}
          <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple authors</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Categories <span className="text-red-500">*</span>
          </label>
          <select
            multiple
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            value={formData.category_ids.map(String)}
            onChange={e => {
              const selectedIds = Array.from(e.target.selectedOptions, option =>
                parseInt(option.value)
              );
              handleSelectChange('category_ids', selectedIds);
            }}
            size={Math.min(categories.length, 5)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_ids && (
            <p className="mt-1 text-sm text-red-600">{errors.category_ids}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple categories</p>
        </div>
      </div>

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
