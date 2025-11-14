'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/books', label: 'Books' },
  { href: '/dashboard/categories', label: 'Categories' },
  { href: '/dashboard/customers', label: 'Customers' },
  { href: '/dashboard/sales', label: 'Sales' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav style={{ display: 'grid', gap: '0.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Menu</h2>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: isActive ? '#f9fafb' : 'transparent',
              color: isActive ? '#111827' : '#f9fafb',
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
