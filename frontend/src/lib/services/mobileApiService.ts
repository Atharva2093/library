// Mobile API Service
// Comprehensive API layer for mobile cross-platform integration

import type {
  MobileDevice,
  MobileSession,
  MobileOrder,
  MobileOrderItem,
  MobileCustomer,
  MobileInventory,
  PushNotification,
  OfflineSync,
  MobileApiResponse,
  MobileSyncResponse,
  MobileAnalytics,
  MobileConfiguration,
  BiometricAuth,
  BarcodeScanner,
  MobilePayment,
  MobileLocationService,
} from '@/lib/types/mobile';

class MobileApiService {
  private baseUrl: string;
  private apiKey: string;
  private deviceId: string;
  private authToken?: string;
  private offlineQueue: OfflineSync[] = [];
  private isOnline: boolean = true;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    this.apiKey = process.env.NEXT_PUBLIC_API_KEY || '';
    this.deviceId = this.generateDeviceId();
    this.setupNetworkMonitoring();
    this.initializeOfflineSync();
  }

  // Generate unique device ID
  private generateDeviceId(): string {
    // Try to get existing device ID from storage
    if (typeof window !== 'undefined') {
      const existingId = localStorage.getItem('mobile_device_id');
      if (existingId) return existingId;
    }

    // Generate new device ID
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    const deviceId = `mobile_${timestamp}_${randomStr}`;

    // Store in localStorage if available
    if (typeof window !== 'undefined') {
      localStorage.setItem('mobile_device_id', deviceId);
    }

    return deviceId;
  }

  // Device Management
  async registerDevice(device: Partial<MobileDevice>): Promise<MobileApiResponse<MobileDevice>> {
    try {
      const deviceData = {
        ...device,
        deviceId: this.deviceId,
        lastSeen: new Date(),
        isActive: true,
      };

      const response = await this.makeRequest<MobileDevice>('/mobile/device/register', {
        method: 'POST',
        body: JSON.stringify(deviceData),
      });

      return response;
    } catch (error) {
      return this.handleError('DEVICE_REGISTRATION_FAILED', error);
    }
  }

  async updateDevice(updates: Partial<MobileDevice>): Promise<MobileApiResponse<MobileDevice>> {
    try {
      const response = await this.makeRequest<MobileDevice>(`/mobile/device/${this.deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...updates,
          lastSeen: new Date(),
        }),
      });

      return response;
    } catch (error) {
      return this.handleError('DEVICE_UPDATE_FAILED', error);
    }
  }

  async getDeviceInfo(): Promise<MobileApiResponse<MobileDevice>> {
    try {
      return await this.makeRequest<MobileDevice>(`/mobile/device/${this.deviceId}`);
    } catch (error) {
      return this.handleError('DEVICE_INFO_FAILED', error);
    }
  }

  // Session Management
  async createSession(
    userId: string,
    location?: { latitude: number; longitude: number }
  ): Promise<MobileApiResponse<MobileSession>> {
    try {
      const sessionData = {
        deviceId: this.deviceId,
        userId,
        startTime: new Date(),
        location,
        isActive: true,
        activities: [],
      };

      const response = await this.makeRequest<MobileSession>('/mobile/session/create', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });

      return response;
    } catch (error) {
      return this.handleError('SESSION_CREATE_FAILED', error);
    }
  }

  async updateSession(
    sessionId: string,
    data: Partial<MobileSession>
  ): Promise<MobileApiResponse<MobileSession>> {
    try {
      return await this.makeRequest<MobileSession>(`/mobile/session/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (!this.isOnline) {
        this.queueOfflineAction('update', 'session', sessionId, data);
        return this.createSuccessResponse(data as MobileSession);
      }
      return this.handleError('SESSION_UPDATE_FAILED', error);
    }
  }

  async endSession(sessionId: string): Promise<MobileApiResponse<MobileSession>> {
    try {
      return await this.makeRequest<MobileSession>(`/mobile/session/${sessionId}/end`, {
        method: 'POST',
      });
    } catch (error) {
      return this.handleError('SESSION_END_FAILED', error);
    }
  }

  // Order Management
  async createOrder(order: Partial<MobileOrder>): Promise<MobileApiResponse<MobileOrder>> {
    try {
      const orderData = {
        ...order,
        deviceId: this.deviceId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isOffline: !this.isOnline,
        syncStatus: this.isOnline ? 'synced' : 'pending',
      };

      if (!this.isOnline) {
        this.queueOfflineAction('create', 'order', '', orderData);
        return this.createSuccessResponse({
          ...orderData,
          id: this.generateOfflineId(),
        } as MobileOrder);
      }

      return await this.makeRequest<MobileOrder>('/mobile/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    } catch (error) {
      return this.handleError('ORDER_CREATE_FAILED', error);
    }
  }

  async updateOrder(
    orderId: string,
    updates: Partial<MobileOrder>
  ): Promise<MobileApiResponse<MobileOrder>> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
        syncStatus: this.isOnline ? 'synced' : 'pending',
      };

      if (!this.isOnline) {
        this.queueOfflineAction('update', 'order', orderId, updateData);
        return this.createSuccessResponse(updateData as MobileOrder);
      }

      return await this.makeRequest<MobileOrder>(`/mobile/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      return this.handleError('ORDER_UPDATE_FAILED', error);
    }
  }

  async getOrders(customerId?: string, status?: string): Promise<MobileApiResponse<MobileOrder[]>> {
    try {
      const params = new URLSearchParams();
      if (customerId) params.append('customerId', customerId);
      if (status) params.append('status', status);
      params.append('deviceId', this.deviceId);

      return await this.makeRequest<MobileOrder[]>(`/mobile/orders?${params}`);
    } catch (error) {
      if (!this.isOnline) {
        // Return cached orders
        const cachedOrders = this.getCachedData<MobileOrder[]>('orders') || [];
        return this.createSuccessResponse(cachedOrders);
      }
      return this.handleError('ORDERS_FETCH_FAILED', error);
    }
  }

  async cancelOrder(orderId: string, reason?: string): Promise<MobileApiResponse<MobileOrder>> {
    try {
      const cancelData = {
        status: 'cancelled',
        cancelReason: reason,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      };

      if (!this.isOnline) {
        this.queueOfflineAction('update', 'order', orderId, cancelData);
        // Return a placeholder response since we can't get the full order offline
        return {
          success: false,
          error: {
            code: 'ORDER_CANCEL_QUEUED',
            message: 'Order cancellation queued for when online',
          },
          timestamp: new Date(),
          requestId: this.generateRequestId(),
        };
      }

      return await this.makeRequest<MobileOrder>(`/mobile/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify(cancelData),
      });
    } catch (error) {
      return this.handleError('ORDER_CANCEL_FAILED', error);
    }
  }

  // Inventory Management
  async searchInventory(
    query: string,
    filters?: any
  ): Promise<MobileApiResponse<MobileInventory[]>> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('deviceId', this.deviceId);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, String(value));
        });
      }

      return await this.makeRequest<MobileInventory[]>(`/mobile/inventory/search?${params}`);
    } catch (error) {
      if (!this.isOnline) {
        const cachedInventory = this.getCachedData<MobileInventory[]>('inventory') || [];
        const filtered = cachedInventory.filter(
          item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.author.toLowerCase().includes(query.toLowerCase()) ||
            item.isbn.includes(query)
        );
        return this.createSuccessResponse(filtered);
      }
      return this.handleError('INVENTORY_SEARCH_FAILED', error);
    }
  }

  async getBookByBarcode(barcode: string): Promise<MobileApiResponse<MobileInventory>> {
    try {
      return await this.makeRequest<MobileInventory>(`/mobile/inventory/barcode/${barcode}`);
    } catch (error) {
      return this.handleError('BARCODE_LOOKUP_FAILED', error);
    }
  }

  async updateInventoryStock(
    bookId: string,
    quantity: number,
    location?: string
  ): Promise<MobileApiResponse<MobileInventory>> {
    try {
      const updateData = {
        stock: quantity,
        location,
        lastUpdated: new Date(),
        deviceId: this.deviceId,
      };

      if (!this.isOnline) {
        this.queueOfflineAction('update', 'inventory', bookId, updateData);
        // Return a placeholder response since we can't get the full inventory offline
        return {
          success: false,
          error: {
            code: 'INVENTORY_UPDATE_QUEUED',
            message: 'Inventory update queued for when online',
          },
          timestamp: new Date(),
          requestId: this.generateRequestId(),
        };
      }

      return await this.makeRequest<MobileInventory>(`/mobile/inventory/${bookId}/stock`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      return this.handleError('INVENTORY_UPDATE_FAILED', error);
    }
  }

  // Customer Management
  async searchCustomers(query: string): Promise<MobileApiResponse<MobileCustomer[]>> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('deviceId', this.deviceId);

      return await this.makeRequest<MobileCustomer[]>(`/mobile/customers/search?${params}`);
    } catch (error) {
      if (!this.isOnline) {
        const cachedCustomers = this.getCachedData<MobileCustomer[]>('customers') || [];
        const filtered = cachedCustomers.filter(
          customer =>
            customer.name.toLowerCase().includes(query.toLowerCase()) ||
            customer.email.toLowerCase().includes(query.toLowerCase()) ||
            customer.phone?.includes(query)
        );
        return this.createSuccessResponse(filtered);
      }
      return this.handleError('CUSTOMER_SEARCH_FAILED', error);
    }
  }

  async createCustomer(
    customer: Partial<MobileCustomer>
  ): Promise<MobileApiResponse<MobileCustomer>> {
    try {
      const customerData = {
        ...customer,
        devices: [this.deviceId],
        lastSeen: new Date(),
      };

      if (!this.isOnline) {
        this.queueOfflineAction('create', 'customer', '', customerData);
        return this.createSuccessResponse({
          ...customerData,
          id: this.generateOfflineId(),
        } as MobileCustomer);
      }

      return await this.makeRequest<MobileCustomer>('/mobile/customers', {
        method: 'POST',
        body: JSON.stringify(customerData),
      });
    } catch (error) {
      return this.handleError('CUSTOMER_CREATE_FAILED', error);
    }
  }

  async updateCustomer(
    customerId: string,
    updates: Partial<MobileCustomer>
  ): Promise<MobileApiResponse<MobileCustomer>> {
    try {
      const updateData = {
        ...updates,
        lastSeen: new Date(),
      };

      if (!this.isOnline) {
        this.queueOfflineAction('update', 'customer', customerId, updateData);
        return this.createSuccessResponse(updateData as MobileCustomer);
      }

      return await this.makeRequest<MobileCustomer>(`/mobile/customers/${customerId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      return this.handleError('CUSTOMER_UPDATE_FAILED', error);
    }
  }

  // Push Notifications
  async registerForPushNotifications(pushToken: string): Promise<MobileApiResponse<void>> {
    try {
      return await this.makeRequest<void>('/mobile/notifications/register', {
        method: 'POST',
        body: JSON.stringify({
          deviceId: this.deviceId,
          pushToken,
        }),
      });
    } catch (error) {
      return this.handleError('PUSH_REGISTRATION_FAILED', error);
    }
  }

  async getNotifications(
    limit: number = 20,
    offset: number = 0
  ): Promise<MobileApiResponse<PushNotification[]>> {
    try {
      const params = new URLSearchParams();
      params.append('deviceId', this.deviceId);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      return await this.makeRequest<PushNotification[]>(`/mobile/notifications?${params}`);
    } catch (error) {
      if (!this.isOnline) {
        const cachedNotifications = this.getCachedData<PushNotification[]>('notifications') || [];
        return this.createSuccessResponse(cachedNotifications.slice(offset, offset + limit));
      }
      return this.handleError('NOTIFICATIONS_FETCH_FAILED', error);
    }
  }

  async markNotificationRead(notificationId: string): Promise<MobileApiResponse<void>> {
    try {
      if (!this.isOnline) {
        this.queueOfflineAction('update', 'notification', notificationId, { openedAt: new Date() });
        return this.createSuccessResponse(undefined);
      }

      return await this.makeRequest<void>(`/mobile/notifications/${notificationId}/read`, {
        method: 'POST',
      });
    } catch (error) {
      return this.handleError('NOTIFICATION_READ_FAILED', error);
    }
  }

  // Analytics
  async trackEvent(
    analytics: Omit<MobileAnalytics, 'deviceId' | 'timestamp'>
  ): Promise<MobileApiResponse<void>> {
    try {
      const analyticsData = {
        ...analytics,
        deviceId: this.deviceId,
        timestamp: new Date(),
      };

      if (!this.isOnline) {
        this.queueOfflineAction('create', 'analytics', '', analyticsData);
        return this.createSuccessResponse(undefined);
      }

      return await this.makeRequest<void>('/mobile/analytics', {
        method: 'POST',
        body: JSON.stringify(analyticsData),
      });
    } catch (error) {
      return this.handleError('ANALYTICS_TRACKING_FAILED', error);
    }
  }

  // Sync Management
  async syncOfflineData(): Promise<MobileSyncResponse> {
    try {
      if (this.offlineQueue.length === 0) {
        return {
          success: true,
          synced: 0,
          failed: 0,
          conflicts: [],
          lastSync: new Date(),
          nextSync: new Date(Date.now() + 300000), // 5 minutes
        };
      }

      const response = await this.makeRequest<MobileSyncResponse>('/mobile/sync', {
        method: 'POST',
        body: JSON.stringify({
          deviceId: this.deviceId,
          actions: this.offlineQueue,
        }),
      });

      if (response.success) {
        this.offlineQueue = [];
        this.emit('sync:success', response.data);
      }

      return (
        response.data || {
          success: false,
          synced: 0,
          failed: this.offlineQueue.length,
          conflicts: [],
          lastSync: new Date(),
          nextSync: new Date(Date.now() + 300000),
        }
      );
    } catch (error) {
      return {
        success: false,
        synced: 0,
        failed: this.offlineQueue.length,
        conflicts: [],
        lastSync: new Date(),
        nextSync: new Date(Date.now() + 300000),
      };
    }
  }

  async getConfiguration(): Promise<MobileApiResponse<MobileConfiguration>> {
    try {
      return await this.makeRequest<MobileConfiguration>('/mobile/config');
    } catch (error) {
      // Return default configuration
      const defaultConfig: MobileConfiguration = {
        apiBaseUrl: this.baseUrl,
        features: [],
        settings: {
          cacheSize: 100,
          syncInterval: 300,
          maxOfflineActions: 1000,
          sessionTimeout: 3600,
          maxImageSize: 5242880,
          compressionQuality: 0.8,
        },
        themes: {
          light: {},
          dark: {},
        },
        constants: {},
      };

      return this.createSuccessResponse(defaultConfig);
    }
  }

  // Device Features
  async getBiometricAuthInfo(): Promise<BiometricAuth> {
    // Simulated biometric availability check
    return {
      isAvailable: true,
      supportedTypes: ['fingerprint', 'face'],
      isEnrolled: true,
      settings: {
        fallbackToPin: true,
        maxAttempts: 3,
        lockoutDuration: 300,
      },
    };
  }

  async getBarcodeScanner(): Promise<BarcodeScanner> {
    // Simulated barcode scanner availability
    return {
      isAvailable: true,
      supportedFormats: ['UPC_A', 'UPC_E', 'EAN_8', 'EAN_13', 'CODE_128', 'CODE_39'],
      settings: {
        autoFocus: true,
        flashlight: true,
        beep: true,
        vibrate: true,
        continuous: false,
      },
    };
  }

  async getMobilePaymentInfo(): Promise<MobilePayment[]> {
    // Simulated mobile payment methods
    return [
      {
        id: 'apple_pay',
        type: 'apple_pay',
        isAvailable: true,
        isSetup: true,
        supportedCards: ['visa', 'mastercard', 'amex'],
        settings: {
          requireConfirmation: true,
          transactionLimit: 1000,
        },
      },
      {
        id: 'google_pay',
        type: 'google_pay',
        isAvailable: false,
        isSetup: false,
        supportedCards: [],
        settings: {
          requireConfirmation: true,
          transactionLimit: 1000,
        },
      },
    ];
  }

  async getLocationService(): Promise<MobileLocationService> {
    // Simulated location service info
    return {
      isEnabled: true,
      accuracy: 'high',
      updateInterval: 30,
      geofences: [],
      settings: {
        backgroundLocation: false,
        highAccuracy: true,
        distanceFilter: 10,
        timeout: 15000,
      },
    };
  }

  // Private Methods
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<MobileApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      'X-Device-ID': this.deviceId,
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache successful responses
    if (response.ok && options.method === 'GET') {
      this.setCacheData(endpoint, data.data);
    }

    return data;
  }

  private handleError(code: string, error: any): MobileApiResponse<any> {
    console.error(`Mobile API Error [${code}]:`, error);

    this.emit('error', {
      code,
      message: error.message || 'Unknown error',
      error,
    });

    return {
      success: false,
      error: {
        code,
        message: error.message || 'An error occurred',
        details: error,
      },
      timestamp: new Date(),
      requestId: this.generateRequestId(),
    };
  }

  private createSuccessResponse<T>(data: T): MobileApiResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date(),
      requestId: this.generateRequestId(),
    };
  }

  private queueOfflineAction(
    action: 'create' | 'update' | 'delete',
    entityType: string,
    entityId: string,
    data: any
  ): void {
    const offlineAction: OfflineSync = {
      id: this.generateOfflineId(),
      deviceId: this.deviceId,
      entityType: entityType as any,
      entityId,
      action,
      data,
      timestamp: new Date(),
      synced: false,
      attempts: 0,
      priority: 1,
    };

    this.offlineQueue.push(offlineAction);
    this.emit('offline:queued', offlineAction);
  }

  private setupNetworkMonitoring(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.emit('network:online');
        this.syncOfflineData();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.emit('network:offline');
      });

      this.isOnline = navigator.onLine;
    }
  }

  private initializeOfflineSync(): void {
    if (typeof window !== 'undefined') {
      // Auto-sync every 5 minutes when online
      setInterval(() => {
        if (this.isOnline && this.offlineQueue.length > 0) {
          this.syncOfflineData();
        }
      }, 300000);
    }
  }

  private getCachedData<T>(key: string): T | null {
    if (typeof localStorage === 'undefined') return null;

    try {
      const cached = localStorage.getItem(`mobile_cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  private setCacheData(key: string, data: any): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(`mobile_cache_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  private generateOfflineId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Event System
  private on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  private off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Public event methods
  public addEventListener(event: string, callback: Function): void {
    this.on(event, callback);
  }

  public removeEventListener(event: string, callback: Function): void {
    this.off(event, callback);
  }

  // Cleanup
  public destroy(): void {
    this.eventListeners.clear();
    this.offlineQueue = [];
  }
}

export default MobileApiService;
