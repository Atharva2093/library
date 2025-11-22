// Notification service for managing real-time notifications
import type {
  Notification,
  NotificationFilter,
  NotificationPreferences,
  PaginatedNotifications,
  NotificationStats,
  ActivityItem,
} from '@/lib/types/notifications';

class NotificationService {
  private ws: WebSocket | null = null;
  private listeners: Set<(notification: Notification) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Initialize WebSocket connection for real-time notifications
   */
  connect(userId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // In a real application, this would connect to your WebSocket server
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/notifications';
      this.ws = new WebSocket(`${wsUrl}?userId=${userId}`);

      this.ws.onopen = () => {
        console.log('Notification WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = event => {
        try {
          const notification: Notification = JSON.parse(event.data);
          this.handleIncomingNotification(notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Notification WebSocket disconnected');
        this.attemptReconnect(userId);
      };

      this.ws.onerror = error => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to notification WebSocket:', error);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  /**
   * Subscribe to real-time notifications
   */
  subscribe(callback: (notification: Notification) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Get notifications with pagination and filtering
   */
  async getNotifications(
    page: number = 1,
    pageSize: number = 20,
    filter?: NotificationFilter
  ): Promise<PaginatedNotifications> {
    try {
      // Mock implementation - replace with real API call
      const mockNotifications = this.generateMockNotifications();
      const filteredNotifications = this.applyFilters(mockNotifications, filter);

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedResults = filteredNotifications.slice(startIndex, endIndex);

      return {
        notifications: paginatedResults,
        total: filteredNotifications.length,
        page,
        pageSize,
        hasMore: endIndex < filteredNotifications.length,
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      // Mock implementation - replace with real API call
      console.log(`Marking notification ${notificationId} as read`);

      // Update local storage or state management here
      const notifications = this.getStoredNotifications();
      const updatedNotifications = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      this.storeNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    try {
      // Mock implementation
      console.log(`Marking ${notificationIds.length} notifications as read`);

      const notifications = this.getStoredNotifications();
      const updatedNotifications = notifications.map(n =>
        notificationIds.includes(n.id) ? { ...n, read: true } : n
      );
      this.storeNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw new Error('Failed to mark notifications as read');
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      console.log(`Marking all notifications as read for user ${userId}`);

      const notifications = this.getStoredNotifications();
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      this.storeNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      console.log(`Deleting notification ${notificationId}`);

      const notifications = this.getStoredNotifications();
      const filteredNotifications = notifications.filter(n => n.id !== notificationId);
      this.storeNotifications(filteredNotifications);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId: string): Promise<NotificationStats> {
    try {
      const notifications = this.getStoredNotifications();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats: NotificationStats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        today: notifications.filter(n => new Date(n.createdAt) >= today).length,
        byType: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
      };

      // Calculate statistics
      notifications.forEach(notification => {
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
        stats.byCategory[notification.category] =
          (stats.byCategory[notification.category] || 0) + 1;
        stats.byPriority[notification.priority] =
          (stats.byPriority[notification.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw new Error('Failed to get notification statistics');
    }
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      // Mock implementation - replace with real API call
      const defaultPreferences: NotificationPreferences = {
        userId,
        emailNotifications: true,
        pushNotifications: true,
        inAppNotifications: true,
        categories: {
          sales: { enabled: true, priority: 'medium', channels: ['email', 'inapp'] },
          inventory: { enabled: true, priority: 'high', channels: ['email', 'inapp', 'push'] },
          customers: { enabled: true, priority: 'low', channels: ['inapp'] },
          system: { enabled: true, priority: 'high', channels: ['email', 'inapp', 'push'] },
          reports: { enabled: false, priority: 'low', channels: ['email'] },
          security: {
            enabled: true,
            priority: 'urgent',
            channels: ['email', 'inapp', 'push', 'sms'],
          },
          maintenance: { enabled: true, priority: 'medium', channels: ['email', 'inapp'] },
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'UTC',
        },
        frequency: {
          immediate: true,
          daily: false,
          weekly: false,
        },
      };

      return defaultPreferences;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw new Error('Failed to fetch notification preferences');
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      console.log('Updating notification preferences:', preferences);

      // Store in localStorage for demo purposes
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw new Error('Failed to update notification preferences');
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(userId: string, type: string): Promise<void> {
    try {
      const testNotification: Notification = {
        id: `test-${Date.now()}`,
        type: type as any,
        title: 'Test Notification',
        message: `This is a test ${type} notification to verify your settings.`,
        userId,
        read: false,
        priority: 'medium',
        category: 'system',
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };

      this.handleIncomingNotification(testNotification);
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw new Error('Failed to send test notification');
    }
  }

  /**
   * Get activity feed
   */
  async getActivityFeed(
    page: number = 1,
    pageSize: number = 20,
    userId?: string
  ): Promise<{ activities: ActivityItem[]; total: number; hasMore: boolean }> {
    try {
      // Mock implementation
      const activities = this.generateMockActivities();
      const filteredActivities = userId ? activities.filter(a => a.userId === userId) : activities;

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedResults = filteredActivities.slice(startIndex, endIndex);

      return {
        activities: paginatedResults,
        total: filteredActivities.length,
        hasMore: endIndex < filteredActivities.length,
      };
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      throw new Error('Failed to fetch activity feed');
    }
  }

  // Private helper methods
  private handleIncomingNotification(notification: Notification): void {
    // Store notification
    const notifications = this.getStoredNotifications();
    notifications.unshift(notification);
    this.storeNotifications(notifications.slice(0, 100)); // Keep latest 100

    // Notify all listeners
    this.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });

    // Show browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }
  }

  private attemptReconnect(userId: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(
        () => {
          console.log(
            `Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`
          );
          this.reconnectAttempts++;
          this.connect(userId);
        },
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
      ); // Exponential backoff
    }
  }

  private getStoredNotifications(): Notification[] {
    try {
      const stored = localStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private storeNotifications(notifications: Notification[]): void {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error storing notifications:', error);
    }
  }

  private applyFilters(notifications: Notification[], filter?: NotificationFilter): Notification[] {
    if (!filter) return notifications;

    return notifications.filter(notification => {
      if (filter.type && !filter.type.includes(notification.type)) return false;
      if (filter.category && !filter.category.includes(notification.category)) return false;
      if (filter.priority && !filter.priority.includes(notification.priority)) return false;
      if (filter.read !== undefined && notification.read !== filter.read) return false;
      if (filter.userId && notification.userId !== filter.userId) return false;

      if (filter.dateRange) {
        const notificationDate = new Date(notification.createdAt);
        const startDate = new Date(filter.dateRange.start);
        const endDate = new Date(filter.dateRange.end);
        if (notificationDate < startDate || notificationDate > endDate) return false;
      }

      return true;
    });
  }

  private generateMockNotifications(): Notification[] {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'sale',
        title: 'New Sale Completed',
        message: 'A sale of $45.99 was completed for customer John Doe',
        read: false,
        priority: 'medium',
        category: 'sales',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        data: { saleId: 'S001', amount: 45.99, customer: 'John Doe' },
      },
      {
        id: '2',
        type: 'warning',
        title: 'Low Stock Alert',
        message: 'Book "1984" is running low on stock (3 remaining)',
        read: false,
        priority: 'high',
        category: 'inventory',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        data: { bookId: 'B002', title: '1984', stock: 3 },
      },
      {
        id: '3',
        type: 'customer',
        title: 'New Customer Registered',
        message: 'Jane Smith has registered as a new customer',
        read: true,
        priority: 'low',
        category: 'customers',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        data: { customerId: 'C003', name: 'Jane Smith' },
      },
      {
        id: '4',
        type: 'error',
        title: 'Book Out of Stock',
        message: 'The Great Gatsby is completely out of stock',
        read: false,
        priority: 'urgent',
        category: 'inventory',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        data: { bookId: 'B001', title: 'The Great Gatsby' },
      },
      {
        id: '5',
        type: 'success',
        title: 'Weekly Report Generated',
        message: 'Your weekly sales report has been generated successfully',
        read: true,
        priority: 'low',
        category: 'reports',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        data: { reportId: 'R001', type: 'weekly-sales' },
      },
    ];

    return mockNotifications;
  }

  private generateMockActivities(): ActivityItem[] {
    const mockActivities: ActivityItem[] = [
      {
        id: 1,
        type: 'sale_created',
        title: 'New Sale',
        description: 'Created sale #S001 for $45.99',
        userId: 'user1',
        userName: 'John Admin',
        userRole: 'admin',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        metadata: { saleId: 'S001', amount: 45.99 },
        user: {
          id: 1,
          email: 'john@example.com',
          full_name: 'John Admin',
          is_superuser: true,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
        notificationId: '1',
        read: false,
        priority: 'medium',
        category: 'sales',
        message: 'Created sale #S001 for $45.99',
        relatedEntities: [
          { type: 'sale', id: 'S001', name: 'Sale #S001' },
          { type: 'customer', id: 'C001', name: 'John Doe' },
        ],
      },
      {
        id: 2,
        type: 'book_updated',
        title: 'Book Updated',
        description: 'Updated book "1984" - price changed',
        userId: 'user2',
        userName: 'Jane Manager',
        userRole: 'manager',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        metadata: { bookId: 'B002', changes: ['price'] },
        user: {
          id: 2,
          email: 'jane@example.com',
          full_name: 'Jane Manager',
          is_superuser: false,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
        notificationId: '2',
        read: false,
        priority: 'low',
        category: 'inventory',
        message: 'Updated book "1984" - price changed',
        relatedEntities: [{ type: 'book', id: 'B002', name: '1984' }],
      },
      {
        id: 3,
        type: 'customer_added',
        title: 'New Customer',
        description: 'Added new customer Jane Smith',
        userId: 'user3',
        userName: 'Bob Staff',
        userRole: 'staff',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        metadata: { customerId: 'C003' },
        user: {
          id: 3,
          email: 'bob@example.com',
          full_name: 'Bob Staff',
          is_superuser: false,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
        notificationId: '3',
        read: false,
        priority: 'low',
        category: 'customers',
        message: 'Added new customer Jane Smith',
        relatedEntities: [{ type: 'customer', id: 'C003', name: 'Jane Smith' }],
      },
    ];

    return mockActivities;
  }
}

export const notificationService = new NotificationService();
