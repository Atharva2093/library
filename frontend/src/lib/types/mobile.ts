// Mobile Application Types and Interfaces
// Comprehensive type definitions for cross-platform mobile integration

export interface MobileDevice {
  id: string;
  deviceId: string;
  userId: string;
  platform: 'ios' | 'android' | 'web';
  deviceName: string;
  osVersion: string;
  appVersion: string;
  pushToken?: string;
  isActive: boolean;
  lastSeen: Date;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  };
  capabilities: DeviceCapabilities;
  settings: MobileSettings;
}

export interface DeviceCapabilities {
  hasCamera: boolean;
  hasBarcodeCanning: boolean;
  hasNFC: boolean;
  hasBiometric: boolean;
  hasGPS: boolean;
  hasOfflineStorage: boolean;
  maxStorageSize: number;
  networkType: 'wifi' | '4g' | '5g' | 'offline';
  batteryLevel?: number;
}

export interface MobileSettings {
  pushNotifications: {
    enabled: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    inventory: boolean;
    systemAlerts: boolean;
    quietHours?: {
      start: string;
      end: string;
    };
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    colorScheme: string;
  };
  sync: {
    autoSync: boolean;
    syncFrequency: number; // minutes
    syncOnWifiOnly: boolean;
    backgroundSync: boolean;
  };
  security: {
    biometricAuth: boolean;
    autoLock: boolean;
    lockTimeout: number; // minutes
    requirePinForSensitive: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    voiceCommands: boolean;
  };
}

export interface MobileSession {
  sessionId: string;
  deviceId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isActive: boolean;
  activities: MobileActivity[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface MobileActivity {
  id: string;
  type: 'login' | 'logout' | 'scan' | 'order' | 'payment' | 'search' | 'navigation' | 'sync';
  timestamp: Date;
  duration?: number;
  data?: any;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface PushNotification {
  id: string;
  userId: string;
  deviceId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: 'order' | 'promotion' | 'inventory' | 'system' | 'reminder';
  priority: 'low' | 'normal' | 'high' | 'critical';
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'failed';
  badge?: number;
  sound?: string;
  image?: string;
  actions?: NotificationAction[];
  category?: string;
}

export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  input?: boolean;
  destructive?: boolean;
}

export interface OfflineSync {
  id: string;
  deviceId: string;
  entityType: 'order' | 'customer' | 'book' | 'inventory' | 'payment';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  synced: boolean;
  syncedAt?: Date;
  attempts: number;
  lastError?: string;
  priority: number;
}

export interface MobileAPI {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requiresAuth: boolean;
  offlineCapable: boolean;
  cacheStrategy: 'none' | 'cache-first' | 'network-first' | 'cache-only';
  cacheDuration?: number; // minutes
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
}

export interface MobileCache {
  key: string;
  data: any;
  timestamp: Date;
  expiresAt: Date;
  size: number;
  tags: string[];
}

export interface BarcodeScanner {
  isAvailable: boolean;
  supportedFormats: string[];
  settings: {
    autoFocus: boolean;
    flashlight: boolean;
    beep: boolean;
    vibrate: boolean;
    continuous: boolean;
  };
}

export interface BiometricAuth {
  isAvailable: boolean;
  supportedTypes: ('fingerprint' | 'face' | 'iris' | 'voice')[];
  isEnrolled: boolean;
  settings: {
    fallbackToPin: boolean;
    maxAttempts: number;
    lockoutDuration: number;
  };
}

export interface MobilePayment {
  id: string;
  type: 'apple_pay' | 'google_pay' | 'samsung_pay' | 'nfc' | 'qr_code';
  isAvailable: boolean;
  isSetup: boolean;
  supportedCards: string[];
  settings: {
    defaultCard?: string;
    requireConfirmation: boolean;
    transactionLimit?: number;
  };
}

export interface MobileOrder {
  id: string;
  customerId: string;
  deviceId: string;
  items: MobileOrderItem[];
  total: number;
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  deliveryMethod: 'pickup' | 'delivery' | 'shipping';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  isOffline: boolean;
  syncStatus: 'pending' | 'synced' | 'failed';
}

export interface MobileOrderItem {
  id: string;
  bookId: string;
  isbn: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  scannedBarcode?: string;
  notes?: string;
}

export interface MobileInventory {
  bookId: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  stock: number;
  price: number;
  location: string;
  lastUpdated: Date;
  images: string[];
  barcodes: string[];
  isAvailable: boolean;
  reservations?: MobileReservation[];
}

export interface MobileReservation {
  id: string;
  customerId: string;
  bookId: string;
  deviceId: string;
  reservedAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'cancelled' | 'fulfilled';
}

export interface MobileCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  membershipId?: string;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  preferences: {
    categories: string[];
    authors: string[];
    formats: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  devices: string[];
  lastSeen: Date;
}

export interface MobileAnalytics {
  deviceId: string;
  userId?: string;
  sessionId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  platform: string;
  appVersion: string;
  osVersion: string;
  screenSize: {
    width: number;
    height: number;
  };
  networkType: string;
  batteryLevel?: number;
}

export interface MobileError {
  id: string;
  deviceId: string;
  userId?: string;
  type: 'network' | 'auth' | 'sync' | 'payment' | 'scan' | 'unknown';
  message: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  reportedToUser: boolean;
}

export interface MobileFeature {
  id: string;
  name: string;
  enabled: boolean;
  platforms: ('ios' | 'android' | 'web')[];
  minVersion?: string;
  rolloutPercentage?: number;
  dependencies?: string[];
  configuration?: Record<string, any>;
}

export interface MobileUpdate {
  version: string;
  platform: 'ios' | 'android' | 'web';
  required: boolean;
  releaseDate: Date;
  downloadUrl?: string;
  releaseNotes: string;
  features: string[];
  bugFixes: string[];
  minOsVersion?: string;
  size?: number;
}

export interface MobileLocationService {
  isEnabled: boolean;
  accuracy: 'high' | 'medium' | 'low';
  updateInterval: number;
  geofences: MobileGeofence[];
  settings: {
    backgroundLocation: boolean;
    highAccuracy: boolean;
    distanceFilter: number;
    timeout: number;
  };
}

export interface MobileGeofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  events: ('enter' | 'exit' | 'dwell')[];
  actions: MobileGeofenceAction[];
}

export interface MobileGeofenceAction {
  type: 'notification' | 'discount' | 'reminder' | 'sync';
  configuration: Record<string, any>;
}

export interface MobilePerformance {
  deviceId: string;
  metrics: {
    appLaunchTime: number;
    screenLoadTimes: Record<string, number>;
    apiResponseTimes: Record<string, number>;
    memoryUsage: number;
    cpuUsage: number;
    batteryDrain: number;
    crashCount: number;
    errorCount: number;
  };
  timestamp: Date;
}

export interface MobileConfiguration {
  apiBaseUrl: string;
  features: MobileFeature[];
  settings: {
    cacheSize: number;
    syncInterval: number;
    maxOfflineActions: number;
    sessionTimeout: number;
    maxImageSize: number;
    compressionQuality: number;
  };
  themes: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  constants: Record<string, any>;
}

// React Native Specific Types
export interface RNBridge {
  platform: 'ios' | 'android';
  version: string;
  isAvailable: boolean;
  methods: string[];
}

export interface RNModule {
  name: string;
  version: string;
  isNative: boolean;
  platform?: 'ios' | 'android' | 'both';
  dependencies?: string[];
}

// Cross-Platform Integration Types
export interface WebMobileAdapter {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  touchSupport: boolean;
  installPrompt?: any;
  isStandalone: boolean;
  features: {
    camera: boolean;
    geolocation: boolean;
    notifications: boolean;
    vibration: boolean;
    clipboard: boolean;
  };
}

export interface PWAManifest {
  name: string;
  shortName: string;
  description: string;
  startUrl: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  themeColor: string;
  backgroundColor: string;
  icons: PWAIcon[];
  shortcuts?: PWAShortcut[];
}

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

export interface PWAShortcut {
  name: string;
  shortName?: string;
  description?: string;
  url: string;
  icons?: PWAIcon[];
}

// API Response Types
export interface MobileApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
  timestamp: Date;
  requestId: string;
}

export interface MobileSyncResponse {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: any[];
  lastSync: Date;
  nextSync: Date;
}

// Utility Types
export type MobilePlatform = 'ios' | 'android' | 'web';
export type MobileOrientation = 'portrait' | 'landscape';
export type MobileNetworkType = 'wifi' | '4g' | '5g' | 'offline' | 'unknown';
export type MobileTheme = 'light' | 'dark' | 'system';
export type MobileAuthMethod = 'biometric' | 'pin' | 'password' | 'pattern';

// Event Types
export interface MobileEvent {
  type: string;
  data: any;
  timestamp: Date;
  deviceId: string;
  userId?: string;
}

export interface MobileEventHandler {
  (event: MobileEvent): void | Promise<void>;
}

export interface MobileEventEmitter {
  on(event: string, handler: MobileEventHandler): void;
  off(event: string, handler: MobileEventHandler): void;
  emit(event: string, data: any): void;
}

// State Management Types
export interface MobileState {
  device: MobileDevice;
  user?: MobileCustomer;
  session: MobileSession | null;
  orders: MobileOrder[];
  cart: MobileOrderItem[];
  inventory: MobileInventory[];
  notifications: PushNotification[];
  offline: {
    isOffline: boolean;
    pendingSync: OfflineSync[];
    cache: MobileCache[];
  };
  ui: {
    theme: MobileTheme;
    orientation: MobileOrientation;
    loading: boolean;
    error?: MobileError;
  };
}

export interface MobileAction {
  type: string;
  payload?: any;
  meta?: {
    timestamp: Date;
    deviceId: string;
    userId?: string;
  };
}

// Service Worker Types
export interface ServiceWorkerMessage {
  type: 'sync' | 'push' | 'background-fetch' | 'cache' | 'analytics';
  data: any;
  timestamp: Date;
}

export interface BackgroundSync {
  tag: string;
  data: any;
  retryCount: number;
  maxRetries: number;
  nextRetry: Date;
}

// Database Types (Local Storage)
export interface MobileDatabase {
  name: string;
  version: number;
  stores: MobileDbStore[];
}

export interface MobileDbStore {
  name: string;
  keyPath: string;
  autoIncrement?: boolean;
  indexes?: MobileDbIndex[];
}

export interface MobileDbIndex {
  name: string;
  keyPath: string;
  unique?: boolean;
  multiEntry?: boolean;
}

// Export all types for easy importing
export type * from './mobile';
