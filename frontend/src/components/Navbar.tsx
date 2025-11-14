'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = typeof window !== 'undefined' ? window.localStorage.getItem('user_email') : null;
    setEmail(storedEmail);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('access_token');
      window.localStorage.removeItem('user_email');
    }
    router.replace('/login');
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        borderBottom: '1px solid #1f2937',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Bookstore Dashboard</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {email ? <span style={{ color: '#d1d5db' }}>{email}</span> : null}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #4b5563',
            backgroundColor: 'transparent',
            color: '#f9fafb',
            cursor: 'pointer',
          }}
        >
          Log out
        </button>
      </div>
    </header>
  );
}
