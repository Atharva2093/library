'use client';

import { useState } from 'react';
import { Users, Plus, Search, Mail, Phone } from 'lucide-react';
import { usePaginatedApi, useSearch } from '@/lib/hooks';
import { customersService } from '@/lib/services';
import type { Customer, CustomerFilters } from '@/lib/types';

const CustomersPage = () => {
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch customers with pagination
  const {
    data: customers,
    pagination,
    loading: customersLoading,
    error: customersError,
    goToPage,
    nextPage,
    prevPage,
    refetch: refetchCustomers,
  } = usePaginatedApi<Customer>(
    (page, size) => customersService.getCustomers({ ...filters, page, size }),
    { pageSize: 12 }
  );

  // Search functionality
  const { results: searchResults, loading: searchLoading } = useSearch<Customer>(q =>
    customersService.searchCustomers(q, 10)
  );

  // Handle search
  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery });
    refetchCustomers();
  };

  // Mock data fallback while API is being set up
  const mockCustomers: Customer[] = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '(555) 123-4567',
      created_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@example.com',
      phone: '(555) 987-6543',
      created_at: '2024-02-20T00:00:00Z',
    },
  ];

  // Use real data if available, otherwise use mock data
  const displayCustomers = customers || mockCustomers;

  return (
    <>
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your customer database, track purchase history, and maintain contact information.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6 rounded-lg bg-white shadow">
        <div className="px-6 py-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-green-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
              placeholder="Search customers by name, email, or phone..."
            />
          </div>
        </div>
      </div>

      {/* Customers grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {customersLoading ? (
          // Loading skeleton
          Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="animate-pulse overflow-hidden rounded-lg bg-white shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 rounded bg-gray-200"></div>
                    <div className="h-3 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            ))
        ) : customersError ? (
          <div className="col-span-3 py-12 text-center">
            <p className="text-gray-500">Error loading customers: {customersError}</p>
            <button onClick={refetchCustomers} className="mt-2 text-green-600 hover:text-green-700">
              Try again
            </button>
          </div>
        ) : (
          displayCustomers.map(customer => (
            <div key={customer.id} className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <h3 className="truncate text-lg font-medium text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-500">
                      Member since {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="mr-2 h-4 w-4" />
                    {customer.email}
                  </div>
                  {customer.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="mr-2 h-4 w-4" />
                      {customer.phone}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 rounded bg-green-600 px-3 py-2 text-sm text-white transition-colors hover:bg-green-700">
                    View Details
                  </button>
                  <button className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={prevPage}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={nextPage}
              disabled={pagination.page >= pagination.pages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(pagination.page - 1) * pagination.size + 1}</span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.size, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={prevPage}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 border-green-500 bg-green-50 text-green-600'
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={nextPage}
                  disabled={pagination.page >= pagination.pages}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Development notice */}
      <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-green-900">Customer Management Preview</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                This is a preview of the customer management interface. Full customer profiles,
                purchase history, and CRM features will be implemented in upcoming phases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomersPage;
