'use client';

import React, { useState, useEffect } from 'react';
import {
  MobileHeader,
  MobileNavigation,
  MobileSearchBar,
  BarcodeScanner,
  MobileProductCard,
  MobileCart,
  MobileCustomerSearch,
  MobileLoader,
  MobileError,
  PullToRefresh,
} from './MobileUIComponents';
import { useNotifications, NotificationBell } from './PushNotifications';
import { useOfflineSync, OfflineStatus } from './OfflineSync';
import { useAuth, LoginForm } from './MobileAuth';
import type {
  MobileDevice,
  MobileOrder,
  MobileOrderItem,
  MobileInventory,
  MobileCustomer,
} from '@/lib/types/mobile';
import MobileApiService from '@/lib/services/mobileApiService';
import {
  Home,
  Search,
  ShoppingCart,
  Users,
  Settings,
  Package,
  TrendingUp,
  DollarSign,
  Star,
  Clock,
  MapPin,
  Filter,
  Grid,
  List,
  Plus,
  Scan,
  User,
  Bell,
  Menu,
  X,
  RefreshCw,
  BarChart3,
  BookOpen,
  CreditCard,
  Heart,
  Share,
  Eye,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Target,
  Award,
  ChevronRight,
  Lock,
} from 'lucide-react';

interface MobileDashboardProps {
  device: MobileDevice;
  apiService: MobileApiService;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ device, apiService }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { showNotification, unreadCount, isSubscribed } = useNotifications();
  const { isOnline, pendingSync } = useOfflineSync();

  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [books, setBooks] = useState<MobileInventory[]>([]);
  const [customers, setCustomers] = useState<MobileCustomer[]>([]);
  const [cart, setCart] = useState<MobileOrderItem[]>([]);
  const [orders, setOrders] = useState<MobileOrder[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<MobileCustomer | null>(null);

  // View states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([loadBooks(), loadCustomers(), loadOrders()]);
    } catch (err) {
      setError('Failed to load data');
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBooks = async (query?: string) => {
    try {
      const response = await apiService.searchInventory(query || '', {
        limit: 20,
        offset: 0,
      });

      if (response.success && response.data) {
        setBooks(response.data);
      }
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  };

  const loadCustomers = async (query?: string) => {
    try {
      const response = await apiService.searchCustomers(query || '');

      if (response.success && response.data) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await apiService.getOrders(user?.id);

      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (activeTab === 'books') {
      await loadBooks(query);
    } else if (activeTab === 'customers') {
      await loadCustomers(query);
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const response = await apiService.getBookByBarcode(barcode);

      if (response.success && response.data) {
        // Add to cart or show book details
        handleAddToCart(response.data);
        showNotification({
          id: `scan-${Date.now()}`,
          userId: user?.id || '',
          title: 'Book Scanned',
          body: `Added "${response.data.title}" to cart`,
          type: 'system',
          priority: 'normal',
          status: 'delivered',
          read: false,
          timestamp: new Date()
        });
      } else {
        showNotification({
          id: `scan-error-${Date.now()}`,
          userId: user?.id || '',
          title: 'Book Not Found',
          body: `No book found with barcode ${barcode}`,
          type: 'system',
          priority: 'normal',
          status: 'delivered',
          read: false,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
    }
  };

  const handleAddToCart = (book: MobileInventory) => {
    const existingItem = cart.find(item => item.bookId === book.bookId);

    if (existingItem) {
      setCart(prev =>
        prev.map(item =>
          item.bookId === book.bookId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      const newItem: MobileOrderItem = {
        id: `item_${Date.now()}`,
        bookId: book.bookId,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        price: book.price,
        quantity: 1,
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  const handleUpdateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCart(prev => prev.map(item => (item.id === itemId ? { ...item, quantity } : item)));
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      showNotification({
        id: `checkout-error-${Date.now()}`,
        userId: user?.id || '',
        title: 'Customer Required',
        body: 'Please select a customer before checkout',
        type: 'system',
        priority: 'normal',
        status: 'delivered',
        read: false,
        timestamp: new Date()
      });
      setActiveTab('customers');
      return;
    }

    try {
      const orderData: Partial<MobileOrder> = {
        customerId: selectedCustomer.id,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: 'pending',
        paymentMethod: 'cash',
        deliveryMethod: 'pickup',
      };

      const response = await apiService.createOrder(orderData);

      if (response.success) {
        setCart([]);
        setSelectedCustomer(null);
        showNotification({
          id: `order-${Date.now()}`,
          userId: user?.id || '',
          title: 'Order Created',
          body: `Order for ${selectedCustomer.name} has been created`,
          type: 'order',
          priority: 'normal',
          status: 'delivered',
          read: false,
          timestamp: new Date()
        });
        await loadOrders();
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const handleRefresh = async () => {
    await loadInitialData();
  };

  if (!isAuthenticated) {
    return (
      <LoginForm
        onLogin={success => {
          if (success) {
            loadInitialData();
          }
        }}
      />
    );
  }

  const renderHomeTab = () => (
    <div className="space-y-6 pb-20">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-green-100 p-2">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today&apos;s Sales</p>
              <p className="text-xl font-semibold text-gray-900">$1,250</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Orders</p>
              <p className="text-xl font-semibold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowScanner(true)}
            className="flex flex-col items-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <Scan className="mb-2 h-8 w-8 text-green-600" />
            <span className="text-sm font-medium">Scan Book</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className="flex flex-col items-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <Users className="mb-2 h-8 w-8 text-blue-600" />
            <span className="text-sm font-medium">Find Customer</span>
          </button>

          <button
            onClick={() => setActiveTab('books')}
            className="flex flex-col items-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <BookOpen className="mb-2 h-8 w-8 text-purple-600" />
            <span className="text-sm font-medium">Browse Books</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className="flex flex-col items-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
          >
            <Package className="mb-2 h-8 w-8 text-orange-600" />
            <span className="text-sm font-medium">View Orders</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="space-y-3">
          {orders.slice(0, 3).map(order => (
            <div key={order.id} className="flex items-center space-x-3">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(-6)}</p>
                <p className="text-xs text-gray-600">{order.createdAt.toLocaleTimeString()}</p>
              </div>
              <span className="text-sm font-medium text-green-600">${order.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBooksTab = () => (
    <div className="space-y-4 pb-20">
      {/* Search and Filters */}
      <div className="space-y-3">
        <MobileSearchBar
          value={searchQuery}
          onChange={handleSearch}
          onScan={() => setShowScanner(true)}
          placeholder="Search books..."
        />

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-2 ${
                viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-600'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-md p-2 ${
                viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-600'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Books Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4">
          {books.map(book => (
            <MobileProductCard
              key={book.bookId}
              book={book}
              onAddToCart={handleAddToCart}
              onViewDetails={book => {
                // Show book details modal
                console.log('View details:', book);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {books.map(book => (
            <div key={book.bookId} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex space-x-3">
                <div className="flex h-20 w-16 items-center justify-center rounded-md bg-gray-100">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="line-clamp-2 font-medium text-gray-900">{book.title}</h4>
                  <p className="mt-1 text-sm text-gray-600">{book.author}</p>
                  <p className="mt-2 text-lg font-semibold text-green-600">
                    ${book.price.toFixed(2)}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Stock: {book.stock}</span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        book.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {book.isAvailable ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCart(book)}
                  disabled={!book.isAvailable}
                  className="self-start rounded-md bg-green-600 p-2 text-white hover:bg-green-700 disabled:bg-gray-300"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCustomersTab = () => (
    <div className="space-y-4 pb-20">
      <MobileCustomerSearch
        customers={customers}
        onSelectCustomer={setSelectedCustomer}
        onCreateNew={() => {
          // Handle create new customer
          console.log('Create new customer');
        }}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
      />

      {selectedCustomer && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-900">Selected Customer</h4>
              <p className="text-sm text-green-700">{selectedCustomer.name}</p>
            </div>
            <button onClick={() => setSelectedCustomer(null)} className="text-green-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-4 pb-20">
      <MobileCart
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {orders.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Orders</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
              >
                <div>
                  <p className="font-medium text-gray-900">Order #{order.id.slice(-6)}</p>
                  <p className="text-sm text-gray-600">{order.items.length} items</p>
                  <p className="text-xs text-gray-500">{order.createdAt.toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4 pb-20">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Account</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Settings</h3>
        <div className="space-y-3">
          <button className="w-full rounded-lg p-3 text-left hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <span>Notifications</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </button>

          <button className="w-full rounded-lg p-3 text-left hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-gray-600" />
                <span>Security</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </button>
        </div>
      </div>

      <button onClick={logout} className="w-full rounded-lg bg-red-600 py-3 font-medium text-white">
        Sign Out
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeTab();
      case 'books':
        return renderBooksTab();
      case 'customers':
        return renderCustomersTab();
      case 'orders':
        return renderOrdersTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderHomeTab();
    }
  };

  if (isLoading && books.length === 0) {
    return <MobileLoader message="Loading dashboard..." />;
  }

  if (error) {
    return <MobileError message={error} onRetry={handleRefresh} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MobileHeader
        title={
          activeTab === 'home'
            ? 'Dashboard'
            : activeTab === 'books'
              ? 'Books'
              : activeTab === 'customers'
                ? 'Customers'
                : activeTab === 'orders'
                  ? 'Cart & Orders'
                  : 'Settings'
        }
        onMenu={() => setShowMenu(true)}
        showConnectivity={true}
        device={device}
        actions={[
          <NotificationBell 
            key="notifications" 
            unreadCount={unreadCount}
            isSubscribed={isSubscribed}
            onClick={() => {/* TODO: handle notification click */}}
          />,
          cart.length > 0 && (
            <button
              key="cart"
              onClick={() => setActiveTab('orders')}
              className="relative p-2 text-gray-600"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {cart.length}
              </span>
            </button>
          ),
        ].filter(Boolean)}
      />

      {/* Offline Status */}
      <div className="px-4 py-2">
        <OfflineStatus showDetails={false} />
      </div>

      {/* Main Content */}
      <PullToRefresh onRefresh={handleRefresh}>
        <main className="px-4 py-4">{renderTabContent()}</main>
      </PullToRefresh>

      {/* Bottom Navigation */}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleBarcodeScan}
      />
    </div>
  );
};

export default MobileDashboard;
