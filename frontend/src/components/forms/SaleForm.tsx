'use client';

import React, { useState, useEffect } from 'react';
import { useFormValidation } from '@/lib/validation/hooks';
import { saleSchema, type SaleFormData } from '@/lib/validation/schemas';
import { InputField, SelectField, FormButton } from '@/components/ui/FormComponents';
import { booksService, customersService } from '@/lib/services';
import type { Book, Customer } from '@/lib/types';

interface SaleFormProps {
  initialData?: Partial<SaleFormData>;
  onSubmit: (data: SaleFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

interface SaleItem {
  book_id: number;
  book_title?: string;
  quantity: number;
  unit_price: number;
}

export const SaleForm: React.FC<SaleFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  submitLabel = 'Record Sale',
}) => {
  const [formData, setFormData] = useState<SaleFormData>({
    customer_id: 0,
    payment_method: 'cash',
    items: [{ book_id: 0, quantity: 1 }],
    ...initialData,
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [books, setBooks] = useState<Book[]>([]);

  const { errors, isSubmitting, handleSubmit, handleFieldChange, handleFieldBlur } =
    useFormValidation({
      schema: saleSchema,
      onSubmit,
      mode: 'onBlur',
    });

  // Load customers and books
  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersData, booksData] = await Promise.all([
          customersService.getCustomers(),
          booksService.getBooks(),
        ]);
        setCustomers(customersData.items || customersData);
        setBooks(booksData.items || booksData);
      } catch (error) {
        console.error('Failed to load form data:', error);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === 'number') {
      processedValue = value === '' ? 0 : parseInt(value);
    }

    const newFormData = { ...formData, [name]: processedValue };
    setFormData(newFormData);
    handleFieldChange(name as keyof SaleFormData, processedValue);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleFieldBlur(name as keyof SaleFormData, value);
  };

  const addItem = () => {
    const newItems = [...formData.items, { book_id: 0, quantity: 1, unit_price: 0 }];
    const newFormData = { ...formData, items: newItems };
    setFormData(newFormData);
    handleFieldChange('items', newItems);
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      const newFormData = { ...formData, items: newItems };
      setFormData(newFormData);
      handleFieldChange('items', newItems);
    }
  };

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-fill when book is selected
    if (field === 'book_id' && value > 0) {
      const selectedBook = books.find(book => book.id === parseInt(value));
      if (selectedBook) {
        // Book selected, but no price/title fields to fill
      }
    }

    const newFormData = { ...formData, items: newItems };
    setFormData(newFormData);
    handleFieldChange('items', newItems);
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'check', label: 'Check' },
    { value: 'digital', label: 'Digital Payment' },
  ];

  const customerOptions = customers.map(customer => ({
    value: customer.id,
    label: `${customer.name} (${customer.email})`,
  }));

  const bookOptions = books.map(book => ({
    value: book.id.toString(),
    label: book.title,
  }));

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SelectField
          label="Customer"
          name="customer_id"
          value={formData.customer_id.toString()}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.customer_id}
          options={customerOptions}
          placeholder="Select a customer"
          required
        />

        <SelectField
          label="Payment Method"
          name="payment_method"
          value={formData.payment_method}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.payment_method}
          options={paymentMethods}
          required
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Sale Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="rounded-lg border border-gray-300 bg-gray-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Item #{index + 1}</h4>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Book <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={item.book_id}
                    onChange={e => updateItem(index, 'book_id', parseInt(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  >
                    <option value={0}>Select a book</option>
                    {books.map(book => (
                      <option key={book.id} value={book.id}>
                        {book.title} - ${book.price.toFixed(2)} (Stock: {book.stock_quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.items && <p className="mt-2 text-sm text-red-600">{errors.items}</p>}
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
