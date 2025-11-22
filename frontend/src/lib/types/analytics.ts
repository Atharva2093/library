export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface MetricValue {
  value: number;
  previousValue?: number;
  change?: number;
  changePercentage?: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  targetPercentage?: number;
}

export interface KPIMetric {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'inventory' | 'customers' | 'financial' | 'operations';
  metric: MetricValue;
  unit: 'currency' | 'count' | 'percentage' | 'days' | 'hours';
  format: 'number' | 'currency' | 'percentage' | 'duration';
  icon: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
  updatedAt: Date;
}

export interface SalesAnalytics {
  totalRevenue: MetricValue;
  totalOrders: MetricValue;
  averageOrderValue: MetricValue;
  conversionRate: MetricValue;
  salesGrowth: MetricValue;
  topProducts: ProductSalesData[];
  salesByCategory: CategorySalesData[];
  salesByLocation: LocationSalesData[];
  salesByTimeOfDay: TimeSeriesData[];
  salesForecast: ForecastData[];
  seasonalTrends: SeasonalData[];
}

export interface InventoryAnalytics {
  totalProducts: MetricValue;
  totalValue: MetricValue;
  turnoverRate: MetricValue;
  lowStockItems: MetricValue;
  outOfStockItems: MetricValue;
  averageStockLevel: MetricValue;
  stockByCategory: CategoryStockData[];
  slowMovingItems: ProductStockData[];
  fastMovingItems: ProductStockData[];
  stockTrends: TimeSeriesData[];
  replenishmentAlerts: ReplenishmentAlert[];
}

export interface CustomerAnalytics {
  totalCustomers: MetricValue;
  newCustomers: MetricValue;
  activeCustomers: MetricValue;
  customerRetention: MetricValue;
  averageLifetimeValue: MetricValue;
  customerAquisitionCost: MetricValue;
  customerSegmentation: CustomerSegmentData[];
  topCustomers: CustomerData[];
  customerBehavior: BehaviorData[];
  churnAnalysis: ChurnData[];
  loyaltyMetrics: LoyaltyData[];
}

export interface FinancialAnalytics {
  grossRevenue: MetricValue;
  netRevenue: MetricValue;
  grossMargin: MetricValue;
  netMargin: MetricValue;
  expenses: MetricValue;
  profit: MetricValue;
  cashFlow: MetricValue;
  revenueBreakdown: RevenueBreakdownData[];
  expenseBreakdown: ExpenseBreakdownData[];
  profitTrends: TimeSeriesData[];
  budgetVsActual: BudgetComparisonData[];
}

export interface OperationalAnalytics {
  orderFulfillmentTime: MetricValue;
  averageResponseTime: MetricValue;
  errorRate: MetricValue;
  systemUptime: MetricValue;
  staffProductivity: MetricValue;
  customerSatisfaction: MetricValue;
  operationalEfficiency: EfficiencyData[];
  performanceMetrics: PerformanceData[];
  workloadDistribution: WorkloadData[];
}

// Data structures for charts and visualizations
export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  label?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface CategoryData {
  category: string;
  value: number;
  percentage: number;
  change?: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface ProductSalesData {
  productId: string;
  productName: string;
  isbn?: string;
  category: string;
  sales: number;
  revenue: number;
  units: number;
  growth: number;
  rank: number;
  image?: string;
}

export interface CategorySalesData extends CategoryData {
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface LocationSalesData {
  location: string;
  sales: number;
  orders: number;
  customers: number;
  growth: number;
  coordinates?: [number, number];
}

export interface CustomerData {
  customerId: string;
  customerName: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: Date;
  lifetimeValue: number;
  segment: string;
  loyaltyTier?: string;
}

export interface CustomerSegmentData {
  segment: string;
  customerCount: number;
  percentage: number;
  averageValue: number;
  retention: number;
  growth: number;
  characteristics: string[];
}

export interface BehaviorData {
  behavior: string;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendations: string[];
}

export interface ChurnData {
  period: string;
  churnRate: number;
  customersLost: number;
  revenueImpact: number;
  reasons: ChurnReason[];
  predictions: ChurnPrediction[];
}

export interface ChurnReason {
  reason: string;
  percentage: number;
  impact: number;
}

export interface ChurnPrediction {
  customerId: string;
  customerName: string;
  churnProbability: number;
  riskLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export interface LoyaltyData {
  tier: string;
  customerCount: number;
  averageSpend: number;
  retentionRate: number;
  benefits: string[];
  upgradeRate: number;
}

export interface ProductStockData {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  optimalStock: number;
  turnoverRate: number;
  daysOfStock: number;
  status: 'optimal' | 'low' | 'excess' | 'out_of_stock';
  lastRestocked: Date;
}

export interface CategoryStockData extends CategoryData {
  stockValue: number;
  stockLevel: number;
  turnoverRate: number;
}

export interface ReplenishmentAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  suggestedOrder: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  supplier?: string;
  leadTime?: number;
  cost?: number;
}

export interface ForecastData {
  date: Date;
  predicted: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  actualValue?: number;
  factors: ForecastFactor[];
}

export interface ForecastFactor {
  name: string;
  impact: number;
  confidence: number;
  description: string;
}

export interface SeasonalData {
  period: string;
  value: number;
  seasonalIndex: number;
  trend: 'up' | 'down' | 'stable';
  yearOverYear: number;
}

export interface RevenueBreakdownData {
  source: string;
  amount: number;
  percentage: number;
  growth: number;
  trend: TimeSeriesData[];
}

export interface ExpenseBreakdownData {
  category: string;
  amount: number;
  percentage: number;
  budget: number;
  variance: number;
  trend: TimeSeriesData[];
}

export interface BudgetComparisonData {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  status: 'over' | 'under' | 'on_track';
}

export interface EfficiencyData {
  metric: string;
  current: number;
  target: number;
  efficiency: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

export interface PerformanceData {
  department: string;
  kpis: KPIMetric[];
  overall: number;
  trends: TimeSeriesData[];
  benchmarks: BenchmarkData[];
}

export interface BenchmarkData {
  metric: string;
  ourValue: number;
  industryAverage: number;
  topQuartile: number;
  ranking: 'top_10' | 'top_25' | 'average' | 'below_average';
}

export interface WorkloadData {
  resource: string;
  utilization: number;
  capacity: number;
  efficiency: number;
  bottlenecks: string[];
  recommendations: string[];
}

// Dashboard and widget configuration
export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: LayoutConfiguration;
  filters: DashboardFilter[];
  refreshInterval: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  subtitle?: string;
  dataSource: string;
  configuration: WidgetConfiguration;
  position: WidgetPosition;
  size: WidgetSize;
  refreshInterval?: number;
  filters?: WidgetFilter[];
  isVisible: boolean;
}

export type WidgetType =
  | 'kpi_card'
  | 'line_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'area_chart'
  | 'scatter_plot'
  | 'heatmap'
  | 'gauge'
  | 'table'
  | 'metric_grid'
  | 'trend_indicator'
  | 'progress_bar'
  | 'funnel_chart'
  | 'geographic_map';

export interface WidgetConfiguration {
  chartType?: string;
  xAxis?: string;
  yAxis?: string | string[];
  groupBy?: string;
  aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max';
  timeGranularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  colors?: string[];
  thresholds?: ThresholdConfiguration[];
  formatting?: FormattingConfiguration;
}

export interface ThresholdConfiguration {
  value: number;
  color: string;
  label?: string;
  operator: '>=' | '<=' | '>' | '<' | '=' | '!=';
}

export interface FormattingConfiguration {
  numberFormat?: 'number' | 'currency' | 'percentage';
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
}

export interface WidgetPosition {
  x: number;
  y: number;
  z?: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface LayoutConfiguration {
  columns: number;
  rows?: number;
  gap: number;
  responsive: boolean;
  breakpoints: BreakpointConfiguration[];
}

export interface BreakpointConfiguration {
  breakpoint: string;
  columns: number;
  gap: number;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: FilterType;
  field: string;
  defaultValue: any;
  options?: FilterOption[];
  dependencies?: string[];
  isRequired: boolean;
}

export interface WidgetFilter extends DashboardFilter {
  widgetIds: string[];
}

export type FilterType =
  | 'date_range'
  | 'single_select'
  | 'multi_select'
  | 'text_input'
  | 'number_range'
  | 'boolean'
  | 'autocomplete';

export interface FilterOption {
  label: string;
  value: any;
  group?: string;
  disabled?: boolean;
}

// Analytics query and response interfaces
export interface AnalyticsQuery {
  metrics: string[];
  dimensions?: string[];
  filters?: QueryFilter[];
  dateRange: DateRange;
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  limit?: number;
  offset?: number;
  sortBy?: SortConfiguration[];
  aggregations?: AggregationConfiguration[];
}

export interface QueryFilter {
  field: string;
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'not_in'
    | 'contains'
    | 'starts_with'
    | 'ends_with';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface SortConfiguration {
  field: string;
  direction: 'asc' | 'desc';
}

export interface AggregationConfiguration {
  field: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct_count';
  alias?: string;
}

export interface AnalyticsResponse<T = any> {
  data: T[];
  metadata: ResponseMetadata;
  query: AnalyticsQuery;
  generatedAt: Date;
  fromCache?: boolean;
  cacheExpiry?: Date;
}

export interface ResponseMetadata {
  totalRecords: number;
  recordsReturned: number;
  executionTimeMs: number;
  dataFreshness: Date;
  sources: string[];
  warnings?: string[];
}

// Reporting and export interfaces
export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'custom' | 'scheduled';
  template: string;
  parameters: ReportParameter[];
  schedule?: ReportSchedule;
  recipients?: string[];
  format: 'pdf' | 'excel' | 'csv' | 'html';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: string;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  enabled: boolean;
  nextRun?: Date;
}

// Advanced analytics interfaces
export interface PredictiveModel {
  id: string;
  name: string;
  type: 'forecasting' | 'classification' | 'clustering' | 'anomaly_detection';
  algorithm: string;
  features: string[];
  target?: string;
  accuracy: number;
  confidence: number;
  lastTraining: Date;
  status: 'training' | 'ready' | 'error' | 'active';
  description?: string;
  nextUpdate?: string | Date;
  predictions?: Record<string, unknown>;
  metadata: ModelMetadata;
}

export interface ModelMetadata {
  version: string;
  trainingData: string;
  validationMetrics: ValidationMetric[];
  hyperparameters: Record<string, any>;
  featureImportance: FeatureImportance[];
}

export interface ValidationMetric {
  name: string;
  value: number;
  benchmark?: number;
  interpretation: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  interpretation: string;
}

export interface AnomalyDetection {
  detected: boolean;
  anomalies: Anomaly[];
  threshold: number;
  confidence: number;
  recommendations: string[];
}

export interface Anomaly {
  timestamp: Date;
  metric: string;
  expectedValue: number;
  actualValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  causes: string[];
}

// Business intelligence interfaces
export interface BusinessInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  category: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  metrics: RelatedMetric[];
  recommendations: Recommendation[];
  createdAt: Date;
  expiresAt?: Date;
  acknowledged?: boolean;
}

export interface RelatedMetric {
  name: string;
  value: number;
  change: number;
  significance: 'high' | 'medium' | 'low';
}

export interface Recommendation {
  title: string;
  description: string;
  action: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  priority: number;
}

export interface CompetitiveAnalysis {
  competitor: string;
  metrics: CompetitiveMetric[];
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitiveMetric {
  metric: string;
  ourValue: number;
  competitorValue: number;
  difference: number;
  advantage: 'positive' | 'negative' | 'neutral';
}

export default {};
