'use client';

import React, { useState, useEffect, TouchEvent, useRef } from 'react';
import type {
  MobileDevice,
  MobileOrder,
  MobileOrderItem,
  MobileInventory,
  MobileCustomer,
  BarcodeScanner as BarcodeScannerType,
  MobilePayment,
  MobileLocationService,
} from '@/lib/types/mobile';
import {
  Search,
  Scan,
  ShoppingCart,
  Plus,
  Minus,
  Camera,
  MapPin,
  CreditCard,
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Home,
  Book,
  Users,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Share,
  Filter,
  SortAsc,
  Grid,
  List,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Fingerprint,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react';

// Mobile Header Component
export const MobileHeader: React.FC<{
  title: string;
  onBack?: () => void;
  onMenu?: () => void;
  actions?: React.ReactNode[];
  showConnectivity?: boolean;
  device?: MobileDevice;
}> = ({ title, onBack, onMenu, actions, showConnectivity, device }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button onClick={onBack} className="rounded-md p-1 hover:bg-gray-100">
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            {onMenu && !onBack && (
              <button onClick={onMenu} className="rounded-md p-1 hover:bg-gray-100">
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <h1 className="truncate text-lg font-semibold text-gray-900">{title}</h1>
          </div>

          <div className="flex items-center space-x-2">
            {showConnectivity && (
              <div className="flex items-center space-x-1">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                {device?.capabilities.batteryLevel && (
                  <div className="flex items-center">
                    <Battery className="h-4 w-4 text-gray-500" />
                    <span className="ml-1 text-xs text-gray-500">
                      {device.capabilities.batteryLevel}%
                    </span>
                  </div>
                )}
              </div>
            )}
            {actions?.map((action, index) => (
              <div key={index}>{action}</div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

// Mobile Navigation
export const MobileNavigation: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'books', label: 'Books', icon: Book },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Cart', icon: ShoppingCart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-2">
      <div className="flex justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 rounded-md px-3 py-2 transition-colors ${
                isActive ? 'bg-green-50 text-green-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Search Bar Component
export const MobileSearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onScan?: () => void;
  placeholder?: string;
  showScanButton?: boolean;
}> = ({ value, onChange, onScan, placeholder = 'Search...', showScanButton = true }) => {
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-20 text-base focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {showScanButton && (
          <button
            onClick={onScan}
            className="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-md p-2 text-green-600 hover:bg-green-50"
          >
            <Scan className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Barcode Scanner Component
export const BarcodeScanner: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  scanner?: BarcodeScannerType;
}> = ({ isOpen, onClose, onScan, scanner }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setError(null);
      }
    } catch (err) {
      setError('Unable to access camera');
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const toggleFlash = async () => {
    try {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;

        if (capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any],
          });
          setFlashEnabled(!flashEnabled);
        }
      }
    } catch (err) {
      console.error('Flash toggle error:', err);
    }
  };

  const simulateScan = () => {
    // Simulate barcode scan for demo
    const mockBarcode = `978${Math.floor(Math.random() * 1000000000)}`;
    onScan(mockBarcode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full">
        {/* Camera View */}
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

        {/* Overlay */}
        <div className="absolute inset-0">
          {/* Header */}
          <div className="absolute left-0 right-0 top-0 bg-black bg-opacity-50 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white hover:bg-white hover:bg-opacity-20"
              >
                <X className="h-6 w-6" />
              </button>
              <span className="text-lg font-medium text-white">Scan Barcode</span>
              <button
                onClick={toggleFlash}
                className={`rounded-full p-2 ${
                  flashEnabled
                    ? 'bg-yellow-500 text-black'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Scanning Frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-40 w-64">
              <div className="relative h-full w-full rounded-lg border-2 border-green-500">
                {/* Corner markers */}
                <div className="absolute left-0 top-0 h-6 w-6 rounded-tl-lg border-l-4 border-t-4 border-white"></div>
                <div className="absolute right-0 top-0 h-6 w-6 rounded-tr-lg border-r-4 border-t-4 border-white"></div>
                <div className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-white"></div>
                <div className="absolute bottom-0 right-0 h-6 w-6 rounded-br-lg border-b-4 border-r-4 border-white"></div>

                {/* Scanning line */}
                <div className="absolute inset-x-0 top-1/2 h-0.5 animate-pulse bg-green-500"></div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-20 left-0 right-0 px-4 text-center">
            <p className="mb-4 text-lg text-white">Position barcode within the frame</p>
            {error && (
              <div className="mb-4 rounded-lg bg-red-500 px-4 py-2 text-white">{error}</div>
            )}
            <button
              onClick={simulateScan}
              className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white"
            >
              Simulate Scan (Demo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
export const MobileProductCard: React.FC<{
  book: MobileInventory;
  onAddToCart: (book: MobileInventory) => void;
  onViewDetails: (book: MobileInventory) => void;
}> = ({ book, onAddToCart, onViewDetails }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="aspect-h-4 aspect-w-3 bg-gray-100">
        {book.images?.[0] ? (
          <img src={book.images[0]} alt={book.title} className="h-48 w-full object-cover" />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-gray-200">
            <Book className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute right-2 top-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="rounded-full bg-white bg-opacity-90 p-2 shadow-sm"
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : 'text-gray-600'}`}
            />
          </button>
        </div>

        {!book.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <span className="font-medium text-white">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900">{book.title}</h3>
        <p className="mb-2 text-sm text-gray-600">{book.author}</p>

        <div className="mb-3 flex items-center justify-between">
          <span className="text-lg font-semibold text-green-600">${book.price.toFixed(2)}</span>
          <span className="text-sm text-gray-500">Stock: {book.stock}</span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(book)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Details
          </button>
          <button
            onClick={() => onAddToCart(book)}
            disabled={!book.isAvailable}
            className="flex-1 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// Cart Component
export const MobileCart: React.FC<{
  items: MobileOrderItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}> = ({ items, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ShoppingCart className="mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
        <p className="text-center text-gray-600">Add some books to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cart Items */}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex space-x-3">
              <div className="flex h-20 w-16 items-center justify-center rounded-md bg-gray-100">
                <Book className="h-8 w-8 text-gray-400" />
              </div>

              <div className="flex-1">
                <h4 className="line-clamp-2 text-sm font-medium text-gray-900">{item.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{item.author}</p>
                <p className="mt-2 text-sm font-medium text-green-600">${item.price.toFixed(2)}</p>

                {/* Quantity Controls */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="rounded-full border border-gray-300 p-1 hover:bg-gray-50"
                    >
                      <Minus className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="font-medium text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="rounded-full border border-gray-300 p-1 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg font-medium text-gray-900">Total</span>
          <span className="text-xl font-semibold text-green-600">${total.toFixed(2)}</span>
        </div>

        <button
          onClick={onCheckout}
          className="w-full rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700"
        >
          Checkout ({items.length} {items.length === 1 ? 'item' : 'items'})
        </button>
      </div>
    </div>
  );
};

// Customer Search Component
export const MobileCustomerSearch: React.FC<{
  customers: MobileCustomer[];
  onSelectCustomer: (customer: MobileCustomer) => void;
  onCreateNew: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = ({ customers, onSelectCustomer, onCreateNew, searchQuery, onSearchChange }) => {
  return (
    <div className="space-y-4">
      <MobileSearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search customers..."
        showScanButton={false}
      />

      {searchQuery && customers.length === 0 && (
        <div className="py-8 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="mb-4 text-gray-600">No customers found</p>
          <button
            onClick={onCreateNew}
            className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white"
          >
            Create New Customer
          </button>
        </div>
      )}

      <div className="space-y-2">
        {customers.map(customer => (
          <div
            key={customer.id}
            onClick={() => onSelectCustomer(customer)}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{customer.name}</h4>
                <p className="text-sm text-gray-600">{customer.email}</p>
                {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    customer.membershipTier === 'platinum'
                      ? 'bg-purple-100 text-purple-800'
                      : customer.membershipTier === 'gold'
                        ? 'bg-yellow-100 text-yellow-800'
                        : customer.membershipTier === 'silver'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {customer.membershipTier}
                </span>
                <p className="mt-1 text-sm text-gray-500">{customer.points} points</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Loading Component
export const MobileLoader: React.FC<{
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        className={`animate-spin rounded-full border-2 border-gray-200 border-t-green-500 ${sizeClasses[size]} mb-4`}
      ></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

// Error Component
export const MobileError: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
      <h3 className="mb-2 text-lg font-medium text-gray-900">Something went wrong</h3>
      <p className="mb-6 text-center text-gray-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

// Swipe to Action Component
export const SwipeableItem: React.FC<{
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: { icon: React.ReactNode; label: string; color: string };
  rightAction?: { icon: React.ReactNode; label: string; color: string };
}> = ({ children, onSwipeLeft, onSwipeRight, leftAction, rightAction }) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;

    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    setTranslateX(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const deltaX = currentX.current - startX.current;
    const threshold = 100;

    if (deltaX > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (deltaX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }

    setTranslateX(0);
    setIsDragging(false);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Actions */}
      {leftAction && (
        <div className="absolute bottom-0 left-0 top-0 flex w-20 items-center justify-center bg-green-500">
          <div className="flex flex-col items-center">
            {leftAction.icon}
            <span className="mt-1 text-xs text-white">{leftAction.label}</span>
          </div>
        </div>
      )}

      {rightAction && (
        <div className="absolute bottom-0 right-0 top-0 flex w-20 items-center justify-center bg-red-500">
          <div className="flex flex-col items-center">
            {rightAction.icon}
            <span className="mt-1 text-xs text-white">{rightAction.label}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className="relative z-10 bg-white transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

// Pull to Refresh Component
export const PullToRefresh: React.FC<{
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}> = ({ onRefresh, children }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const maxPullDistance = 120;

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, (currentY - startY.current) * 0.5);

    if (distance > 0) {
      e.preventDefault();
      setIsPulling(true);
      setPullDistance(Math.min(distance, maxPullDistance));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 80) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }
      setIsRefreshing(false);
    }

    setIsPulling(false);
    setPullDistance(0);
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* Pull to Refresh Indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="fixed left-0 right-0 top-0 z-40 flex items-center justify-center border-b border-green-200 bg-green-50 transition-all duration-200"
          style={{
            height: `${pullDistance + 60}px`,
            transform: `translateY(${isRefreshing ? 0 : pullDistance - maxPullDistance}px)`,
          }}
        >
          <div className="flex items-center space-x-2">
            {isRefreshing ? (
              <RefreshCw className="h-5 w-5 animate-spin text-green-600" />
            ) : (
              <div
                className="transition-transform duration-200"
                style={{
                  transform: `rotate(${pullDistance * 1.5}deg)`,
                }}
              >
                <Download className="h-5 w-5 text-green-600" />
              </div>
            )}
            <span className="text-sm font-medium text-green-700">
              {isRefreshing
                ? 'Refreshing...'
                : pullDistance > 80
                  ? 'Release to refresh'
                  : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${isPulling || isRefreshing ? pullDistance : 0}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
