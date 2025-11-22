'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Book, Users, ShoppingCart, TrendingUp, DollarSign, Package } from 'lucide-react';
import { useApi } from '@/lib/hooks';
import { analyticsService } from '@/lib/services';
import type { DashboardSummary } from '@/lib/types';

const Dashboard = () => {
  const { user } = useAuth();

  // Use API hook to fetch dashboard data
  const {
    data: dashboardData,
    loading,
    error,
    refetch,
  } = useApi<DashboardSummary>(() => analyticsService.getDashboardSummary(), [], {
    immediate: true,
    cache: true,
    cacheKey: 'dashboard-summary',
    cacheTTL: 5, // 5 minutes cache
  });

  // Fallback mock data while API is being set up
  const mockStats = [
    {
      name: 'Total Books',
      value: '2,847',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Book,
    },
    {
      name: 'Active Customers',
      value: '1,423',
      change: '+8%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      name: 'Monthly Sales',
      value: '$45,231',
      change: '+23%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
  ];

  // Dynamic stats from API data
  const stats = dashboardData
    ? [
        {
          name: 'Total Books',
          value: dashboardData.total_books.toLocaleString(),
          change: '+12%',
          changeType: 'positive' as const,
          icon: Book,
        },
        {
          name: 'Active Customers',
          value: dashboardData.total_customers.toLocaleString(),
          change: '+8%',
          changeType: 'positive' as const,
          icon: Users,
        },
        {
          name: 'Total Sales',
          value: dashboardData.total_sales.toLocaleString(),
          change: '+15%',
          changeType: 'positive' as const,
          icon: ShoppingCart,
        },
        {
          name: 'Total Revenue',
          value: `$${dashboardData.total_revenue.toLocaleString()}`,
          change: '+18%',
          changeType: 'positive' as const,
          icon: DollarSign,
        },
        {
          name: 'Low Stock Alert',
          value: dashboardData.low_stock_books.toString(),
          change: dashboardData.low_stock_books > 20 ? '+5%' : '-10%',
          changeType:
            dashboardData.low_stock_books > 20 ? ('negative' as const) : ('positive' as const),
          icon: Package,
        },
      ]
    : mockStats;

  const recentActivity = [
    {
      id: 1,
      type: 'sale',
      description: 'Sale #1234 completed',
      amount: '$89.99',
      time: '2 minutes ago',
    },
    {
      id: 2,
      type: 'book',
      description: 'New book "React Guide" added',
      amount: null,
      time: '15 minutes ago',
    },
    {
      id: 3,
      type: 'customer',
      description: 'New customer registered',
      amount: null,
      time: '1 hour ago',
    },
    {
      id: 4,
      type: 'sale',
      description: 'Sale #1233 completed',
      amount: '$156.50',
      time: '2 hours ago',
    },
    {
      id: 5,
      type: 'book',
      description: 'Book "Python Basics" updated',
      amount: null,
      time: '3 hours ago',
    },
  ];

  return (
    <>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name || user?.email?.split('@')[0]}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here&apos;s what&apos;s happening with your library today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
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

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="flow-root">
            <ul className="divide-y divide-gray-200">
              {recentActivity.map(item => (
                <li key={item.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`h-2 w-2 flex-shrink-0 rounded-full ${
                          item.type === 'sale'
                            ? 'bg-green-400'
                            : item.type === 'book'
                              ? 'bg-blue-400'
                              : 'bg-purple-400'
                        }`}
                      />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        <p className="text-sm text-gray-500">{item.time}</p>
                      </div>
                    </div>
                    {item.amount && (
                      <div className="text-sm font-medium text-gray-900">{item.amount}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700">
                <Book className="mr-2 h-5 w-5" />
                Add Book
              </button>
              <button className="flex items-center justify-center rounded-lg bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700">
                <ShoppingCart className="mr-2 h-5 w-5" />
                New Sale
              </button>
              <button className="flex items-center justify-center rounded-lg bg-purple-600 px-4 py-3 text-white transition-colors hover:bg-purple-700">
                <Users className="mr-2 h-5 w-5" />
                Add Customer
              </button>
              <button className="flex items-center justify-center rounded-lg bg-orange-600 px-4 py-3 text-white transition-colors hover:bg-orange-700">
                <TrendingUp className="mr-2 h-5 w-5" />
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Development Notice */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-blue-600"
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
            <h3 className="text-lg font-medium text-blue-900">Dashboard Navigation Ready</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                The dashboard layout and navigation system is now complete. All sections are
                accessible through the sidebar. Individual page functionality (Books, Customers,
                Sales, etc.) will be implemented in the upcoming phases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
