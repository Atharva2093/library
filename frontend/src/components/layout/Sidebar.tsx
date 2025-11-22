'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Book,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Home,
  ShoppingCart,
  Tag,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Books',
    href: '/dashboard/books',
    icon: Book,
  },
  {
    name: 'Categories',
    href: '/dashboard/categories',
    icon: Tag,
  },
  {
    name: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
  },
  {
    name: 'Sales',
    href: '/dashboard/sales',
    icon: ShoppingCart,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: TrendingUp,
  },
  {
    name: 'Users',
    href: '/dashboard/users',
    icon: UserCheck,
    adminOnly: true,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly) {
      return user?.is_superuser;
    }
    return true;
  });

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute right-0 top-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <SidebarContent
              navigation={filteredNavigation}
              pathname={pathname}
              isActive={isActive}
              onItemClick={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col ${className}`}>
        <SidebarContent navigation={filteredNavigation} pathname={pathname} isActive={isActive} />
      </div>
    </>
  );
};

interface SidebarContentProps {
  navigation: NavItem[];
  pathname: string;
  isActive: (href: string) => boolean;
  onItemClick?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  navigation,
  pathname,
  isActive,
  onItemClick,
}) => {
  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center border-b border-gray-200 bg-white px-4">
        <Book className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">LibraryMS</span>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-5">
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navigation.map(item => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onItemClick}
                className={`${
                  active
                    ? 'border-r-4 border-blue-600 bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors`}
              >
                <Icon
                  className={`${
                    active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-6 w-6 flex-shrink-0`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
