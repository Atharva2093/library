import api, { PaginatedResponse } from '../api';
import type {
  Sale,
  CreateSaleRequest,
  UpdateSaleRequest,
  SaleFilters,
  SalesStats,
  SalesByPeriod,
  TopBook,
  CustomerStats,
  AnalyticsParams,
  DashboardSummary,
} from '../types';

class SalesService {
  // Get all sales with pagination and filters
  async getSales(filters?: SaleFilters): Promise<PaginatedResponse<Sale>> {
    const params = new URLSearchParams();

    // Convert page/size to skip/limit format expected by backend
    if (filters?.page && filters?.size) {
      const skip = (filters.page - 1) * filters.size;
      params.append('skip', skip.toString());
      params.append('limit', filters.size.toString());
    } else if (filters?.size) {
      params.append('skip', '0');
      params.append('limit', filters.size.toString());
    }

    if (filters?.customer_id) params.append('customer_id', filters.customer_id.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_method) params.append('payment_method', filters.payment_method);
    if (filters?.min_amount) params.append('min_amount', filters.min_amount.toString());
    if (filters?.max_amount) params.append('max_amount', filters.max_amount.toString());

    const queryString = params.toString();
    const url = queryString ? `/sales?${queryString}` : '/sales';

    // Backend returns array, need to convert to paginated format
    const salesArray = await api.get<Sale[]>(url);

    // Convert to expected paginated format
    return {
      items: salesArray,
      total: salesArray.length, // This is incomplete but works for now
      page: filters?.page || 1,
      size: filters?.size || 20,
      pages: Math.ceil(salesArray.length / (filters?.size || 20)),
    };
  }

  // Get sale by ID
  async getSaleById(id: number): Promise<Sale> {
    const response = await api.get<Sale>(`/sales/${id}`);
    return response;
  }

  // Create new sale
  async createSale(saleData: CreateSaleRequest): Promise<Sale> {
    const response = await api.post<Sale>('/sales', saleData);
    return response;
  }

  // Update sale
  async updateSale(id: number, saleData: UpdateSaleRequest): Promise<Sale> {
    const response = await api.put<Sale>(`/sales/${id}`, saleData);
    return response;
  }

  // Delete sale
  async deleteSale(id: number): Promise<void> {
    await api.delete(`/sales/${id}`);
  }

  // Process refund
  async processRefund(saleId: number, reason?: string): Promise<Sale> {
    const response = await api.post<Sale>(`/sales/${saleId}/refund`, { reason });
    return response;
  }

  // Get recent sales
  async getRecentSales(limit = 10): Promise<Sale[]> {
    const response = await api.get<Sale[]>(`/sales/recent?limit=${limit}`);
    return response;
  }

  // Get sales by date range
  async getSalesByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    const response = await api.get<Sale[]>(
      `/sales/range?start_date=${startDate}&end_date=${endDate}`
    );
    return response;
  }

  // Export sales data
  async exportSales(format: 'csv' | 'xlsx' = 'csv', filters?: SaleFilters): Promise<void> {
    const params = new URLSearchParams();
    params.append('format', format);

    if (filters?.customer_id) params.append('customer_id', filters.customer_id.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.status) params.append('status', filters.status);

    await api.download(`/sales/export?${params.toString()}`, `sales.${format}`);
  }

  // Generate sales receipt
  async generateReceipt(saleId: number, format: 'pdf' | 'html' = 'pdf'): Promise<void> {
    await api.download(`/sales/${saleId}/receipt?format=${format}`, `receipt-${saleId}.${format}`);
  }

  // Get sales statistics
  async getSalesStats(params?: AnalyticsParams): Promise<SalesStats> {
    const queryParams = new URLSearchParams();

    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const queryString = queryParams.toString();
    const url = queryString ? `/sales/stats?${queryString}` : '/sales/stats';

    const response = await api.get<SalesStats>(url);
    return response;
  }
}

class AnalyticsService {
  // Get dashboard summary
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>('/analytics/dashboard');
    return response;
  }

  // Get sales analytics
  async getSalesAnalytics(params?: AnalyticsParams): Promise<{
    stats: SalesStats;
    sales_by_period: SalesByPeriod[];
    top_books: TopBook[];
    payment_methods: Array<{ method: string; count: number; total: number }>;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.period) queryParams.append('period', params.period);

    const queryString = queryParams.toString();
    const url = queryString ? `/analytics/sales?${queryString}` : '/analytics/sales';

    const response = await api.get(url);
    return response;
  }

  // Get customer analytics
  async getCustomerAnalytics(params?: AnalyticsParams): Promise<{
    stats: CustomerStats;
    customer_acquisition: Array<{ date: string; new_customers: number }>;
    customer_retention: Array<{ cohort: string; retention_rate: number }>;
    top_customers: Array<{ customer: any; total_spent: number; total_orders: number }>;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.period) queryParams.append('period', params.period);

    const queryString = queryParams.toString();
    const url = queryString ? `/analytics/customers?${queryString}` : '/analytics/customers';

    const response = await api.get(url);
    return response;
  }

  // Get inventory analytics
  async getInventoryAnalytics(): Promise<{
    total_books: number;
    total_value: number;
    low_stock_books: number;
    out_of_stock_books: number;
    inventory_turnover: number;
    top_categories: Array<{ category: string; book_count: number; total_value: number }>;
    stock_levels: Array<{ book: any; stock_quantity: number; reorder_level: number }>;
  }> {
    const response = await api.get('/analytics/inventory');
    return response;
  }

  // Get revenue trends
  async getRevenueTrends(params?: AnalyticsParams): Promise<{
    total_revenue: number;
    revenue_growth: number;
    revenue_by_period: Array<{ period: string; revenue: number; orders: number }>;
    revenue_by_category: Array<{ category: string; revenue: number; percentage: number }>;
    revenue_forecast: Array<{ period: string; predicted_revenue: number }>;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.period) queryParams.append('period', params.period);

    const queryString = queryParams.toString();
    const url = queryString ? `/analytics/revenue?${queryString}` : '/analytics/revenue';

    const response = await api.get(url);
    return response;
  }

  // Get performance metrics
  async getPerformanceMetrics(params?: AnalyticsParams): Promise<{
    conversion_rate: number;
    average_order_value: number;
    customer_lifetime_value: number;
    cart_abandonment_rate: number;
    return_rate: number;
    profit_margin: number;
    inventory_turnover: number;
    customer_acquisition_cost: number;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const queryString = queryParams.toString();
    const url = queryString ? `/analytics/performance?${queryString}` : '/analytics/performance';

    const response = await api.get(url);
    return response;
  }

  // Export analytics report
  async exportAnalyticsReport(
    reportType: 'sales' | 'customers' | 'inventory' | 'revenue',
    format: 'pdf' | 'xlsx' = 'pdf',
    params?: AnalyticsParams
  ): Promise<void> {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);

    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.period) queryParams.append('period', params.period);

    const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`;
    await api.download(`/analytics/${reportType}/export?${queryParams.toString()}`, filename);
  }
}

export const salesService = new SalesService();
export const analyticsService = new AnalyticsService();

export default salesService;
