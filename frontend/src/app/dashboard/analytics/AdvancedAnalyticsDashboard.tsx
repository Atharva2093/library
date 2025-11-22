'use client';

import React, { useState, useEffect } from 'react';
import { KPIDashboard } from '@/components/dashboard/KPIDashboard';
import {
  LineChartComponent,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
  TreemapChart,
  KPICard,
  GaugeChart,
  MetricTrend,
} from '@/components/ui/ChartComponents';
import AnalyticsService from '@/lib/services/analyticsService';
import type {
  SalesAnalytics,
  CustomerAnalytics,
  InventoryAnalytics,
  FinancialAnalytics,
  OperationalAnalytics,
  BusinessInsight,
  DateRange,
} from '@/lib/types/analytics';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  PieChart,
  Activity,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';

const analyticsService = new AnalyticsService();

const AdvancedAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sales' | 'customers' | 'inventory' | 'financial' | 'operations'
  >('overview');
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 30 Days',
  });

  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [inventoryAnalytics, setInventoryAnalytics] = useState<InventoryAnalytics | null>(null);
  const [financialAnalytics, setFinancialAnalytics] = useState<FinancialAnalytics | null>(null);
  const [operationalAnalytics, setOperationalAnalytics] = useState<OperationalAnalytics | null>(
    null
  );
  const [businessInsights, setBusinessInsights] = useState<BusinessInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const dateRangeOptions = [
    { value: 'today', label: 'Today', days: 1 },
    { value: 'week', label: 'Last 7 Days', days: 7 },
    { value: 'month', label: 'Last 30 Days', days: 30 },
    { value: 'quarter', label: 'Last 3 Months', days: 90 },
    { value: 'year', label: 'Last Year', days: 365 },
  ];

  useEffect(() => {
    loadAllAnalytics();
  }, [dateRange]);

  const loadAllAnalytics = async () => {
    setIsLoading(true);
    try {
      const [sales, customers, inventory, financial, operational, insights] = await Promise.all([
        analyticsService.getSalesAnalytics(dateRange),
        analyticsService.getCustomerAnalytics(dateRange),
        analyticsService.getInventoryAnalytics(dateRange),
        analyticsService.getFinancialAnalytics(dateRange),
        analyticsService.getOperationalAnalytics(dateRange),
        analyticsService.getBusinessInsights(),
      ]);

      setSalesAnalytics(sales);
      setCustomerAnalytics(customers);
      setInventoryAnalytics(inventory);
      setFinancialAnalytics(financial);
      setOperationalAnalytics(operational);
      setBusinessInsights(insights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (option: (typeof dateRangeOptions)[0]) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - option.days);

    setDateRange({
      start,
      end,
      label: option.label,
    });
  };

  const exportData = () => {
    // Simulate data export
    const data = {
      sales: salesAnalytics,
      customers: customerAnalytics,
      inventory: inventoryAnalytics,
      financial: financialAnalytics,
      operational: operationalAnalytics,
      insights: businessInsights,
      dateRange,
      exportedAt: new Date(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange.label.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'operations', label: 'Operations', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Comprehensive business intelligence and performance metrics
          </p>
        </div>

        <div className="mt-4 flex items-center space-x-4 sm:mt-0">
          {/* Date Range Selector */}
          <div className="relative">
            <select
              onChange={e => {
                const option = dateRangeOptions.find(opt => opt.value === e.target.value);
                if (option) handleDateRangeChange(option);
              }}
              className="appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Calendar className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadAllAnalytics}
            disabled={isLoading}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Export Button */}
          <button
            onClick={exportData}
            className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500">Last updated: {lastUpdated.toLocaleString()}</div>

      {/* Business Insights */}
      {businessInsights.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex items-start">
            <Lightbulb className="mt-0.5 h-5 w-5 text-blue-500" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">Business Insights</h3>
              <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                {businessInsights.slice(0, 2).map(insight => (
                  <div key={insight.id} className="rounded-md border border-blue-200 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                          insight.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : insight.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group inline-flex items-center whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium ${
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
        {activeTab === 'overview' && <KPIDashboard dateRange={dateRange} />}

        {activeTab === 'sales' && salesAnalytics && (
          <div className="space-y-6">
            {/* Sales KPIs */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Total Revenue"
                value={salesAnalytics.totalRevenue.value}
                change={salesAnalytics.totalRevenue.changePercentage}
                trend={salesAnalytics.totalRevenue.trend}
                format="currency"
                icon={<DollarSign className="h-6 w-6" />}
              />
              <KPICard
                title="Total Orders"
                value={salesAnalytics.totalOrders.value}
                change={salesAnalytics.totalOrders.changePercentage}
                trend={salesAnalytics.totalOrders.trend}
                format="number"
                icon={<BarChart3 className="h-6 w-6" />}
              />
              <KPICard
                title="Average Order Value"
                value={salesAnalytics.averageOrderValue.value}
                change={salesAnalytics.averageOrderValue.changePercentage}
                trend={salesAnalytics.averageOrderValue.trend}
                format="currency"
                icon={<TrendingUp className="h-6 w-6" />}
              />
              <KPICard
                title="Conversion Rate"
                value={salesAnalytics.conversionRate.value}
                change={salesAnalytics.conversionRate.changePercentage}
                trend={salesAnalytics.conversionRate.trend}
                format="percentage"
                icon={<Target className="h-6 w-6" />}
              />
            </div>

            {/* Sales Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Sales Trend</h3>
                <LineChartComponent
                  data={salesAnalytics.salesByTimeOfDay}
                  height={300}
                  lines={[{ key: 'value', color: '#10b981' }]}
                />
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Sales by Category</h3>
                <PieChartComponent
                  data={salesAnalytics.salesByCategory}
                  height={300}
                  donut={true}
                />
              </div>
            </div>

            {/* Top Products Table */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Sales
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Growth
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {salesAnalytics.topProducts.slice(0, 5).map((product, index) => (
                        <tr key={product.productId}>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName}
                            </div>
                            <div className="text-sm text-gray-500">#{product.rank}</div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {product.category}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {product.units}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            ${product.revenue.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                product.growth > 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {product.growth > 0 ? '+' : ''}
                              {product.growth.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add simplified versions of other tabs due to length constraints */}
        {activeTab !== 'overview' && activeTab !== 'sales' && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold capitalize text-gray-900">
              {activeTab} Analytics
            </h3>
            <p className="text-gray-600">
              Detailed {activeTab} analytics dashboard will be displayed here with comprehensive
              charts, metrics, and insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
