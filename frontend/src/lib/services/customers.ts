import api, { PaginatedResponse } from '../api';
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerFilters,
  Sale,
} from '../types';

class CustomersService {
  // Get all customers with pagination and filters
  async getCustomers(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
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

    if (filters?.search) params.append('q', filters.search);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.country) params.append('country', filters.country);

    const queryString = params.toString();
    const url = queryString ? `/customers?${queryString}` : '/customers';

    // Backend returns array, need to convert to paginated format
    const customersArray = await api.get<Customer[]>(url);

    // Convert to expected paginated format
    return {
      items: customersArray,
      total: customersArray.length, // This is incomplete but works for now
      page: filters?.page || 1,
      size: filters?.size || 20,
      pages: Math.ceil(customersArray.length / (filters?.size || 20)),
    };
  }

  // Get customer by ID
  async getCustomerById(id: number): Promise<Customer> {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response;
  }

  // Create new customer
  async createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
    const response = await api.post<Customer>('/customers', customerData);
    return response;
  }

  // Update customer
  async updateCustomer(id: number, customerData: UpdateCustomerRequest): Promise<Customer> {
    const response = await api.put<Customer>(`/customers/${id}`, customerData);
    return response;
  }

  // Delete customer
  async deleteCustomer(id: number): Promise<void> {
    await api.delete(`/customers/${id}`);
  }

  // Search customers
  async searchCustomers(query: string, limit?: number): Promise<Customer[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (limit) params.append('limit', limit.toString());

    const response = await api.get<Customer[]>(`/customers/search?${params.toString()}`);
    return response;
  }

  // Get customer purchase history
  async getCustomerPurchases(
    customerId: number,
    page = 1,
    size = 20
  ): Promise<PaginatedResponse<Sale>> {
    const response = await api.get<PaginatedResponse<Sale>>(
      `/customers/${customerId}/purchases?page=${page}&size=${size}`
    );
    return response;
  }

  // Get customer statistics
  async getCustomerStats(customerId: number): Promise<{
    total_purchases: number;
    total_spent: number;
    average_order_value: number;
    first_purchase_date: string;
    last_purchase_date: string;
    favorite_categories: string[];
    favorite_authors: string[];
  }> {
    const response = await api.get(`/customers/${customerId}/stats`);
    return response;
  }

  // Get recent customers
  async getRecentCustomers(limit = 10): Promise<Customer[]> {
    const response = await api.get<Customer[]>(`/customers/recent?limit=${limit}`);
    return response;
  }

  // Get top customers by spending
  async getTopCustomers(limit = 10): Promise<
    Array<
      Customer & {
        total_spent: number;
        total_purchases: number;
      }
    >
  > {
    const response = await api.get(`/customers/top?limit=${limit}`);
    return response;
  }

  // Export customers data
  async exportCustomers(format: 'csv' | 'xlsx' = 'csv', filters?: CustomerFilters): Promise<void> {
    const params = new URLSearchParams();
    params.append('format', format);

    if (filters?.search) params.append('search', filters.search);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.country) params.append('country', filters.country);

    await api.download(`/customers/export?${params.toString()}`, `customers.${format}`);
  }

  // Import customers from file
  async importCustomers(
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<{
    imported: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    const response = await api.upload<{
      imported: number;
      errors: Array<{ row: number; error: string }>;
    }>('/customers/import', file, onUploadProgress);
    return response;
  }

  // Send email to customer
  async sendEmailToCustomer(
    customerId: number,
    data: {
      subject: string;
      message: string;
      template?: string;
    }
  ): Promise<void> {
    await api.post(`/customers/${customerId}/email`, data);
  }

  // Send bulk email to customers
  async sendBulkEmail(
    customerIds: number[],
    data: {
      subject: string;
      message: string;
      template?: string;
    }
  ): Promise<void> {
    await api.post('/customers/bulk-email', {
      customer_ids: customerIds,
      ...data,
    });
  }

  // Get customer segments
  async getCustomerSegments(): Promise<
    Array<{
      name: string;
      description: string;
      customer_count: number;
      criteria: object;
    }>
  > {
    const response = await api.get('/customers/segments');
    return response;
  }

  // Add customer to segment
  async addCustomerToSegment(customerId: number, segmentId: number): Promise<void> {
    await api.post(`/customers/${customerId}/segments/${segmentId}`);
  }

  // Remove customer from segment
  async removeCustomerFromSegment(customerId: number, segmentId: number): Promise<void> {
    await api.delete(`/customers/${customerId}/segments/${segmentId}`);
  }

  // Get customer lifetime value
  async getCustomerLifetimeValue(customerId: number): Promise<{
    lifetime_value: number;
    predicted_value: number;
    customer_score: number;
    segment: string;
  }> {
    const response = await api.get(`/customers/${customerId}/ltv`);
    return response;
  }
}

export default new CustomersService();
