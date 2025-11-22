'use client';

import { Settings, User, Lock, Bell, Database, Palette, Globe, Shield } from 'lucide-react';

const SettingsPage = () => {
  return (
    <>
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your account preferences, system configuration, and application settings.
          </p>
        </div>
      </div>

      {/* Settings grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center">
              <User className="mr-3 h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
            </div>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                defaultValue="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                defaultValue="john@bookstore.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                defaultValue="(555) 123-4567"
              />
            </div>
            <div className="pt-4">
              <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                Update Profile
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center">
              <Lock className="mr-3 h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Security</h3>
            </div>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label className="ml-2 text-sm text-gray-700">Enable two-factor authentication</label>
            </div>
            <div className="pt-4">
              <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center">
              <Bell className="mr-3 h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            </div>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Low Stock Alerts</p>
                <p className="text-xs text-gray-500">Alert when inventory is low</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Sales Reports</p>
                <p className="text-xs text-gray-500">Daily sales summary emails</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">New Customer Alerts</p>
                <p className="text-xs text-gray-500">Notify when new customers register</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                defaultChecked
              />
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center">
              <Settings className="mr-3 h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">System Preferences</h3>
            </div>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC-6 (Central Time)</option>
                <option>UTC-7 (Mountain Time)</option>
                <option>UTC-8 (Pacific Time)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Format</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>CAD (C$)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Settings Sections */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Theme Settings */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center">
              <Palette className="mr-3 h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                  defaultChecked
                />
                <label className="ml-3 text-sm text-gray-700">Light theme</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <label className="ml-3 text-sm text-gray-700">Dark theme</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="auto"
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <label className="ml-3 text-sm text-gray-700">Auto (system)</label>
              </div>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center">
              <Shield className="mr-3 h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Privacy</h3>
            </div>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Analytics</p>
                <p className="text-xs text-gray-500">Help improve the app</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Error Reports</p>
                <p className="text-xs text-gray-500">Send crash reports</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                defaultChecked
              />
            </div>
            <div className="pt-2">
              <button className="text-sm text-green-600 hover:text-green-700">
                Download my data
              </button>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center">
              <Database className="mr-3 h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Backup</h3>
            </div>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <p className="text-sm text-gray-700">Last backup: January 15, 2024</p>
              <p className="text-xs text-gray-500">Automatic backups enabled</p>
            </div>
            <div className="space-y-2">
              <button className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                Create Backup
              </button>
              <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Restore from Backup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Development notice */}
      <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Settings className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-green-900">Settings Configuration Preview</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                This settings panel provides a preview of configuration options. Advanced features
                like API integrations, custom themes, and detailed system administration will be
                implemented in upcoming phases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
