'use client';

import React, { useState, useEffect } from 'react';
import {
  KPICard,
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
  GaugeChart,
  MetricTrend,
} from '@/components/ui/ChartComponents';
import AnalyticsService from '@/lib/services/analyticsService';
import type {
  KPIMetric,
  SalesAnalytics,
  CustomerAnalytics,
  InventoryAnalytics,
  FinancialAnalytics,
  OperationalAnalytics,
  DateRange,
  TimeSeriesData,
  CategoryData,
} from '@/lib/types/analytics';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

interface KPIDashboardProps {
  dateRange: DateRange;
  refreshInterval?: number;
  className?: string;
}

const analyticsService = new AnalyticsService();

export const KPIDashboard: React.FC<KPIDashboardProps> = ({
  dateRange,
  refreshInterval = 30000,
  className = '',
}) => {
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [inventoryAnalytics, setInventoryAnalytics] = useState<InventoryAnalytics | null>(null);
  const [financialAnalytics, setFinancialAnalytics] = useState<FinancialAnalytics | null>(null);
  const [operationalAnalytics, setOperationalAnalytics] = useState<OperationalAnalytics | null>(
    null
  );
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(loadAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [dateRange, refreshInterval]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [sales, customers, inventory, financial, operational, kpis] = await Promise.all([
        analyticsService.getSalesAnalytics(dateRange),
        analyticsService.getCustomerAnalytics(dateRange),
        analyticsService.getInventoryAnalytics(dateRange),
        analyticsService.getFinancialAnalytics(dateRange),
        analyticsService.getOperationalAnalytics(dateRange),
        analyticsService.getKPIMetrics(),
      ]);

      setSalesAnalytics(sales);
      setCustomerAnalytics(customers);
      setInventoryAnalytics(inventory);
      setFinancialAnalytics(financial);
      setOperationalAnalytics(operational);
      setKpiMetrics(kpis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={loadAnalytics}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Primary KPIs */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {salesAnalytics && (
            <KPICard
              title="Total Revenue"
              value={salesAnalytics.totalRevenue.value}
              change={salesAnalytics.totalRevenue.changePercentage}
              trend={salesAnalytics.totalRevenue.trend}
              format="currency"
              icon={<DollarSign className="h-6 w-6" />}
              color="#10b981"
            />
          )}

          {salesAnalytics && (
            <KPICard
              title="Total Orders"
              value={salesAnalytics.totalOrders.value}
              change={salesAnalytics.totalOrders.changePercentage}
              trend={salesAnalytics.totalOrders.trend}
              format="number"
              icon={<ShoppingCart className="h-6 w-6" />}
              color="#3b82f6"
            />
          )}

          {customerAnalytics && (
            <KPICard
              title="Active Customers"
              value={customerAnalytics.activeCustomers.value}
              change={customerAnalytics.activeCustomers.changePercentage}
              trend={customerAnalytics.activeCustomers.trend}
              format="number"
              icon={<Users className="h-6 w-6" />}
              color="#f59e0b"
            />
          )}

          {inventoryAnalytics && (
            <KPICard
              title="Total Products"
              value={inventoryAnalytics.totalProducts.value}
              change={inventoryAnalytics.totalProducts.changePercentage}
              trend={inventoryAnalytics.totalProducts.trend}
              format="number"
              icon={<Package className="h-6 w-6" />}
              color="#8b5cf6"
            />
          )}
        </div>
      </div>

      {/* Secondary KPIs */}
      <div>
        <h3 className="text-md mb-4 font-semibold text-gray-900">Performance Metrics</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {salesAnalytics && (
            <MetricTrend
              title="Average Order Value"
              metric={salesAnalytics.averageOrderValue}
              format="currency"
            />
          )}

          {salesAnalytics && (
            <MetricTrend
              title="Conversion Rate"
              metric={salesAnalytics.conversionRate}
              format="percentage"
            />
          )}

          {customerAnalytics && (
            <MetricTrend
              title="Customer Retention"
              metric={customerAnalytics.customerRetention}
              format="percentage"
              showTarget={true}
            />
          )}

          {inventoryAnalytics && (
            <MetricTrend
              title="Inventory Turnover"
              metric={inventoryAnalytics.turnoverRate}
              format="number"
            />
          )}
        </div>
      </div>

      {/* Operational KPIs */}
      {operationalAnalytics && (
        <div>
          <h3 className="text-md mb-4 font-semibold text-gray-900">Operational Excellence</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <GaugeChart
              title="System Uptime"
              value={operationalAnalytics.systemUptime.value}
              min={95}
              max={100}
              unit="%"
              thresholds={[
                { value: 97, color: '#ef4444', label: 'Critical' },
                { value: 99, color: '#f59e0b', label: 'Warning' },
                { value: 100, color: '#10b981', label: 'Excellent' },
              ]}
            />

            <GaugeChart
              title="Customer Satisfaction"
              value={operationalAnalytics.customerSatisfaction.value}
              min={0}
              max={5}
              unit="/5"
              thresholds={[
                { value: 3, color: '#ef4444', label: 'Poor' },
                { value: 4, color: '#f59e0b', label: 'Good' },
                { value: 5, color: '#10b981', label: 'Excellent' },
              ]}
            />

            <GaugeChart
              title="Staff Productivity"
              value={operationalAnalytics.staffProductivity.value}
              min={0}
              max={100}
              unit="%"
              thresholds={[
                { value: 60, color: '#ef4444', label: 'Low' },
                { value: 80, color: '#f59e0b', label: 'Medium' },
                { value: 100, color: '#10b981', label: 'High' },
              ]}
            />

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-center">
                <Clock className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                <p className="text-sm font-medium text-gray-600">Order Fulfillment</p>
                <p className="text-2xl font-bold text-gray-900">
                  {operationalAnalytics.orderFulfillmentTime.value.toFixed(1)} days
                </p>
                <p
                  className={`mt-1 text-sm ${
                    operationalAnalytics.orderFulfillmentTime.trend === 'down'
                      ? 'text-green-600'
                      : operationalAnalytics.orderFulfillmentTime.trend === 'up'
                        ? 'text-red-600'
                        : 'text-gray-500'
                  }`}
                >
                  {operationalAnalytics.orderFulfillmentTime.trend === 'down'
                    ? '📉 Improving'
                    : operationalAnalytics.orderFulfillmentTime.trend === 'up'
                      ? '📈 Slowing'
                      : '➡️ Stable'}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-center">
                <Target className="mx-auto mb-2 h-8 w-8 text-purple-500" />
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {operationalAnalytics.errorRate.value.toFixed(1)}%
                </p>
                <p
                  className={`mt-1 text-sm ${
                    operationalAnalytics.errorRate.trend === 'down'
                      ? 'text-green-600'
                      : operationalAnalytics.errorRate.trend === 'up'
                        ? 'text-red-600'
                        : 'text-gray-500'
                  }`}
                >
                  {operationalAnalytics.errorRate.trend === 'down'
                    ? '✅ Decreasing'
                    : operationalAnalytics.errorRate.trend === 'up'
                      ? '⚠️ Increasing'
                      : '➡️ Stable'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial KPIs */}
      {financialAnalytics && (
        <div>
          <h3 className="text-md mb-4 font-semibold text-gray-900">Financial Health</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Gross Margin"
              value={financialAnalytics.grossMargin.value}
              change={financialAnalytics.grossMargin.changePercentage}
              trend={financialAnalytics.grossMargin.trend}
              format="percentage"
              icon={<TrendingUp className="h-6 w-6" />}
              color="#10b981"
              size="sm"
            />

            <KPICard
              title="Net Profit"
              value={financialAnalytics.profit.value}
              change={financialAnalytics.profit.changePercentage}
              trend={financialAnalytics.profit.trend}
              format="currency"
              icon={<DollarSign className="h-6 w-6" />}
              color="#3b82f6"
              size="sm"
            />

            <KPICard
              title="Cash Flow"
              value={financialAnalytics.cashFlow.value}
              change={financialAnalytics.cashFlow.changePercentage}
              trend={financialAnalytics.cashFlow.trend}
              format="currency"
              icon={<Activity className="h-6 w-6" />}
              color="#8b5cf6"
              size="sm"
            />

            <KPICard
              title="Total Expenses"
              value={financialAnalytics.expenses.value}
              change={financialAnalytics.expenses.changePercentage}
              trend={financialAnalytics.expenses.trend === 'up' ? 'down' : 'up'}
              format="currency"
              icon={<BarChart3 className="h-6 w-6" />}
              color="#f59e0b"
              size="sm"
            />
          </div>
        </div>
      )}

      {/* Alerts and Status Indicators */}
      <div>
        <h3 className="text-md mb-4 font-semibold text-gray-900">Status Overview</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {inventoryAnalytics && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center">
                <div
                  className={`rounded-full p-2 ${
                    inventoryAnalytics.lowStockItems.value > 50
                      ? 'bg-red-100'
                      : inventoryAnalytics.lowStockItems.value > 20
                        ? 'bg-yellow-100'
                        : 'bg-green-100'
                  }`}
                >
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      inventoryAnalytics.lowStockItems.value > 50
                        ? 'text-red-600'
                        : inventoryAnalytics.lowStockItems.value > 20
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}
                  />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-lg font-bold text-gray-900">
                    {inventoryAnalytics.lowStockItems.value}
                  </p>
                </div>
              </div>
            </div>
          )}

          {inventoryAnalytics && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center">
                <div
                  className={`rounded-full p-2 ${
                    inventoryAnalytics.outOfStockItems.value > 10 ? 'bg-red-100' : 'bg-green-100'
                  }`}
                >
                  <Package
                    className={`h-5 w-5 ${
                      inventoryAnalytics.outOfStockItems.value > 10
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-lg font-bold text-gray-900">
                    {inventoryAnalytics.outOfStockItems.value}
                  </p>
                </div>
              </div>
            </div>
          )}

          {customerAnalytics && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New Customers</p>
                  <p className="text-lg font-bold text-gray-900">
                    {customerAnalytics.newCustomers.value}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-lg font-bold text-green-600">All Systems Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Trend */}
        {salesAnalytics && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">Sales Trend</h4>
            <LineChartComponent
              data={salesAnalytics.salesByTimeOfDay}
              height={200}
              lines={[{ key: 'value', color: '#10b981' }]}
              showLegend={false}
            />
          </div>
        )}

        {/* Category Distribution */}
        {salesAnalytics && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">Sales by Category</h4>
            <PieChartComponent
              data={salesAnalytics.salesByCategory}
              height={200}
              donut={true}
              innerRadius={60}
              showLegend={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default KPIDashboard;
