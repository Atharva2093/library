// Service exports for easy importing
export { default as authService } from './auth';
export { default as booksService, authorsService, categoriesService } from './books';
export { default as customersService } from './customers';
export { default as salesService, analyticsService } from './sales';
export { exportService } from './exportService';

// Re-export types for convenience
export type * from '../types';

// Service collection for dependency injection or centralized access
export const services = {
  auth: require('./auth').default,
  books: require('./books').default,
  customers: require('./customers').default,
  sales: require('./sales').default,
  analytics: require('./sales').analyticsService,
  authors: require('./books').authorsService,
  categories: require('./books').categoriesService,
};

// Error handling utilities
export class ApiServiceError extends Error {
  public status?: number;
  public code?: string;
  public data?: any;

  constructor(message: string, status?: number, code?: string, data?: any) {
    super(message);
    this.name = 'ApiServiceError';
    this.status = status;
    this.code = code;
    this.data = data;
  }

  static fromApiError(error: any): ApiServiceError {
    return new ApiServiceError(
      error.message || 'An unexpected error occurred',
      error.status,
      error.code,
      error.data
    );
  }
}

// Service response wrapper for consistent error handling
export const withErrorHandling = async <T>(serviceCall: () => Promise<T>): Promise<T> => {
  try {
    return await serviceCall();
  } catch (error: any) {
    throw ApiServiceError.fromApiError(error);
  }
};

// Cache utilities for service responses
export class ServiceCache {
  private static cache = new Map<string, { data: any; expires: number }>();

  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  static set<T>(key: string, data: T, ttlMinutes = 5): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMinutes * 60 * 1000,
    });
  }

  static clear(): void {
    this.cache.clear();
  }

  static delete(key: string): void {
    this.cache.delete(key);
  }
}

// Service configuration
export const serviceConfig = {
  // Default pagination size
  defaultPageSize: 20,

  // Cache TTL in minutes
  cacheTTL: {
    books: 10,
    authors: 30,
    categories: 60,
    customers: 5,
    sales: 2,
    analytics: 15,
  },

  // File upload limits
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocumentTypes: [
      'application/pdf',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
};

// Utility functions for common operations
export const serviceUtils = {
  // Format currency
  formatCurrency: (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  // Format date
  formatDate: (date: string | Date, format: 'short' | 'long' = 'short'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: format === 'short' ? 'short' : 'long',
    }).format(d);
  },

  // Format relative time
  formatRelativeTime: (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  },

  // Generate slug from string
  generateSlug: (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  // Validate email
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  // Debounce function for search
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  },
};
