'use client';

import React from 'react';

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            View comprehensive reports, analytics, and export data for your bookstore.
          </p>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Reports Dashboard</h3>
        <p className="text-gray-600">
          This section will contain detailed reports and analytics for your bookstore. Features will
          include sales reports, inventory analytics, and customer insights.
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;
