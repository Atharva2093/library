'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    timeframe: string;
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'blue',
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-500 text-green-600 bg-green-50';
      case 'yellow':
        return 'bg-yellow-500 text-yellow-600 bg-yellow-50';
      case 'red':
        return 'bg-red-500 text-red-600 bg-red-50';
      case 'purple':
        return 'bg-purple-500 text-purple-600 bg-purple-50';
      default:
        return 'bg-blue-500 text-blue-600 bg-blue-50';
    }
  };

  const [iconBg, textColor, cardBg] = getColorClasses().split(' ');

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-8 w-8 ${iconBg} flex items-center justify-center rounded-md`}>
              {icon ? (
                <div className={`h-5 w-5 text-white`}>{icon}</div>
              ) : (
                <div className={`h-5 w-5 ${iconBg} rounded`} />
              )}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
      {change && (
        <div className={`${cardBg} px-5 py-3`}>
          <div className="text-sm">
            <span
              className={`font-medium ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change.type === 'increase' ? '+' : '-'}
              {Math.abs(change.value)}%
            </span>
            <span className="text-gray-500"> from {change.timeframe}</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: ChartData[];
  title: string;
  height?: number;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, title, height = 300 }) => {
  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-gray-500',
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          const barWidth = (item.value / maxValue) * 100;
          const colorClass = item.color || colors[index % colors.length];

          return (
            <div key={item.label} className="flex items-center">
              <div className="w-20 truncate text-sm text-gray-600">{item.label}</div>
              <div className="ml-4 flex-1">
                <div className="relative h-4 rounded-full bg-gray-200">
                  <div
                    className={`${colorClass} h-4 rounded-full transition-all duration-300`}
                    style={{ width: `${barWidth}%` }}
                  />
                  <span className="absolute right-2 top-0 flex h-4 items-center text-xs text-gray-700">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface SimplePieChartProps {
  data: ChartData[];
  title: string;
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({ data, title }) => {
  if (!data.length) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-gray-500',
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Pie Chart Visual (simplified) */}
        <div className="flex justify-center">
          <div className="relative h-32 w-32 rounded-full border-8 border-gray-200">
            <div className="absolute inset-2 rounded-full bg-blue-500 opacity-20"></div>
            <div className="absolute inset-4 rounded-full bg-green-500 opacity-40"></div>
            <div className="absolute inset-6 rounded-full bg-yellow-500 opacity-60"></div>
            <div className="absolute inset-8 rounded-full bg-red-500 opacity-80"></div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {data.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
            const colorClass = item.color || colors[index % colors.length];

            return (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-3 w-3 ${colorClass} mr-2 rounded-full`} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  total,
  color = 'blue',
  showPercentage = true,
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const getColorClass = () => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showPercentage && <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>}
      </div>
      <div className="h-3 rounded-full bg-gray-200">
        <div
          className={`${getColorClass()} h-3 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{current.toLocaleString()}</span>
        <span>{total.toLocaleString()}</span>
      </div>
    </div>
  );
};

interface MetricTableProps {
  data: Array<{
    label: string;
    value: string | number;
    change?: {
      value: number;
      type: 'increase' | 'decrease';
    };
  }>;
  title: string;
}

export const MetricTable: React.FC<MetricTableProps> = ({ data, title }) => {
  return (
    <div className="rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Metric
                </th>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Value
                </th>
                <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {row.label}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{row.value}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {row.change ? (
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          row.change.type === 'increase'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {row.change.type === 'increase' ? '+' : '-'}
                        {Math.abs(row.change.value).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface TrendLineProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  title: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export const TrendLine: React.FC<TrendLineProps> = ({ data, title, color = 'blue' }) => {
  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'stroke-green-500 fill-green-100';
      case 'yellow':
        return 'stroke-yellow-500 fill-yellow-100';
      case 'red':
        return 'stroke-red-500 fill-red-100';
      default:
        return 'stroke-blue-500 fill-blue-100';
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
      <div className="h-64">
        <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Trend line */}
          <polyline
            fill="none"
            className={colorClasses.split(' ')[0]}
            strokeWidth="2"
            points={data
              .map((point, index) => {
                const x = (index / (data.length - 1)) * 380 + 10;
                const y = 180 - ((point.value - minValue) / range) * 160;
                return `${x},${y}`;
              })
              .join(' ')}
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 380 + 10;
            const y = 180 - ((point.value - minValue) / range) * 160;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                className="fill-white stroke-current stroke-2"
                style={{ color: colorClasses.split(' ')[0].replace('stroke-', '') }}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        {data.map((point, index) => (
          <span key={index} className="truncate">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
};
