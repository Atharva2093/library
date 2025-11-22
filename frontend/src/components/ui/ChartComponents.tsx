'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
  LabelList,
  RadialBarChart,
  RadialBar,
  Treemap,
} from 'recharts';
import type { TimeSeriesData, CategoryData, MetricValue } from '@/lib/types/analytics';

// Color schemes for different chart types
const CHART_COLORS = {
  primary: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'],
  gradient: {
    green: ['#10b981', '#059669'],
    blue: ['#3b82f6', '#2563eb'],
    orange: ['#f59e0b', '#d97706'],
    red: ['#ef4444', '#dc2626'],
    purple: ['#8b5cf6', '#7c3aed'],
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

interface BaseChartProps {
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
  colors?: string[];
}

// Line Chart Component
interface LineChartProps extends BaseChartProps {
  data: TimeSeriesData[];
  xKey?: string;
  yKey?: string;
  lines?: Array<{
    key: string;
    color?: string;
    strokeWidth?: number;
    type?: 'monotone' | 'linear' | 'step';
  }>;
  gradientFill?: boolean;
  animated?: boolean;
}

export const LineChartComponent: React.FC<LineChartProps> = ({
  data,
  height = 300,
  xKey = 'timestamp',
  yKey = 'value',
  lines = [{ key: yKey }],
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  gradientFill = false,
  animated = true,
  className = '',
  colors = CHART_COLORS.primary,
}) => {
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      [xKey]:
        item.timestamp instanceof Date
          ? item.timestamp.toLocaleDateString()
          : item[xKey as keyof typeof item],
    }));
  }, [data, xKey]);

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis dataKey={xKey} stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
          )}
          {showLegend && <Legend />}

          {gradientFill && (
            <defs>
              {lines.map((line, index) => (
                <linearGradient
                  key={line.key}
                  id={`gradient-${line.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={line.color || colors[index % colors.length]}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={line.color || colors[index % colors.length]}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
          )}

          {lines.map((line, index) => (
            <Line
              key={line.key}
              type={line.type || 'monotone'}
              dataKey={line.key}
              stroke={line.color || colors[index % colors.length]}
              strokeWidth={line.strokeWidth || 2}
              fill={gradientFill ? `url(#gradient-${line.key})` : 'none'}
              dot={{ fill: line.color || colors[index % colors.length], strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: line.color || colors[index % colors.length],
                strokeWidth: 2,
              }}
              animationDuration={animated ? 1000 : 0}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Area Chart Component
interface AreaChartProps extends BaseChartProps {
  data: TimeSeriesData[];
  xKey?: string;
  yKey?: string;
  areas?: Array<{
    key: string;
    color?: string;
    stackId?: string;
  }>;
  stacked?: boolean;
}

export const AreaChartComponent: React.FC<AreaChartProps> = ({
  data,
  height = 300,
  xKey = 'timestamp',
  yKey = 'value',
  areas = [{ key: yKey }],
  stacked = false,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  className = '',
  colors = CHART_COLORS.primary,
}) => {
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      [xKey]:
        item.timestamp instanceof Date
          ? item.timestamp.toLocaleDateString()
          : item[xKey as keyof typeof item],
    }));
  }, [data, xKey]);

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {areas.map((area, index) => (
              <linearGradient
                key={area.key}
                id={`colorGradient-${area.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={area.color || colors[index % colors.length]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={area.color || colors[index % colors.length]}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis dataKey={xKey} stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}

          {areas.map((area, index) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              stackId={stacked ? area.stackId || 'default' : undefined}
              stroke={area.color || colors[index % colors.length]}
              fill={`url(#colorGradient-${area.key})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Bar Chart Component
interface BarChartProps extends BaseChartProps {
  data: CategoryData[];
  xKey?: string;
  yKey?: string;
  bars?: Array<{
    key: string;
    color?: string;
    stackId?: string;
  }>;
  layout?: 'horizontal' | 'vertical';
  stacked?: boolean;
}

export const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  height = 300,
  xKey = 'category',
  yKey = 'value',
  bars = [{ key: yKey }],
  layout = 'vertical',
  stacked = false,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  className = '',
  colors = CHART_COLORS.primary,
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout={layout} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            type={layout === 'vertical' ? 'category' : 'number'}
            dataKey={layout === 'vertical' ? xKey : undefined}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis
            type={layout === 'vertical' ? 'number' : 'category'}
            dataKey={layout === 'horizontal' ? xKey : undefined}
            stroke="#6b7280"
            fontSize={12}
          />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}

          {bars.map((bar, index) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              stackId={stacked ? bar.stackId || 'default' : undefined}
              fill={bar.color || colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Pie Chart Component
interface PieChartProps extends BaseChartProps {
  data: CategoryData[];
  dataKey?: string;
  nameKey?: string;
  showPercentage?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  donut?: boolean;
}

export const PieChartComponent: React.FC<PieChartProps> = ({
  data,
  height = 300,
  dataKey = 'value',
  nameKey = 'category',
  showPercentage = true,
  innerRadius = 0,
  outerRadius = 80,
  donut = false,
  showLegend = true,
  showTooltip = true,
  className = '',
  colors = CHART_COLORS.primary,
}) => {
  const enhancedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: item.color || colors[index % colors.length],
    }));
  }, [data, colors]);

  const renderCustomLabel = (entry: any) => {
    if (!showPercentage) return '';
    return `${entry.percentage}%`;
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={enhancedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={outerRadius}
            innerRadius={donut ? innerRadius || 40 : innerRadius}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {enhancedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  color?: string;
  subtitle?: string;
  format?: 'currency' | 'number' | 'percentage';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType = 'percentage',
  trend = 'stable',
  icon,
  color = CHART_COLORS.status.info,
  subtitle,
  format = 'number',
  size = 'md',
  className = '',
}) => {
  const formatValue = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(num);
      case 'percentage':
        return `${num.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(num);
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const textSizes = {
    sm: { title: 'text-sm', value: 'text-xl', change: 'text-xs' },
    md: { title: 'text-base', value: 'text-2xl', change: 'text-sm' },
    lg: { title: 'text-lg', value: 'text-3xl', change: 'text-base' },
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${sizeClasses[size]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`${textSizes[size].title} truncate font-medium text-gray-600`}>{title}</p>
          <p className={`${textSizes[size].value} mt-1 font-bold text-gray-900`}>
            {formatValue(value)}
          </p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
          {change !== undefined && (
            <div className={`mt-2 flex items-center ${textSizes[size].change}`}>
              <span className={`${getTrendColor()} flex items-center`}>
                <span className="mr-1">{getTrendIcon()}</span>
                {changeType === 'percentage' ? `${Math.abs(change).toFixed(1)}%` : Math.abs(change)}
                <span className="ml-1 text-gray-500">vs last period</span>
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 rounded-lg p-2" style={{ backgroundColor: `${color}20` }}>
            <div style={{ color }}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Gauge Chart Component
interface GaugeChartProps extends BaseChartProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  unit?: string;
  thresholds?: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  title,
  unit = '',
  height = 200,
  thresholds = [
    { value: 30, color: '#ef4444', label: 'Low' },
    { value: 70, color: '#f59e0b', label: 'Medium' },
    { value: 100, color: '#10b981', label: 'High' },
  ],
  className = '',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 180;

  const getColor = () => {
    for (const threshold of thresholds) {
      if (value <= threshold.value) {
        return threshold.color;
      }
    }
    return thresholds[thresholds.length - 1].color;
  };

  return (
    <div className={`flex w-full flex-col items-center ${className}`}>
      <div style={{ height }} className="relative">
        <svg width="200" height="120" viewBox="0 0 200 120">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <path
            d={`M 20 100 A 80 80 0 ${angle > 90 ? 1 : 0} 1 ${
              20 + 160 * Math.cos(Math.PI - (angle * Math.PI) / 180)
            } ${100 - 80 * Math.sin((angle * Math.PI) / 180)}`}
            fill="none"
            stroke={getColor()}
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Center dot */}
          <circle cx="100" cy="100" r="4" fill={getColor()} />

          {/* Value text */}
          <text x="100" y="90" textAnchor="middle" className="fill-gray-700 text-lg font-bold">
            {value}
            {unit}
          </text>
        </svg>
      </div>

      {title && <p className="mt-2 text-center text-sm font-medium text-gray-700">{title}</p>}

      <div className="mt-2 flex space-x-4">
        {thresholds.map((threshold, index) => (
          <div key={index} className="flex items-center text-xs">
            <div
              className="mr-1 h-3 w-3 rounded-full"
              style={{ backgroundColor: threshold.color }}
            ></div>
            <span className="text-gray-600">{threshold.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Metric Trend Component
interface MetricTrendProps {
  metric: MetricValue;
  title: string;
  format?: 'currency' | 'number' | 'percentage';
  showTarget?: boolean;
  className?: string;
}

export const MetricTrend: React.FC<MetricTrendProps> = ({
  metric,
  title,
  format = 'number',
  showTarget = false,
  className = '',
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        <span className="text-lg">{getTrendIcon()}</span>
      </div>

      <div className="mt-2">
        <p className="text-2xl font-bold text-gray-900">{formatValue(metric.value)}</p>

        {metric.change !== undefined && (
          <p
            className={`mt-1 inline-flex items-center rounded-full px-2 py-1 text-sm ${getTrendColor()}`}
          >
            {metric.changePercentage && metric.changePercentage > 0 ? '+' : ''}
            {metric.changePercentage?.toFixed(1)}% vs previous
          </p>
        )}

        {showTarget && metric.target && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-sm text-gray-600">
              <span>Target Progress</span>
              <span>{metric.targetPercentage?.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-600"
                style={{ width: `${Math.min(metric.targetPercentage || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Treemap Component for hierarchical data
interface TreemapProps extends BaseChartProps {
  data: any[];
  dataKey?: string;
  nameKey?: string;
  colorKey?: string;
}

export const TreemapChart: React.FC<TreemapProps> = ({
  data,
  height = 300,
  dataKey = 'value',
  nameKey = 'name',
  colorKey = 'color',
  className = '',
  colors = CHART_COLORS.primary,
}) => {
  const enhancedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      fill: item[colorKey] || colors[index % colors.length],
    }));
  }, [data, colorKey, colors]);

  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload } = props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: payload.fill,
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1),
          }}
        />
        {depth === 1 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            fill="#fff"
            fontSize={14}
            fontWeight="bold"
          >
            {payload[nameKey]}
          </text>
        )}
        {depth === 1 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 16}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
          >
            {payload[dataKey]}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <Treemap
          data={enhancedData}
          dataKey={dataKey}
          aspectRatio={4 / 3}
          stroke="#fff"
          content={<CustomizedContent />}
        />
      </ResponsiveContainer>
    </div>
  );
};

export default {
  LineChartComponent,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
  KPICard,
  GaugeChart,
  MetricTrend,
  TreemapChart,
  CHART_COLORS,
};
