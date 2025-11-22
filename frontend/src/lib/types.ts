// Type definitions for API entities

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// User and Authentication types
export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_superuser: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  full_name: string;
  confirmPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

// Book types
export interface Author {
  id: number;
  name: string;
  bio?: string;
  birth_date?: string;
  death_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: number;
  title: string;
  isbn?: string;
  description?: string;
  price: number;
  stock_quantity: number;
  publication_date?: string;
  publisher?: string;
  language?: string;
  pages?: number;
  format?: 'hardcover' | 'paperback' | 'ebook' | 'audiobook';
  image_url?: string;
  authors: Author[];
  categories: Category[];
  created_at: string;
  updated_at: string;
}

export interface CreateBookRequest {
  title: string;
  isbn?: string;
  description?: string;
  price: number;
  stock_quantity: number;
  publication_date?: string;
  publisher?: string;
  language?: string;
  pages?: number;
  format?: string;
  author_ids: number[];
  category_ids: number[];
}

export interface UpdateBookRequest extends Partial<CreateBookRequest> {}

// Customer types
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

// Sale types
export interface SaleItem {
  id: number;
  book_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  book: Book;
}

export interface Sale {
  id: number;
  customer_id: number;
  total_amount: number;
  sale_date: string;
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'online';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  customer: Customer;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateSaleRequest {
  customer_id: number;
  payment_method: string;
  notes?: string;
  items: {
    book_id: number;
    quantity: number;
    unit_price: number;
  }[];
}

export interface UpdateSaleRequest {
  status?: string;
  payment_method?: string;
  notes?: string;
}

// Analytics types
export interface SalesStats {
  total_sales: number;
  total_revenue: number;
  average_order_value: number;
  total_customers: number;
}

export interface SalesByPeriod {
  date: string;
  sales_count: number;
  revenue: number;
}

export interface TopBook {
  book: Book;
  total_sold: number;
  total_revenue: number;
}

export interface CustomerStats {
  new_customers: number;
  returning_customers: number;
  total_customers: number;
  customer_retention_rate: number;
}

// Query parameters
export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface BookFilters extends PaginationParams {
  search?: string;
  author_id?: number;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  format?: string;
}

export interface CustomerFilters extends PaginationParams {
  search?: string;
  city?: string;
  country?: string;
}

export interface SaleFilters extends PaginationParams {
  customer_id?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  payment_method?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface AnalyticsParams {
  start_date?: string;
  end_date?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

// Common response types
export interface ErrorResponse {
  detail: string;
  status_code?: number;
}

export interface SuccessResponse {
  message: string;
}

// File upload types
export interface FileUploadResponse {
  filename: string;
  file_path: string;
  file_size: number;
  content_type: string;
}

// Dashboard summary types
export interface DashboardSummary {
  total_books: number;
  total_customers: number;
  total_sales: number;
  total_revenue: number;
  low_stock_books: number;
  recent_sales: Sale[];
  top_selling_books: TopBook[];
  sales_trend: SalesByPeriod[];
}
