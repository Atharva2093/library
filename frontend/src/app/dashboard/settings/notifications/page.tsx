'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import type {
  NotificationPreferences,
  NotificationCategory,
  NotificationPriority,
} from '@/lib/types/notifications';

const NotificationPreferencesPage = () => {
  const { preferences, updatePreferences, sendTestNotification, isLoading } = useNotifications();

  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'schedule' | 'test'>(
    'general'
  );

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    if (!localPreferences) return;

    try {
      setIsSaving(true);
      await updatePreferences(localPreferences);
      alert('Notification preferences saved successfully!');
    } catch (error) {
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneralChange = (field: keyof NotificationPreferences, value: any) => {
    if (!localPreferences) return;

    setLocalPreferences({
      ...localPreferences,
      [field]: value,
    });
  };

  const handleCategoryChange = (
    category: NotificationCategory,
    field: 'enabled' | 'priority' | 'channels',
    value: any
  ) => {
    if (!localPreferences) return;

    setLocalPreferences({
      ...localPreferences,
      categories: {
        ...localPreferences.categories,
        [category]: {
          ...localPreferences.categories[category],
          [field]: value,
        },
      },
    });
  };

  const handleQuietHoursChange = (
    field: keyof NonNullable<typeof localPreferences>['quietHours'],
    value: any
  ) => {
    if (!localPreferences) return;

    setLocalPreferences({
      ...localPreferences,
      quietHours: {
        ...localPreferences.quietHours,
        [field]: value,
      },
    });
  };

  const handleFrequencyChange = (
    field: keyof NonNullable<typeof localPreferences>['frequency'],
    value: boolean
  ) => {
    if (!localPreferences) return;

    setLocalPreferences({
      ...localPreferences,
      frequency: {
        ...localPreferences.frequency,
        [field]: value,
      },
    });
  };

  const handleTestNotification = async (type: string) => {
    try {
      await sendTestNotification(type);
      alert(`Test ${type} notification sent!`);
    } catch (error) {
      alert('Failed to send test notification.');
    }
  };

  if (isLoading || !localPreferences) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
      </div>
    );
  }

  const categories: { key: NotificationCategory; label: string; description: string }[] = [
    { key: 'sales', label: 'Sales', description: 'New sales, orders, and transactions' },
    { key: 'inventory', label: 'Inventory', description: 'Stock levels, low inventory alerts' },
    { key: 'customers', label: 'Customers', description: 'New customers, customer updates' },
    { key: 'system', label: 'System', description: 'System updates, maintenance notifications' },
    { key: 'reports', label: 'Reports', description: 'Generated reports and analytics' },
    { key: 'security', label: 'Security', description: 'Security alerts and login notifications' },
    { key: 'maintenance', label: 'Maintenance', description: 'Scheduled maintenance and updates' },
  ];

  const priorities: { key: NotificationPriority; label: string; color: string }[] = [
    { key: 'low', label: 'Low', color: 'text-green-600' },
    { key: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { key: 'high', label: 'High', color: 'text-orange-600' },
    { key: 'urgent', label: 'Urgent', color: 'text-red-600' },
  ];

  const channels = [
    { key: 'email' as const, label: 'Email' },
    { key: 'inapp' as const, label: 'In-App' },
    { key: 'push' as const, label: 'Push' },
    { key: 'sms' as const, label: 'SMS' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Notification Preferences</h1>
        <p className="mt-2 text-sm text-gray-700">
          Configure how and when you receive notifications about your bookstore.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: 'General Settings' },
            { id: 'categories', label: 'Categories' },
            { id: 'schedule', label: 'Schedule' },
            { id: 'test', label: 'Test Notifications' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="rounded-lg bg-white shadow">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6 p-6">
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                General Notification Settings
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.emailNotifications}
                    onChange={e => handleGeneralChange('emailNotifications', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                    <p className="text-sm text-gray-500">Receive browser push notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.pushNotifications}
                    onChange={e => handleGeneralChange('pushNotifications', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      In-App Notifications
                    </label>
                    <p className="text-sm text-gray-500">
                      Show notifications within the application
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.inAppNotifications}
                    onChange={e => handleGeneralChange('inAppNotifications', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md mb-3 font-medium text-gray-900">Quiet Hours</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enable Quiet Hours</label>
                    <p className="text-sm text-gray-500">
                      Suppress notifications during specified hours
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.quietHours.enabled}
                    onChange={e => handleQuietHoursChange('enabled', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>

                {localPreferences.quietHours.enabled && (
                  <div className="ml-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={localPreferences.quietHours.start}
                        onChange={e => handleQuietHoursChange('start', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={localPreferences.quietHours.end}
                        onChange={e => handleQuietHoursChange('end', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        {activeTab === 'categories' && (
          <div className="p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Notification Categories</h3>
            <p className="mb-6 text-sm text-gray-500">
              Configure notification settings for each category of events.
            </p>

            <div className="space-y-6">
              {categories.map(category => (
                <div key={category.key} className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-md font-medium text-gray-900">{category.label}</h4>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={localPreferences.categories[category.key].enabled}
                      onChange={e =>
                        handleCategoryChange(category.key, 'enabled', e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </div>

                  {localPreferences.categories[category.key].enabled && (
                    <div className="ml-6 space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Priority Level
                        </label>
                        <select
                          value={localPreferences.categories[category.key].priority}
                          onChange={e =>
                            handleCategoryChange(
                              category.key,
                              'priority',
                              e.target.value as NotificationPriority
                            )
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        >
                          {priorities.map(priority => (
                            <option key={priority.key} value={priority.key}>
                              {priority.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Delivery Channels
                        </label>
                        <div className="space-y-2">
                          {channels.map(channel => (
                            <div key={channel.key} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={localPreferences.categories[
                                  category.key
                                ].channels.includes(channel.key)}
                                onChange={e => {
                                  const currentChannels =
                                    localPreferences.categories[category.key].channels;
                                  const newChannels = e.target.checked
                                    ? [...currentChannels, channel.key]
                                    : currentChannels.filter(c => c !== channel.key);
                                  handleCategoryChange(category.key, 'channels', newChannels);
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <label className="ml-2 text-sm text-gray-700">{channel.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 p-6">
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900">Notification Frequency</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Immediate Notifications
                    </label>
                    <p className="text-sm text-gray-500">Receive notifications as they occur</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.frequency.immediate}
                    onChange={e => handleFrequencyChange('immediate', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Daily Digest</label>
                    <p className="text-sm text-gray-500">
                      Receive a daily summary of notifications
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.frequency.daily}
                    onChange={e => handleFrequencyChange('daily', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Weekly Summary</label>
                    <p className="text-sm text-gray-500">Receive a weekly summary of activity</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.frequency.weekly}
                    onChange={e => handleFrequencyChange('weekly', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Notifications */}
        {activeTab === 'test' && (
          <div className="p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Test Notifications</h3>
            <p className="mb-6 text-sm text-gray-500">
              Send test notifications to verify your settings are working correctly.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                {
                  type: 'info',
                  label: 'Information',
                  description: 'General information notification',
                },
                {
                  type: 'success',
                  label: 'Success',
                  description: 'Success confirmation notification',
                },
                { type: 'warning', label: 'Warning', description: 'Warning alert notification' },
                { type: 'error', label: 'Error', description: 'Error alert notification' },
                { type: 'sale', label: 'Sale', description: 'New sale notification' },
                {
                  type: 'inventory',
                  label: 'Inventory',
                  description: 'Inventory alert notification',
                },
              ].map(test => (
                <div key={test.type} className="rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900">{test.label}</h4>
                  <p className="mb-3 text-sm text-gray-500">{test.description}</p>
                  <button
                    onClick={() => handleTestNotification(test.type)}
                    className="w-full rounded-md border border-green-300 bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Send Test
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end bg-gray-50 px-6 py-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesPage;
