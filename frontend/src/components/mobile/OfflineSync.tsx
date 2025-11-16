'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type {
  OfflineSync,
  MobileOrder,
  MobileCustomer,
  MobileInventory,
  MobileSyncResponse,
  MobileCache,
} from '@/lib/types/mobile';
import MobileApiService from '@/lib/services/mobileApiService';
import {
  CloudOff,
  Cloud,
  Upload,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  WifiOff,
  Wifi,
  Database,
  HardDrive,
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  Users,
  Package,
} from 'lucide-react';

interface OfflineSyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSync: OfflineSync[];
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  lastSync: Date | null;
  cacheSize: number;
  maxCacheSize: number;
  syncProgress: number;

  // Methods
  queueAction: (action: Omit<OfflineSync, 'id' | 'timestamp' | 'synced' | 'attempts'>) => void;
  forcSync: () => Promise<void>;
  clearCache: () => Promise<void>;
  getCachedData: <T>(key: string) => T | null;
  setCachedData: <T>(key: string, data: T, expirationMinutes?: number) => void;
  getStorageInfo: () => { used: number; available: number; total: number };
}

const OfflineSyncContext = createContext<OfflineSyncContextType | null>(null);

interface OfflineSyncProviderProps {
  children: ReactNode;
  apiService: MobileApiService;
  maxCacheSize?: number; // in MB
  syncInterval?: number; // in minutes
}

export const OfflineSyncProvider: React.FC<OfflineSyncProviderProps> = ({
  children,
  apiService,
  maxCacheSize = 50,
  syncInterval = 5,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSync, setPendingSync] = useState<OfflineSync[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [cacheSize, setCacheSize] = useState(0);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    initializeOfflineSync();
    setupEventListeners();
    loadPendingSync();
    calculateCacheSize();

    // Set up periodic sync
    const syncIntervalId = setInterval(
      () => {
        if (isOnline && pendingSync.length > 0) {
          performSync();
        }
      },
      syncInterval * 60 * 1000
    );

    return () => {
      clearInterval(syncIntervalId);
    };
  }, []);

  useEffect(() => {
    savePendingSync();
  }, [pendingSync]);

  const initializeOfflineSync = () => {
    // Register service worker for background sync
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('SW registered for offline sync:', registration);

          // Listen for background sync events
          navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        })
        .catch(error => {
          console.error('SW registration failed:', error);
        });
    }

    // Load last sync time
    const lastSyncTime = localStorage.getItem('lastSyncTime');
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime));
    }
  };

  const setupEventListeners = () => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Connection restored');
      if (pendingSync.length > 0) {
        performSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const loadPendingSync = () => {
    try {
      const saved = localStorage.getItem('pendingSync');
      if (saved) {
        const data = JSON.parse(saved);
        setPendingSync(
          data.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load pending sync data:', error);
    }
  };

  const savePendingSync = () => {
    try {
      localStorage.setItem('pendingSync', JSON.stringify(pendingSync));
    } catch (error) {
      console.error('Failed to save pending sync data:', error);
    }
  };

  const calculateCacheSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (key.startsWith('mobile_cache_')) {
        try {
          total += localStorage[key].length;
        } catch (e) {
          // Ignore errors
        }
      }
    }
    setCacheSize(Math.round((total / 1024 / 1024) * 100) / 100); // Convert to MB
  };

  const queueAction = (action: Omit<OfflineSync, 'id' | 'timestamp' | 'synced' | 'attempts'>) => {
    const newAction: OfflineSync = {
      ...action,
      id: generateId(),
      timestamp: new Date(),
      synced: false,
      attempts: 0,
    };

    setPendingSync(prev => [...prev, newAction]);

    // If online, try to sync immediately
    if (isOnline) {
      performSync();
    }

    // Register for background sync
    if (
      'serviceWorker' in navigator &&
      'sync' in (window.ServiceWorkerRegistration?.prototype || {})
    ) {
      navigator.serviceWorker.ready
        .then(registration => {
          if ('sync' in registration) {
            (registration as any).sync.register('background-sync').catch((error: any) => {
              console.warn('Background sync registration failed:', error);
            });
          }
        })
        .catch(error => {
          console.warn('Service worker ready failed:', error);
        });
    }
  };

  const performSync = async () => {
    if (isSyncing || pendingSync.length === 0) return;

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncProgress(0);

    try {
      const totalActions = pendingSync.length;
      let processedActions = 0;
      const errors: string[] = [];

      // Process actions in batches
      const batchSize = 5;
      for (let i = 0; i < pendingSync.length; i += batchSize) {
        const batch = pendingSync.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async action => {
            try {
              await processSyncAction(action);
              processedActions++;
              setSyncProgress((processedActions / totalActions) * 100);
            } catch (error) {
              console.error('Sync action failed:', error);
              errors.push(`${action.entityType} ${action.action} failed`);

              // Update attempt count
              setPendingSync(prev =>
                prev.map(item =>
                  item.id === action.id
                    ? {
                        ...item,
                        attempts: item.attempts + 1,
                        lastError: error instanceof Error ? error.message : 'Unknown error',
                      }
                    : item
                )
              );
            }
          })
        );
      }

      // Remove successfully synced actions
      setPendingSync(prev => prev.filter(action => action.attempts < 3));

      const now = new Date();
      setLastSync(now);
      localStorage.setItem('lastSyncTime', now.toISOString());

      if (errors.length === 0) {
        setSyncStatus('success');
      } else {
        setSyncStatus('error');
        console.error('Sync completed with errors:', errors);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);

      // Reset status after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    }
  };

  const processSyncAction = async (action: OfflineSync): Promise<void> => {
    switch (action.entityType) {
      case 'order':
        if (action.action === 'create') {
          await apiService.createOrder(action.data);
        } else if (action.action === 'update') {
          await apiService.updateOrder(action.entityId, action.data);
        }
        break;

      case 'customer':
        if (action.action === 'create') {
          await apiService.createCustomer(action.data);
        } else if (action.action === 'update') {
          await apiService.updateCustomer(action.entityId, action.data);
        }
        break;

      case 'inventory':
        if (action.action === 'update') {
          await apiService.updateInventoryStock(
            action.entityId,
            action.data.stock,
            action.data.location
          );
        }
        break;

      default:
        console.warn('Unknown sync action type:', action.entityType);
    }
  };

  const forcSync = async () => {
    await performSync();
  };

  const clearCache = async () => {
    try {
      for (let key in localStorage) {
        if (key.startsWith('mobile_cache_')) {
          localStorage.removeItem(key);
        }
      }
      calculateCacheSize();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const getCachedData = function <T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`mobile_cache_${key}`);
      if (!cached) return null;

      const data = JSON.parse(cached);

      // Check if expired
      if (data.expiresAt && new Date() > new Date(data.expiresAt)) {
        localStorage.removeItem(`mobile_cache_${key}`);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  };

  const setCachedData = function <T>(key: string, data: T, expirationMinutes: number = 60): void {
    try {
      const cacheData = {
        value: data,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + expirationMinutes * 60 * 1000),
      };

      localStorage.setItem(`mobile_cache_${key}`, JSON.stringify(cacheData));
      calculateCacheSize();

      // Clean up old cache if size limit exceeded
      if (cacheSize > maxCacheSize) {
        cleanOldCache();
      }
    } catch (error) {
      console.error('Failed to set cached data:', error);
    }
  };

  const cleanOldCache = () => {
    const cacheItems: { key: string; timestamp: Date; size: number }[] = [];

    for (let key in localStorage) {
      if (key.startsWith('mobile_cache_')) {
        try {
          const data = JSON.parse(localStorage[key]);
          cacheItems.push({
            key,
            timestamp: new Date(data.timestamp),
            size: localStorage[key].length,
          });
        } catch (e) {
          localStorage.removeItem(key);
        }
      }
    }

    // Sort by timestamp (oldest first)
    cacheItems.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Remove oldest items until under size limit
    let currentSize = cacheSize;
    for (const item of cacheItems) {
      if (currentSize <= maxCacheSize * 0.8) break; // Leave some buffer

      localStorage.removeItem(item.key);
      currentSize -= item.size / 1024 / 1024;
    }

    calculateCacheSize();
  };

  const getStorageInfo = () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        return {
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
          total: estimate.quota || 0,
        };
      });
    }

    // Fallback for browsers that don't support storage API
    return {
      used: cacheSize * 1024 * 1024,
      available: (maxCacheSize - cacheSize) * 1024 * 1024,
      total: maxCacheSize * 1024 * 1024,
    };
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data?.type === 'background-sync') {
      performSync();
    }
  };

  const generateId = (): string => {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const contextValue: OfflineSyncContextType = {
    isOnline,
    isSyncing,
    pendingSync,
    syncStatus,
    lastSync,
    cacheSize,
    maxCacheSize,
    syncProgress,
    queueAction,
    forcSync,
    clearCache,
    getCachedData,
    setCachedData,
    getStorageInfo,
  };

  return <OfflineSyncContext.Provider value={contextValue}>{children}</OfflineSyncContext.Provider>;
};

export const useOfflineSync = () => {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
  }
  return context;
};

// Offline Status Component
export const OfflineStatus: React.FC<{
  showDetails?: boolean;
}> = ({ showDetails = false }) => {
  const { isOnline, isSyncing, pendingSync, syncStatus, lastSync, syncProgress, forcSync } =
    useOfflineSync();

  if (isOnline && pendingSync.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border p-3 ${
        isOnline
          ? isSyncing
            ? 'border-blue-200 bg-blue-50'
            : 'border-green-200 bg-green-50'
          : 'border-orange-200 bg-orange-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            isSyncing ? (
              <RotateCcw className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
              <Wifi className="h-4 w-4 text-green-500" />
            )
          ) : (
            <WifiOff className="h-4 w-4 text-orange-500" />
          )}

          <span className="text-sm font-medium">
            {isOnline ? (isSyncing ? 'Syncing...' : 'Online') : 'Offline'}
          </span>

          {pendingSync.length > 0 && (
            <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800">
              {pendingSync.length} pending
            </span>
          )}
        </div>

        {isOnline && pendingSync.length > 0 && !isSyncing && (
          <button onClick={forcSync} className="text-xs text-blue-600 hover:text-blue-800">
            Sync Now
          </button>
        )}
      </div>

      {showDetails && (
        <div className="mt-2 space-y-1">
          {isSyncing && (
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${syncProgress}%` }}
              ></div>
            </div>
          )}

          {lastSync && (
            <p className="text-xs text-gray-600">Last sync: {lastSync.toLocaleTimeString()}</p>
          )}

          {syncStatus === 'error' && (
            <p className="text-xs text-red-600">
              Some items failed to sync. Will retry automatically.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Sync Queue Component
export const SyncQueue: React.FC = () => {
  const { pendingSync, clearCache, cacheSize, maxCacheSize } = useOfflineSync();

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="h-4 w-4" />;
      case 'update':
        return <Edit className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'customer':
        return <Users className="h-4 w-4" />;
      case 'inventory':
        return <Package className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Sync Queue</h3>
        <button onClick={clearCache} className="text-sm text-red-600 hover:text-red-800">
          Clear Cache
        </button>
      </div>

      {/* Cache Usage */}
      <div className="rounded-lg bg-gray-50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Cache Usage</span>
          <span className="text-sm text-gray-600">
            {cacheSize.toFixed(1)} / {maxCacheSize} MB
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              cacheSize / maxCacheSize > 0.8 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min((cacheSize / maxCacheSize) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Pending Sync Actions */}
      <div className="space-y-2">
        {pendingSync.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <p className="text-gray-600">All data synced</p>
          </div>
        ) : (
          pendingSync.map(action => (
            <div
              key={action.id}
              className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex items-center space-x-2">
                {getEntityIcon(action.entityType)}
                {getActionIcon(action.action)}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {action.action} {action.entityType}
                </p>
                <p className="text-xs text-gray-600">
                  {action.timestamp.toLocaleTimeString()}
                  {action.attempts > 0 && (
                    <span className="ml-2 text-red-600">{action.attempts} failed attempts</span>
                  )}
                </p>
              </div>

              <div className="text-right">
                {action.attempts > 0 ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Clock className="h-4 w-4 text-orange-500" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
