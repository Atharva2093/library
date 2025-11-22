'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import type {
  ActivityItem,
  NotificationCategory,
  NotificationPriority,
} from '@/lib/types/notifications';
import {
  Clock,
  User,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Shield,
  Wrench,
  FileText,
  AlertTriangle,
} from 'lucide-react';

const ActivityFeedPage = () => {
  const { getActivityFeed, markNotificationAsRead, isLoading } = useNotifications();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [filters, setFilters] = useState({
    category: 'all' as NotificationCategory | 'all',
    priority: 'all' as NotificationPriority | 'all',
    dateRange: '7days' as '1day' | '7days' | '30days' | 'all',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadActivityFeed();
  }, [page]);

  useEffect(() => {
    applyFilters();
  }, [activities, filters]);

  const loadActivityFeed = async () => {
    try {
      const response = await getActivityFeed({
        page,
        pageSize,
        category: filters.category !== 'all' ? filters.category : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
        startDate: getDateFromRange(filters.dateRange)?.toISOString(),
      });

      setActivities(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load activity feed:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        activity =>
          activity.title.toLowerCase().includes(searchLower) ||
          activity.description.toLowerCase().includes(searchLower) ||
          (activity.user?.full_name || '').toLowerCase().includes(searchLower)
      );
    }

    setFilteredActivities(filtered);
  };

  const getDateFromRange = (range: string): Date | undefined => {
    const now = new Date();
    switch (range) {
      case '1day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return undefined;
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    const iconProps = { className: 'h-5 w-5' };
    switch (category) {
      case 'sales':
        return <ShoppingCart {...iconProps} />;
      case 'inventory':
        return <Package {...iconProps} />;
      case 'customers':
        return <Users {...iconProps} />;
      case 'system':
        return <Settings {...iconProps} />;
      case 'reports':
        return <FileText {...iconProps} />;
      case 'security':
        return <Shield {...iconProps} />;
      case 'maintenance':
        return <Wrench {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleActivityClick = async (activity: ActivityItem) => {
    if (activity.notificationId) {
      try {
        await markNotificationAsRead(parseInt(activity.notificationId));
        // Update the activity in the list
        setActivities(prev => prev.map(a => (a.id === activity.id ? { ...a, read: true } : a)));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const activityStats = {
    total: activities.length,
    unread: activities.filter(a => !a.read).length,
    urgent: activities.filter(a => a.priority === 'urgent').length,
    today: activities.filter(a => {
      const today = new Date();
      const activityDate = new Date(a.timestamp);
      return activityDate.toDateString() === today.toDateString();
    }).length,
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Activity Feed</h1>
        <p className="mt-2 text-sm text-gray-700">
          Track all activities and events in your bookstore management system.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Total Activities</dt>
                  <dd className="text-lg font-medium text-gray-900">{activityStats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Unread</dt>
                  <dd className="text-lg font-medium text-gray-900">{activityStats.unread}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Urgent</dt>
                  <dd className="text-lg font-medium text-gray-900">{activityStats.urgent}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Today</dt>
                  <dd className="text-lg font-medium text-gray-900">{activityStats.today}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Filters</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Search */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search activities..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select
                value={filters.category}
                onChange={e => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              >
                <option value="all">All Categories</option>
                <option value="sales">Sales</option>
                <option value="inventory">Inventory</option>
                <option value="customers">Customers</option>
                <option value="system">System</option>
                <option value="reports">Reports</option>
                <option value="security">Security</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={filters.priority}
                onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={e => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              >
                <option value="1day">Last 24 hours</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Activities ({filteredActivities.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredActivities.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No activities found matching your filters.
            </div>
          ) : (
            filteredActivities.map(activity => (
              <div
                key={activity.id}
                onClick={() => handleActivityClick(activity)}
                className={`cursor-pointer p-6 transition-colors hover:bg-gray-50 ${
                  !activity.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 rounded-full p-2 ${getPriorityColor(activity.priority)}`}
                  >
                    {getCategoryIcon(activity.category)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${!activity.read ? 'text-gray-900' : 'text-gray-700'}`}
                        >
                          {activity.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">{activity.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                          <span className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            {activity.user?.full_name || 'Unknown'}
                          </span>
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatTimeAgo(new Date(activity.timestamp))}
                          </span>
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <span className="text-gray-400">
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {value}
                                </span>
                              ))}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Priority Badge */}
                      <div className="ml-4 flex-shrink-0">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(activity.priority)}`}
                        >
                          {activity.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="ml-14 mt-3 text-xs text-gray-400">
                  {formatTimestamp(new Date(activity.timestamp))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Next
              </button>
            </div>

            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeedPage;
