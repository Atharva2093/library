'use client';

import React, { useState } from 'react';
import {
  LoginForm,
  RegisterForm,
  PasswordResetForm,
  BookForm,
  AuthorForm,
  CategoryForm,
  CustomerForm,
  SaleForm,
  SearchForm,
} from '@/components/forms';
import type {
  LoginFormData,
  UserRegistrationData,
  PasswordResetData,
  BookFormData,
  AuthorFormData,
  CategoryFormData,
  CustomerFormData,
  SaleFormData,
  SearchFormData,
} from '@/lib/validation/schemas';

const FormExample: React.FC = () => {
  const [activeForm, setActiveForm] = useState<string>('login');

  // Mock submit handlers for demonstration
  const handleLoginSubmit = async (data: LoginFormData) => {
    console.log('Login data:', data);
    alert('Login form submitted! Check console for data.');
  };

  const handleRegisterSubmit = async (data: UserRegistrationData) => {
    console.log('Registration data:', data);
    alert('Registration form submitted! Check console for data.');
  };

  const handlePasswordResetSubmit = async (data: PasswordResetData) => {
    console.log('Password reset data:', data);
    alert('Password reset form submitted! Check console for data.');
  };

  const handleBookSubmit = async (data: BookFormData) => {
    console.log('Book data:', data);
    alert('Book form submitted! Check console for data.');
  };

  const handleAuthorSubmit = async (data: AuthorFormData) => {
    console.log('Author data:', data);
    alert('Author form submitted! Check console for data.');
  };

  const handleCategorySubmit = async (data: CategoryFormData) => {
    console.log('Category data:', data);
    alert('Category form submitted! Check console for data.');
  };

  const handleCustomerSubmit = async (data: CustomerFormData) => {
    console.log('Customer data:', data);
    alert('Customer form submitted! Check console for data.');
  };

  const handleSaleSubmit = async (data: SaleFormData) => {
    console.log('Sale data:', data);
    alert('Sale form submitted! Check console for data.');
  };

  const handleSearchSubmit = async (data: SearchFormData) => {
    console.log('Search data:', data);
    alert('Search form submitted! Check console for data.');
  };

  const forms = [
    { id: 'login', name: 'Login Form', component: <LoginForm onSubmit={handleLoginSubmit} /> },
    {
      id: 'register',
      name: 'Registration Form',
      component: <RegisterForm onSubmit={handleRegisterSubmit} />,
    },
    {
      id: 'reset',
      name: 'Password Reset Form',
      component: <PasswordResetForm onSubmit={handlePasswordResetSubmit} />,
    },
    { id: 'book', name: 'Book Form', component: <BookForm onSubmit={handleBookSubmit} /> },
    { id: 'author', name: 'Author Form', component: <AuthorForm onSubmit={handleAuthorSubmit} /> },
    {
      id: 'category',
      name: 'Category Form',
      component: <CategoryForm onSubmit={handleCategorySubmit} />,
    },
    {
      id: 'customer',
      name: 'Customer Form',
      component: <CustomerForm onSubmit={handleCustomerSubmit} />,
    },
    { id: 'sale', name: 'Sale Form', component: <SaleForm onSubmit={handleSaleSubmit} /> },
    { id: 'search', name: 'Search Form', component: <SearchForm onSubmit={handleSearchSubmit} /> },
  ];

  const activeFormData = forms.find(form => form.id === activeForm);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Form Validation Examples</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive form validation system with Zod schemas and real-time validation
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Form Navigation */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Available Forms</h2>
              <nav className="space-y-2">
                {forms.map(form => (
                  <button
                    key={form.id}
                    onClick={() => setActiveForm(form.id)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      activeForm === form.id
                        ? 'border-l-4 border-green-500 bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {form.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-6 rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                  Real-time validation
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                  TypeScript type safety
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                  Zod schema validation
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                  Consistent error handling
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                  Loading states
                </li>
                <li className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                  Accessibility features
                </li>
              </ul>
            </div>
          </div>

          {/* Form Display */}
          <div className="lg:col-span-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">{activeFormData?.name}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  This form demonstrates real-time validation with error handling and loading
                  states. Submit the form to see the data logged to the console.
                </p>
              </div>

              <div className="max-w-2xl">{activeFormData?.component}</div>
            </div>

            <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    <p>
                      These forms are for demonstration purposes. Form submissions will show alerts
                      and log data to the console. In a real application, these would integrate with
                      your API endpoints.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormExample;
