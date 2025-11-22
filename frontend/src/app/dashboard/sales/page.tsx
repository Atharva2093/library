'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { usePaginatedApi, useApi } from '@/lib/hooks';
import { salesService, analyticsService } from '@/lib/services';
import type { Sale, SaleFilters, SalesStats } from '@/lib/types';

const SalesPage = () => {
  const [filters, setFilters] = useState<SaleFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sales with pagination
  const {
    data: sales,
    pagination,
    loading: salesLoading,
    error: salesError,
    goToPage,
    nextPage,
    prevPage,
    refetch: refetchSales,
  } = usePaginatedApi<Sale>((page, size) => salesService.getSales({ ...filters, page, size }), {
    pageSize: 10,
  });

  // Fetch sales statistics
  const { data: salesStats } = useApi<SalesStats>(() => salesService.getSalesStats(), [], {
    cache: true,
    cacheKey: 'sales-stats',
    cacheTTL: 5,
  });

  // Handle search
  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery });
    refetchSales();
  };

  // Mock data for fallback
  const mockSales: Sale[] = [
    {
      id: 1,
      customer_id: 1,
      total_amount: 34.98,
      sale_date: '2024-01-15T10:30:00Z',
      payment_method: 'credit_card',
      status: 'completed',
      customer: {
        id: 1,
        email: 'alice@example.com',
        name: 'Alice Johnson',
        created_at: '2024-01-01T00:00:00Z',
      },
      items: [
        {
          id: 1,
          book_id: 1,
          quantity: 2,
          unit_price: 17.49,
          total_price: 34.98,
          book: {
            id: 1,
            title: 'To Kill a Mockingbird',
            price: 17.49,
            stock_quantity: 25,
            authors: [],
            categories: [],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        },
      ],
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
    },
  ];

  const mockStats: SalesStats = {
    total_sales: 1234,
    total_revenue: 45678.9,
    average_order_value: 37.02,
    total_customers: 567,
  };

  // Use real data if available, otherwise use mock data
  const displaySales = sales || mockSales;
  const displayStats = salesStats || mockStats;

  const stats = [
    {
      title: "Today's Sales",
      value: `$${displayStats.total_revenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+12.5%',
    },
    {
      title: 'Total Orders',
      value: displayStats.total_sales.toLocaleString(),
      icon: TrendingUp,
      change: '+8.2%',
    },
    {
      title: 'Avg. Order Value',
      value: `$${displayStats.average_order_value.toFixed(2)}`,
      icon: Calendar,
      change: '+15.3%',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track sales transactions, monitor revenue, and analyze customer purchases.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Sale
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">{stat.title}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
              placeholder="Search sales by customer name, transaction ID, or items..."
            />
          </div>
        </div>
      </div>

      {/* Sales table */}
      <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">Recent Sales</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {salesLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="h-4 w-24 rounded bg-gray-200"></div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="h-4 w-32 rounded bg-gray-200"></div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="h-4 w-40 rounded bg-gray-200"></div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="h-4 w-16 rounded bg-gray-200"></div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="h-4 w-20 rounded bg-gray-200"></div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="h-4 w-16 rounded bg-gray-200"></div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="h-4 w-24 rounded bg-gray-200"></div>
                        </td>
                      </tr>
                    ))
                ) : salesError ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Error loading sales: {salesError}
                      <button
                        onClick={refetchSales}
                        className="ml-2 text-green-600 hover:text-green-700"
                      >
                        Try again
                      </button>
                    </td>
                  </tr>
                ) : (
                  displaySales.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        #{sale.id.toString().padStart(6, '0')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                              <ShoppingCart className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {sale.customer.name}
                            </div>
                            <div className="text-sm text-gray-500">{sale.customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {sale.items.length === 1
                            ? sale.items[0].book.title
                            : `${sale.items.length} items`}
                        </div>
                        {sale.items.length > 1 && (
                          <div className="text-xs text-gray-500">
                            {sale.items.map(item => item.book.title).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        ${sale.total_amount.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(sale.status)}`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <button className="mr-3 text-green-600 hover:text-green-900">View</button>
                        <button className="mr-3 text-blue-600 hover:text-blue-900">Refund</button>
                        <button className="text-gray-600 hover:text-gray-900">Print</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
            <h3 className="text-lg font-medium text-green-900">Sales Tracking Preview</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                This is a preview of the sales management interface. Features like POS integration,
                payment processing, and detailed sales analytics will be implemented in upcoming
                phases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesPage;
