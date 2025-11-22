'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode
} from 'react';
import type {
  MobileSettings,
  NotificationAction,
  PushNotification as ApiPushNotification
} from '@/lib/types/mobile';
import {
  AlertTriangle,
  Bell,
  BellRing,
  DollarSign,
  Info,
  Package,
  ShoppingCart,
  X
} from 'lucide-react';

// Notification type constants
const NOTIFICATION_TYPES = {
  ORDER: 'order',
  PROMOTION: 'promotion',
  INVENTORY: 'inventory',
  SYSTEM: 'system',
  REMINDER: 'reminder'
} as const;

type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// Local storage key
const STORAGE_KEY = 'mobile-notification-settings';

// Default settings
const DEFAULT_SETTINGS: MobileSettings = {
  pushNotifications: {
    enabled: true,
    orderUpdates: true,
    promotions: true,
    inventory: true,
    systemAlerts: true,
    quietHours: { start: '22:00', end: '08:00' }
  },
  appearance: {
    theme: 'system',
    fontSize: 'medium',
    colorScheme: 'default'
  },
  sync: {
    autoSync: true,
    syncFrequency: 15,
    syncOnWifiOnly: false,
    backgroundSync: true
  },
  security: {
    biometricAuth: false,
    autoLock: true,
    lockTimeout: 5,
    requirePinForSensitive: false
  },
  accessibility: {
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    voiceCommands: false
  }
};

// Helper to check if we're on client
const isClient = () => typeof window !== 'undefined';

// Convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  if (!isClient()) {
    return new Uint8Array(0);
  }
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Merge settings helper
function mergeSettings(base: MobileSettings, partial: Partial<MobileSettings>): MobileSettings {
  return {
    ...base,
    ...partial,
    pushNotifications: {
      ...base.pushNotifications,
      ...partial.pushNotifications
    },
    appearance: {
      ...base.appearance,
      ...partial.appearance
    },
    sync: {
      ...base.sync,
      ...partial.sync
    },
    security: {
      ...base.security,
      ...partial.security
    },
    accessibility: {
      ...base.accessibility,
      ...partial.accessibility
    }
  };
}

// Local notification interface
interface LocalNotification extends ApiPushNotification {
  read: boolean;
  timestamp: Date;
}

// Context type
interface NotificationContextType {
  notifications: LocalNotification[];
  unreadCount: number;
  isSubscribed: boolean;
  isLoading: boolean;
  supportsPush: boolean;
  error: string | null;
  settings: MobileSettings;
  notificationPermission: NotificationPermission;
  initializeNotifications: () => Promise<void>;
  subscribeToNotifications: () => Promise<void>;
  unsubscribeFromNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  showNotification: (notification: LocalNotification) => void;
  updateSettings: (settings: Partial<MobileSettings>) => void;
  clearError: () => void;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Safe storage setter
function safeStorageSet(value: MobileSettings) {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

// Create sample notifications
function createSampleNotifications(): LocalNotification[] {
  return [
    {
      id: 'welcome-1',
      userId: 'mobile-user',
      title: 'Welcome to the mobile dashboard',
      body: 'You will receive updates for orders and promotions here.',
      type: NOTIFICATION_TYPES.SYSTEM,
      priority: 'normal',
      status: 'delivered',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 15)
    } as LocalNotification,
    {
      id: 'order-2',
      userId: 'mobile-user',
      title: 'Order #3424 Shipped',
      body: 'The latest shipment is on its way to the warehouse.',
      type: NOTIFICATION_TYPES.ORDER,
      priority: 'high',
      status: 'delivered',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60)
    } as LocalNotification
  ];
}

// Provider component
export function PushNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<MobileSettings>(() => {
    if (isClient()) {
      try {
        const persisted = window.localStorage.getItem(STORAGE_KEY);
        if (persisted) {
          const parsed = JSON.parse(persisted) as Partial<MobileSettings>;
          return mergeSettings(DEFAULT_SETTINGS, parsed);
        }
      } catch {
        // Ignore corrupted storage
      }
    }
    return DEFAULT_SETTINGS;
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supportsPush, setSupportsPush] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<string | null>(null);

  // Load service worker
  useEffect(() => {
    if (!isClient()) return;

    let isMounted = true;

    async function loadServiceWorker() {
      if (!('serviceWorker' in navigator)) {
        setSupportsPush(false);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        if (!isMounted) return;
        
        setServiceWorkerRegistration(registration);
        setSupportsPush('PushManager' in window);
        
        const existing = await registration.pushManager.getSubscription();
        setPushSubscription(existing);
        setIsSubscribed(!!existing);
      } catch (err) {
        console.warn('Service worker not ready:', err);
        setSupportsPush(false);
      }
    }

    loadServiceWorker();

    function handleControllerChange() {
      if (isMounted) {
        loadServiceWorker();
      }
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      isMounted = false;
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // Check notification permission
  useEffect(() => {
    if (!isClient() || !('Notification' in window)) return;
    setNotificationPermission(Notification.permission);
  }, []);

  // Update settings
  const updateSettings = useCallback((next: Partial<MobileSettings>) => {
    setSettings(prev => {
      const merged = mergeSettings(prev, next);
      safeStorageSet(merged);
      return merged;
    });
  }, []);

  // Check quiet hours
  const isQuietHours = useCallback(() => {
    const quietHours = settings.pushNotifications.quietHours;
    if (!quietHours || !isClient()) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = quietHours.start.split(':').map(Number);
    const [endHour, endMin] = quietHours.end.split(':').map(Number);
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;

    return startTotal <= endTotal
      ? currentMinutes >= startTotal && currentMinutes <= endTotal
      : currentMinutes >= startTotal || currentMinutes <= endTotal;
  }, [settings.pushNotifications.quietHours]);

  // Check if notification type is enabled
  const isNotificationTypeEnabled = useCallback((type: string) => {
    const typeMap: Record<string, keyof MobileSettings['pushNotifications']> = {
      order: 'orderUpdates',
      promotion: 'promotions',
      inventory: 'inventory',
      system: 'systemAlerts',
      reminder: 'systemAlerts'
    };
    const key = typeMap[type];
    return key ? settings.pushNotifications[key] : false;
  }, [settings.pushNotifications]);

  // Initialize notifications
  const initializeNotifications = useCallback(async () => {
    if (!isClient()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!('Notification' in window)) {
        throw new Error('Browser notifications are not available');
      }

      const current = Notification.permission;
      if (current === 'default') {
        const granted = await Notification.requestPermission();
        setNotificationPermission(granted);
        if (granted !== 'granted') {
          throw new Error('Notification permission denied');
        }
      } else {
        setNotificationPermission(current);
        if (current === 'denied') {
          throw new Error('Notifications are blocked');
        }
      }

      const baseline = notifications.length ? notifications : createSampleNotifications();
      setNotifications(baseline);
      setUnreadCount(baseline.filter(n => !n.read).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    } finally {
      setIsLoading(false);
    }
  }, [notifications]);

  // Subscribe to push notifications
  const subscribeToNotifications = useCallback(async () => {
    if (!isClient()) return;

    if (!supportsPush || !serviceWorkerRegistration) {
      setError('Push messaging is not available');
      return;
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      setError('Missing VAPID key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const binaryKey = urlBase64ToUint8Array(vapidKey);
      const subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: binaryKey
      });
      setPushSubscription(subscription);
      setIsSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription failed');
    } finally {
      setIsLoading(false);
    }
  }, [serviceWorkerRegistration, supportsPush]);

  // Unsubscribe from push notifications
  const unsubscribeFromNotifications = useCallback(async () => {
    if (!isClient()) return;

    if (!pushSubscription) {
      setIsSubscribed(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await pushSubscription.unsubscribe();
    } catch (err) {
      console.warn('Unsubscribe failed', err);
    } finally {
      setPushSubscription(null);
      setIsSubscribed(false);
      setIsLoading(false);
    }
  }, [pushSubscription]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, read: true } : n));
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      setUnreadCount(0);
      return updated;
    });
  }, []);

  // Show notification
  const showNotification = useCallback((notification: LocalNotification) => {
    if (!isClient() || !('Notification' in window)) return;
    if (notificationPermission !== 'granted') return;
    if (isQuietHours()) return;
    if (!isNotificationTypeEnabled(notification.type)) return;

    try {
      const options: NotificationOptions = {
        body: notification.body,
        icon: notification.image || '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical',
        silent: notification.priority === 'low'
      };

      const browserNotification = new Notification(notification.title, options);
      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        markAsRead(notification.id);
      };

      if (notification.priority !== 'critical') {
        setTimeout(() => browserNotification.close(), 4000);
      }
    } catch (err) {
      console.error('Failed to display notification', err);
    }
  }, [isQuietHours, notificationPermission, isNotificationTypeEnabled, markAsRead]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const contextValue = useMemo<NotificationContextType>(() => ({
    notifications,
    unreadCount,
    isSubscribed,
    isLoading,
    supportsPush,
    error,
    settings,
    notificationPermission,
    initializeNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    markAsRead,
    markAllAsRead,
    showNotification,
    updateSettings,
    clearError
  }), [
    notifications,
    unreadCount,
    isSubscribed,
    isLoading,
    supportsPush,
    error,
    settings,
    notificationPermission,
    initializeNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    markAsRead,
    markAllAsRead,
    showNotification,
    updateSettings,
    clearError
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notifications
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used inside PushNotificationProvider');
  }
  return context;
}

// Helper to get priority-based border class
function getPriorityClass(priority: LocalNotification['priority']): string {
  if (priority === 'critical') return 'border-l-red-500 bg-red-50';
  if (priority === 'high') return 'border-l-orange-500 bg-orange-50';
  if (priority === 'normal') return 'border-l-blue-500 bg-blue-50';
  return 'border-l-gray-300 bg-gray-50';
}

// Notification icon component
export function NotificationIcon({ notification }: { notification: LocalNotification }) {
  const iconClass = notification.priority === 'critical'
    ? 'text-red-500'
    : notification.priority === 'high'
      ? 'text-orange-500'
      : 'text-gray-500';

  const Icon = {
    order: ShoppingCart,
    promotion: DollarSign,
    inventory: Package,
    system: AlertTriangle,
    reminder: Bell
  }[notification.type] || Info;

  return <Icon className={`h-5 w-5 ${iconClass}`} />;
}

// Notification item component
export function NotificationItem({
  notification,
  onMarkAsRead,
  onAction
}: {
  notification: LocalNotification;
  onMarkAsRead: (id: string) => void;
  onAction?: (action: NotificationAction) => void;
}) {
  function handleAction(action: NotificationAction) {
    onAction?.(action);
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  }

  return (
    <div className={`p-4 border-l-4 rounded-r-lg shadow-sm ${getPriorityClass(notification.priority)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <NotificationIcon notification={notification} />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
            <p className="text-xs text-gray-500 mt-2">
              {notification.timestamp.toLocaleString()}
            </p>
          </div>
        </div>
        {!notification.read && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Mark as read"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {notification.actions && notification.actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {notification.actions.map(action => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              {action.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Notification bell component
export function NotificationBell({
  unreadCount,
  isSubscribed,
  onClick
}: {
  unreadCount: number;
  isSubscribed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Notifications"
    >
      {isSubscribed ? <BellRing className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}

// Notification settings component
export function NotificationSettings({
  settings,
  onUpdateSettings,
  onSubscribe,
  onUnsubscribe,
  isSubscribed,
  isLoading
}: {
  settings: MobileSettings;
  onUpdateSettings: (settings: Partial<MobileSettings>) => void;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  isSubscribed: boolean;
  isLoading: boolean;
}) {
  function handleToggle(type: NotificationType) {
    const typeMap: Record<NotificationType, keyof MobileSettings['pushNotifications']> = {
      order: 'orderUpdates',
      promotion: 'promotions',
      inventory: 'inventory',
      system: 'systemAlerts',
      reminder: 'systemAlerts'
    };
    const key = typeMap[type];
    onUpdateSettings({
      pushNotifications: {
        ...settings.pushNotifications,
        [key]: !settings.pushNotifications[key]
      }
    });
  }

  function handleQuietHours(field: 'start' | 'end', value: string) {
    const current = settings.pushNotifications.quietHours || { start: '22:00', end: '08:00' };
    onUpdateSettings({
      pushNotifications: {
        ...settings.pushNotifications,
        quietHours: {
          ...current,
          [field]: value
        }
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
        <p className="text-sm text-gray-600">Control push permissions and categories</p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
          <p className="text-sm text-gray-600">Enable or disable push delivery</p>
        </div>
        <button
          onClick={() => onUpdateSettings({
            pushNotifications: {
              ...settings.pushNotifications,
              enabled: !settings.pushNotifications.enabled
            }
          })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.pushNotifications.enabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          aria-pressed={settings.pushNotifications.enabled}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.pushNotifications.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {settings.pushNotifications.enabled && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Subscription</h4>
              <p className="text-sm text-gray-600">
                {isSubscribed ? 'Subscribed to push' : 'Currently offline'}
              </p>
            </div>
            <button
              onClick={isSubscribed ? onUnsubscribe : onSubscribe}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                isSubscribed
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              } disabled:opacity-50`}
            >
              {isLoading ? 'Please wait' : isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </button>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-900">Categories</h4>
        <div className="space-y-2">
          {(Object.values(NOTIFICATION_TYPES) as NotificationType[]).map(type => {
            const typeMap: Record<NotificationType, keyof MobileSettings['pushNotifications']> = {
              order: 'orderUpdates',
              promotion: 'promotions',
              inventory: 'inventory',
              system: 'systemAlerts',
              reminder: 'systemAlerts'
            };
            const key = typeMap[type];
            return (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{type}</span>
                <button
                  onClick={() => handleToggle(type)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.pushNotifications[key] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.pushNotifications[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900">Quiet Hours</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700">Start</label>
            <input
              type="time"
              value={settings.pushNotifications.quietHours?.start ?? '22:00'}
              onChange={e => handleQuietHours('start', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">End</label>
            <input
              type="time"
              value={settings.pushNotifications.quietHours?.end ?? '08:00'}
              onChange={e => handleQuietHours('end', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Notifications will be silenced during these hours.</p>
      </div>
    </div>
  );
}

export default PushNotificationProvider;
