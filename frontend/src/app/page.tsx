import Link from 'next/link';

export default function HomePage() {
  return (
    <section style={{ padding: '4rem 2rem', maxWidth: '720px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Bookstore Management</h1>
      <p style={{ marginBottom: '2rem', lineHeight: 1.6 }}>
        Welcome to the Bookstore Management System dashboard. Sign in to manage inventory, categories,
        customers, and sales activity.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/login" style={{ padding: '0.75rem 1.5rem', background: '#111827', color: '#fff', borderRadius: '0.5rem' }}>
          Log In
        </Link>
        <Link href="/dashboard" style={{ padding: '0.75rem 1.5rem', border: '1px solid #111827', borderRadius: '0.5rem' }}>
          Go to Dashboard
        </Link>
      </div>
    </section>
  );
}
