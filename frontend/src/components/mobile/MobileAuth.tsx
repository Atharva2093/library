'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type {
  MobileDevice,
  MobileSession,
  MobileCustomer,
  BiometricAuth as BiometricAuthType,
  MobileSettings,
} from '@/lib/types/mobile';
import MobileApiService from '@/lib/services/mobileApiService';
import {
  Fingerprint,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shield,
  Smartphone,
  Key,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  LogIn,
  LogOut,
  Settings,
  RefreshCw,
} from 'lucide-react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: MobileCustomer | null;
  session: MobileSession | null;
  device: MobileDevice | null;
  isLoading: boolean;
  biometricAuth: BiometricAuthType | null;
  authMethod: 'biometric' | 'pin' | 'password' | null;

  // Methods
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  authenticateWithPin: (pin: string) => Promise<boolean>;
  setupBiometric: () => Promise<boolean>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  lockApp: () => void;
  unlockApp: (method: 'biometric' | 'pin') => Promise<boolean>;
  refreshSession: () => Promise<void>;
  updateSecuritySettings: (settings: Partial<MobileSettings['security']>) => Promise<void>;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface MobileAuthProviderProps {
  children: ReactNode;
  apiService: MobileApiService;
  device: MobileDevice;
}

export const MobileAuthProvider: React.FC<MobileAuthProviderProps> = ({
  children,
  apiService,
  device,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<MobileCustomer | null>(null);
  const [session, setSession] = useState<MobileSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState<BiometricAuthType | null>(null);
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pin' | 'password' | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const [securitySettings, setSecuritySettings] = useState<MobileSettings['security']>({
    biometricAuth: false,
    autoLock: true,
    lockTimeout: 5, // minutes
    requirePinForSensitive: true,
  });

  useEffect(() => {
    initializeAuth();
    setupBiometric();
    setupActivityTracking();
  }, []);

  useEffect(() => {
    // Auto-lock timeout
    if (securitySettings.autoLock && isAuthenticated && !isLocked) {
      const timeout = setTimeout(
        () => {
          if (Date.now() - lastActivity > securitySettings.lockTimeout * 60 * 1000) {
            lockApp();
          }
        },
        securitySettings.lockTimeout * 60 * 1000
      );

      return () => clearTimeout(timeout);
    }
  }, [
    lastActivity,
    securitySettings.autoLock,
    securitySettings.lockTimeout,
    isAuthenticated,
    isLocked,
  ]);

  const initializeAuth = async () => {
    try {
      // Load saved settings
      const savedSettings = localStorage.getItem('security_settings');
      if (savedSettings) {
        setSecuritySettings(JSON.parse(savedSettings));
      }

      // Check for existing session
      const savedSession = localStorage.getItem('mobile_session');
      const savedUser = localStorage.getItem('mobile_user');

      if (savedSession && savedUser) {
        const sessionData = JSON.parse(savedSession);
        const userData = JSON.parse(savedUser);

        // Validate session is still valid
        if (new Date(sessionData.endTime || Date.now()) > new Date()) {
          setSession(sessionData);
          setUser(userData);
          setIsAuthenticated(true);
          setAuthMethod('password'); // Default for existing sessions
        } else {
          // Session expired, clear storage
          localStorage.removeItem('mobile_session');
          localStorage.removeItem('mobile_user');
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupBiometric = async (): Promise<boolean> => {
    try {
      const biometricInfo = await apiService.getBiometricAuthInfo();
      setBiometricAuth(biometricInfo);

      if (!biometricInfo?.isAvailable) {
        return false;
      }

      const result = await simulateBiometricAuth();

      if (result) {
        localStorage.setItem('biometric_enabled', 'true');
        setSecuritySettings(prev => ({ ...prev, biometricAuth: true }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to setup biometric auth:', error);
      return false;
    }
  };

  const setupActivityTracking = () => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    // Track user activity
    document.addEventListener('touchstart', updateActivity);
    document.addEventListener('click', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('scroll', updateActivity);

    return () => {
      document.removeEventListener('touchstart', updateActivity);
      document.removeEventListener('click', updateActivity);
      document.removeEventListener('keydown', updateActivity);
      document.removeEventListener('scroll', updateActivity);
    };
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate login API call
      const mockUser: MobileCustomer = {
        id: 'user_' + Date.now(),
        name: 'John Doe',
        email: credentials.email,
        membershipTier: 'gold',
        points: 1250,
        preferences: {
          categories: ['Fiction', 'Mystery'],
          authors: ['John Grisham', 'Stephen King'],
          formats: ['hardcover', 'ebook'],
          priceRange: { min: 0, max: 50 },
        },
        devices: [device.deviceId],
        lastSeen: new Date(),
      };

      const sessionResponse = await apiService.createSession(mockUser.id);

      if (sessionResponse.success && sessionResponse.data) {
        setUser(mockUser);
        setSession(sessionResponse.data);
        setIsAuthenticated(true);
        setAuthMethod('password');
        setIsLocked(false);

        // Save to local storage if remember me is checked
        if (credentials.rememberMe) {
          localStorage.setItem('mobile_user', JSON.stringify(mockUser));
          localStorage.setItem('mobile_session', JSON.stringify(sessionResponse.data));
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (session) {
        await apiService.endSession(session.sessionId);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setAuthMethod(null);
      setIsLocked(false);

      // Clear stored data
      localStorage.removeItem('mobile_user');
      localStorage.removeItem('mobile_session');
      localStorage.removeItem('biometric_enabled');
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    if (!biometricAuth?.isAvailable || !biometricAuth.isEnrolled) {
      return false;
    }

    try {
      // Simulate biometric authentication
      const result = await simulateBiometricAuth();

      if (result) {
        setAuthMethod('biometric');
        setIsLocked(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  const authenticateWithPin = async (pin: string): Promise<boolean> => {
    try {
      const savedPin = localStorage.getItem('app_pin');

      if (savedPin === pin) {
        setAuthMethod('pin');
        setIsLocked(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('PIN authentication failed:', error);
      return false;
    }
  };

  const changePin = async (oldPin: string, newPin: string): Promise<boolean> => {
    try {
      const savedPin = localStorage.getItem('app_pin');

      if (!savedPin || savedPin === oldPin) {
        localStorage.setItem('app_pin', newPin);
        return true;
      }

      return false;
    } catch (error) {
      console.error('PIN change failed:', error);
      return false;
    }
  };

  const lockApp = (): void => {
    setIsLocked(true);
  };

  const unlockApp = async (method: 'biometric' | 'pin'): Promise<boolean> => {
    if (method === 'biometric') {
      return await authenticateWithBiometric();
    } else {
      // For PIN, this would typically show a PIN input dialog
      // For now, we'll simulate it
      return true;
    }
  };

  const refreshSession = async (): Promise<void> => {
    if (!session) return;

    try {
      const response = await apiService.updateSession(session.sessionId, {
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Extend by 24 hours
      });

      if (response.success && response.data) {
        setSession(response.data);
        localStorage.setItem('mobile_session', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
  };

  const updateSecuritySettings = async (
    settings: Partial<MobileSettings['security']>
  ): Promise<void> => {
    const newSettings = { ...securitySettings, ...settings };
    setSecuritySettings(newSettings);
    localStorage.setItem('security_settings', JSON.stringify(newSettings));
  };

  const simulateBiometricAuth = (): Promise<boolean> => {
    return new Promise(resolve => {
      // Simulate biometric authentication delay
      setTimeout(() => {
        // Simulate success (90% chance)
        resolve(Math.random() > 0.1);
      }, 1500);
    });
  };

  const contextValue: AuthContextType = {
    isAuthenticated: isAuthenticated && !isLocked,
    user,
    session,
    device,
    isLoading,
    biometricAuth,
    authMethod,
    login,
    logout,
    authenticateWithBiometric,
    authenticateWithPin,
    setupBiometric,
    changePin,
    lockApp,
    unlockApp,
    refreshSession,
    updateSecuritySettings,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {isLocked && <LockScreen />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a MobileAuthProvider');
  }
  return context;
};

// Login Form Component
export const LoginForm: React.FC<{
  onLogin: (success: boolean) => void;
}> = ({ onLogin }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    const success = await login(formData);
    if (success) {
      onLogin(true);
    } else {
      setError('Invalid email or password');
      onLogin(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Smartphone className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Sign in</h2>
          <p className="mt-2 text-sm text-gray-600">Access your bookstore account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-3 text-base placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-3 pr-10 text-base placeholder-gray-400 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={e => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-3 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign in
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Demo credentials: any email/password combination
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Lock Screen Component
const LockScreen: React.FC = () => {
  const { unlockApp, biometricAuth, user } = useAuth();

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    try {
      const success = await unlockApp('biometric');
      if (!success) {
        setPinError('Biometric authentication failed');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePinSubmit = async () => {
    setPinError('');
    if (pin.length !== 4) {
      setPinError('Please enter a 4-digit PIN');
      return;
    }

    setIsAuthenticating(true);
    try {
      // Simulate PIN check
      const success = await new Promise(resolve => setTimeout(() => resolve(pin === '1234'), 1000));

      if (success) {
        await unlockApp('pin');
      } else {
        setPinError('Incorrect PIN');
        setPin('');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
    setPinError('');
  };

  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit();
    }
  }, [pin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
      <div className="mx-4 w-full max-w-sm">
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-700">
            {user?.name ? (
              <span className="text-xl font-medium">
                {user.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()}
              </span>
            ) : (
              <Lock className="h-8 w-8" />
            )}
          </div>
          <h2 className="text-xl font-semibold">App Locked</h2>
          <p className="mt-1 text-gray-400">{user?.name || 'User'}</p>
        </div>

        {/* Biometric Authentication */}
        {biometricAuth?.isAvailable && (
          <div className="mb-8">
            <button
              onClick={handleBiometricAuth}
              disabled={isAuthenticating}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-green-600 py-4 font-medium text-white hover:bg-green-700 disabled:bg-gray-600"
            >
              <Fingerprint className="h-6 w-6" />
              <span>Unlock with {biometricAuth.supportedTypes[0]}</span>
            </button>
          </div>
        )}

        {/* PIN Input */}
        <div className="mb-8">
          <h3 className="mb-4 text-center text-white">Enter PIN</h3>

          {/* PIN Display */}
          <div className="mb-6 flex justify-center space-x-4">
            {[0, 1, 2, 3].map(index => (
              <div
                key={index}
                className={`h-4 w-4 rounded-full border-2 ${
                  pin.length > index ? 'border-green-500 bg-green-500' : 'border-gray-400'
                }`}
              />
            ))}
          </div>

          {pinError && <div className="mb-4 text-center text-sm text-red-400">{pinError}</div>}

          {/* PIN Keypad */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handlePinInput(num.toString())}
                disabled={isAuthenticating || pin.length >= 4}
                className="mx-auto h-16 w-16 rounded-full bg-gray-700 text-xl font-medium text-white hover:bg-gray-600 disabled:opacity-50"
              >
                {num}
              </button>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <div className="h-16 w-16"></div> {/* Spacer */}
            <button
              onClick={() => handlePinInput('0')}
              disabled={isAuthenticating || pin.length >= 4}
              className="h-16 w-16 rounded-full bg-gray-700 text-xl font-medium text-white hover:bg-gray-600 disabled:opacity-50"
            >
              0
            </button>
            <button
              onClick={handlePinDelete}
              disabled={isAuthenticating || pin.length === 0}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">Demo PIN: 1234</p>
        </div>
      </div>
    </div>
  );
};
