'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'superuser';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = 'user' }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    if (!isAuthenticated) {
      // Store the attempted URL for redirect after login
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?redirect=${redirectUrl}`);
      return;
    }

    // Check role-based access
    if (requiredRole === 'superuser' && user && !user.is_superuser) {
      router.push('/dashboard'); // Redirect to dashboard if not superuser
      return;
    }

    // Check if user account is active
    if (user && !user.is_active) {
      router.push('/auth/login?message=Your account has been deactivated');
      return;
    }
  }, [isAuthenticated, user, isLoading, router, pathname, requiredRole]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or doesn't have required role
  if (
    !isAuthenticated ||
    (requiredRole === 'superuser' && user && !user.is_superuser) ||
    (user && !user.is_active)
  ) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
