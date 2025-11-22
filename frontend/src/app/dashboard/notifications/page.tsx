'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationBell } from '@/components/ui/NotificationComponents';
import {
  Bell,
  Settings,
  Activity,
  Mail,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

const NotificationDashboard = () => {
  const { notifications, stats, isLoading } = useNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'recent' | 'settings'>('overview');

  const recentNotifications = notifications.slice(0, 5);

  const priorityStats = {
    urgent: notifications.filter(n => n.priority === 'urgent').length,
    high: notifications.filter(n => n.priority === 'high').length,
    medium: notifications.filter(n => n.priority === 'medium').length,
    low: notifications.filter(n => n.priority === 'low').length,
  };

  const categoryStats = {
    sales: notifications.filter(n => n.category === 'sales').length,
    inventory: notifications.filter(n => n.category === 'inventory').length,
    customers: notifications.filter(n => n.category === 'customers').length,
    system: notifications.filter(n => n.category === 'system').length,
    security: notifications.filter(n => n.category === 'security').length,
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notification Center</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor and manage all notifications across your bookstore.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <NotificationBell notifications={notifications} />
          <Link
            href="/dashboard/settings/notifications"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bell className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Total Notifications
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Unread</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.unread || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">High Priority</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {priorityStats.urgent + priorityStats.high}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Today</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.today || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'recent', label: 'Recent Notifications', icon: Bell },
            { id: 'settings', label: 'Quick Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group inline-flex items-center border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Icon
                  className={`-ml-0.5 mr-2 h-4 w-4 ${
                    activeTab === tab.id
                      ? 'text-green-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Priority Distribution */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Priority Distribution</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{priorityStats.urgent}</div>
                  <div className="text-sm text-gray-500">Urgent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{priorityStats.high}</div>
                  <div className="text-sm text-gray-500">High</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{priorityStats.medium}</div>
                  <div className="text-sm text-gray-500">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{priorityStats.low}</div>
                  <div className="text-sm text-gray-500">Low</div>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Notifications by Category</h3>
              <div className="space-y-3">
                {Object.entries(categoryStats).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize text-gray-900">{category}</span>
                    <div className="flex items-center">
                      <div className="mr-3 h-2 w-20 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{
                            width: `${Math.min((count / Math.max(...Object.values(categoryStats))) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="w-8 text-right text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Link
                  href="/dashboard/activity"
                  className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-green-500 hover:bg-green-50"
                >
                  <Activity className="mr-3 h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">View Activity Feed</div>
                    <div className="text-sm text-gray-500">See all recent activities</div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/settings/notifications"
                  className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-green-500 hover:bg-green-50"
                >
                  <Settings className="mr-3 h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Manage Settings</div>
                    <div className="text-sm text-gray-500">Configure preferences</div>
                  </div>
                </Link>

                <button className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-green-500 hover:bg-green-50">
                  <CheckCircle className="mr-3 h-6 w-6 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Mark All Read</div>
                    <div className="text-sm text-gray-500">Clear unread status</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Notifications Tab */}
        {activeTab === 'recent' && (
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Notifications</h3>
            </div>

            <div className="divide-y divide-gray-200">
              {recentNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No recent notifications.</div>
              ) : (
                recentNotifications.map(notification => (
                  <div key={notification.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${
                          notification.read ? 'bg-gray-300' : 'bg-blue-500'
                        }`}
                      ></div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                            <p className="mt-2 text-xs text-gray-400">
                              {formatTimeAgo(new Date(notification.timestamp))}
                            </p>
                          </div>

                          <div className="ml-4 flex-shrink-0">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 5 && (
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
                <Link
                  href="/dashboard/activity"
                  className="text-sm font-medium text-green-600 hover:text-green-500"
                >
                  View all notifications →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Quick Toggle Settings */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Quick Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Email Notifications</div>
                    <div className="text-sm text-gray-500">Receive notifications via email</div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Push Notifications</div>
                    <div className="text-sm text-gray-500">Browser push notifications</div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Daily Digest</div>
                    <div className="text-sm text-gray-500">Daily summary email</div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Sound Alerts</div>
                    <div className="text-sm text-gray-500">Play sound for urgent notifications</div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <Link
                  href="/dashboard/settings/notifications"
                  className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Advanced Settings
                </Link>
              </div>
            </div>

            {/* Notification Categories */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Notification Categories</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { key: 'sales', label: 'Sales & Orders', icon: '💰' },
                  { key: 'inventory', label: 'Inventory Alerts', icon: '📦' },
                  { key: 'customers', label: 'Customer Updates', icon: '👥' },
                  { key: 'system', label: 'System Notifications', icon: '⚙️' },
                  { key: 'security', label: 'Security Alerts', icon: '🔒' },
                  { key: 'reports', label: 'Reports & Analytics', icon: '📊' },
                ].map(category => (
                  <div
                    key={category.key}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center">
                      <span className="mr-3 text-lg">{category.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{category.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDashboard;
