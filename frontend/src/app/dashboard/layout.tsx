'use client';

import Protected from '../../components/Protected';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

import './dashboard.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected>
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <Sidebar />
        </aside>
        <div className="dashboard-main">
          <Navbar />
          <main className="dashboard-content">{children}</main>
        </div>
      </div>
    </Protected>
  );
}
