'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { notificationService } from '@/lib/services/notificationService';
import type {
  Notification,
  NotificationStats,
  NotificationPreferences,
  NotificationFilter,
  ActivityItem,
} from '@/lib/types/notifications';

interface NotificationContextType {
  notifications: Notification[];
  stats: NotificationStats | null;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  updatePreferences: (preferences: NotificationPreferences) => Promise<void>;
  sendTestNotification: (type: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  getActivityFeed: (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    priority?: string;
    startDate?: string;
  }) => Promise<{ items: ActivityItem[]; totalPages: number }>;
  markNotificationAsRead: (id: number) => Promise<void>;

  // Real-time subscription
  subscribe: (callback: (notification: Notification) => void) => () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize notifications and WebSocket connection
  useEffect(() => {
    if (userId) {
      initializeNotifications();
      connectWebSocket();
    }

    return () => {
      notificationService.disconnect();
    };
  }, [userId]);

  const initializeNotifications = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load initial data
      const [notificationsData, statsData, preferencesData] = await Promise.all([
        notificationService.getNotifications(1, 50),
        notificationService.getNotificationStats(userId),
        notificationService.getPreferences(userId),
      ]);

      setNotifications(notificationsData.notifications);
      setStats(statsData);
      setPreferences(preferencesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      console.error('Failed to initialize notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (!userId) return;

    try {
      notificationService.connect(userId);
    } catch (err) {
      console.error('Failed to connect to notification WebSocket:', err);
    }
  };

  // Subscribe to real-time notifications
  const subscribe = useCallback((callback: (notification: Notification) => void) => {
    const unsubscribe = notificationService.subscribe(notification => {
      // Update local state
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);

      // Update stats
      setStats(prev =>
        prev
          ? {
              ...prev,
              total: prev.total + 1,
              unread: prev.unread + 1,
              byType: {
                ...prev.byType,
                [notification.type]: (prev.byType[notification.type] || 0) + 1,
              },
              byCategory: {
                ...prev.byCategory,
                [notification.category]: (prev.byCategory[notification.category] || 0) + 1,
              },
              byPriority: {
                ...prev.byPriority,
                [notification.priority]: (prev.byPriority[notification.priority] || 0) + 1,
              },
            }
          : null
      );

      // Call external callback
      callback(notification);
    });

    return unsubscribe;
  }, []);

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);

      setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));

      setStats(prev => (prev ? { ...prev, unread: prev.unread - 1 } : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
      throw err;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await notificationService.markAllAsRead(userId);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setStats(prev => (prev ? { ...prev, unread: 0 } : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
      throw err;
    }
  };

  // Delete single notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);

      const notificationToDelete = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      if (notificationToDelete) {
        setStats(prev =>
          prev
            ? {
                ...prev,
                total: prev.total - 1,
                unread: notificationToDelete.read ? prev.unread : prev.unread - 1,
                byType: {
                  ...prev.byType,
                  [notificationToDelete.type]: Math.max(
                    0,
                    (prev.byType[notificationToDelete.type] || 0) - 1
                  ),
                },
                byCategory: {
                  ...prev.byCategory,
                  [notificationToDelete.category]: Math.max(
                    0,
                    (prev.byCategory[notificationToDelete.category] || 0) - 1
                  ),
                },
                byPriority: {
                  ...prev.byPriority,
                  [notificationToDelete.priority]: Math.max(
                    0,
                    (prev.byPriority[notificationToDelete.priority] || 0) - 1
                  ),
                },
              }
            : null
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
      throw err;
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      // Delete all notifications one by one (in a real app, you'd have a bulk delete endpoint)
      await Promise.all(notifications.map(n => notificationService.deleteNotification(n.id)));

      setNotifications([]);
      setStats(prev =>
        prev
          ? {
              ...prev,
              total: 0,
              unread: 0,
              byType: Object.keys(prev.byType).reduce(
                (acc, key) => ({ ...acc, [key]: 0 }),
                {} as any
              ),
              byCategory: Object.keys(prev.byCategory).reduce(
                (acc, key) => ({ ...acc, [key]: 0 }),
                {} as any
              ),
              byPriority: Object.keys(prev.byPriority).reduce(
                (acc, key) => ({ ...acc, [key]: 0 }),
                {} as any
              ),
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear notifications');
      throw err;
    }
  };

  // Update notification preferences
  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await notificationService.updatePreferences(newPreferences);
      setPreferences(newPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    }
  };

  // Send test notification
  const sendTestNotification = async (type: string) => {
    if (!userId) return;

    try {
      await notificationService.sendTestNotification(userId, type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test notification');
      throw err;
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const [notificationsData, statsData] = await Promise.all([
        notificationService.getNotifications(1, 50),
        notificationService.getNotificationStats(userId),
      ]);

      setNotifications(notificationsData.notifications);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Get activity feed
  const getActivityFeed = async (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    priority?: string;
    startDate?: string;
  }) => {
    try {
      // For now, return mock data. In a real app, this would call the notificationService
      const mockActivities: ActivityItem[] = [
        {
          id: 1,
          type: 'sale_created',
          title: 'New Sale Created',
          description: 'Sale #1234 was created for $45.99',
          userId: userId || '1',
          userName: 'John Doe',
          userRole: 'admin',
          timestamp: new Date().toISOString(),
          metadata: { saleId: '1234', amount: 45.99 },
          user: {
            id: 1,
            email: 'john@example.com',
            full_name: 'John Doe',
            is_superuser: true,
            is_active: true,
            created_at: '',
            updated_at: '',
          },
          notificationId: '1',
          read: false,
          priority: 'medium',
          category: 'sales',
          message: 'Sale #1234 was created for $45.99',
          relatedEntities: [
            { type: 'customer', id: '1', name: 'Jane Smith' },
            { type: 'book', id: '1', name: 'The Great Gatsby' },
          ],
        },
      ];

      return {
        items: mockActivities,
        totalPages: 1,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity feed');
      throw err;
    }
  };

  // Mark notification as read (by ID number)
  const markNotificationAsRead = async (id: number) => {
    try {
      // This would call the service in a real implementation
      console.log('Marking notification as read:', id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
      throw err;
    }
  };

  // Request notification permissions
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  const value: NotificationContextType = {
    notifications,
    stats,
    preferences,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updatePreferences,
    sendTestNotification,
    refreshNotifications,
    getActivityFeed,
    markNotificationAsRead,
    subscribe,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Custom hook for real-time notification subscription
export const useNotificationSubscription = (
  callback: (notification: Notification) => void,
  deps: React.DependencyList = []
) => {
  const { subscribe } = useNotifications();

  useEffect(() => {
    const unsubscribe = subscribe(callback);
    return unsubscribe;
  }, [subscribe, ...deps]);
};
