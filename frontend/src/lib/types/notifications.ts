// Notification types and interfaces
import type { User } from '../types';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  userId?: string;
  read: boolean;
  priority: NotificationPriority;
  category: NotificationCategory;
  createdAt: string;
  timestamp: string;
  expiresAt?: string;
  actions?: NotificationAction[];
  metadata?: any;
  actionUrl?: string;
}

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'sale'
  | 'inventory'
  | 'customer'
  | 'system'
  | 'security'
  | 'maintenance';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationCategory =
  | 'sales'
  | 'inventory'
  | 'customers'
  | 'system'
  | 'reports'
  | 'security'
  | 'maintenance';

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  categories: {
    [key in NotificationCategory]: {
      enabled: boolean;
      priority: NotificationPriority;
      channels: NotificationChannel[];
    };
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
    timezone: string;
  };
  frequency: {
    immediate: boolean;
    daily: boolean;
    weekly: boolean;
  };
}

export type NotificationChannel = 'email' | 'push' | 'inapp' | 'sms';

export interface ActivityItem {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string | Date;
  metadata?: Record<string, any>;
  user: User | null;
  notificationId: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: NotificationCategory;
  message: string;
  relatedEntities?: {
    type: 'book' | 'customer' | 'sale' | 'user';
    id: string;
    name: string;
  }[];
}

export type ActivityType =
  | 'user_login'
  | 'user_logout'
  | 'book_added'
  | 'book_updated'
  | 'book_deleted'
  | 'customer_added'
  | 'customer_updated'
  | 'sale_created'
  | 'sale_updated'
  | 'sale_cancelled'
  | 'inventory_low'
  | 'inventory_out'
  | 'report_generated'
  | 'settings_changed'
  | 'user_created'
  | 'user_updated'
  | 'backup_created'
  | 'system_error';

export interface NotificationFilter {
  type?: NotificationType[];
  category?: NotificationCategory[];
  priority?: NotificationPriority[];
  read?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  userId?: string;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}
