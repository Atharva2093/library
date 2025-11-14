import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bookstore Manager',
  description: 'Manage inventory, sales, and customers for your bookstore.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* TODO: Add <Navbar /> or <Sidebar /> components here */}
        <main>{children}</main>
      </body>
    </html>
  );
}
