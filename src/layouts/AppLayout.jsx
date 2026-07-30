// ============================================================
// AppLayout.jsx — Shared shell for all authenticated app pages
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopNav  from '../components/layout/TopNav';
import { useTransit } from '../context/TransitContext';
import clsx from 'clsx';

/**
 * AppLayout — wraps authenticated pages with a sidebar, topnav, and toast portal.
 */
export default function AppLayout() {
  const { toast } = useTransit();

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* ── Global Slide-In Toast Notification ──────────────── */}
      {toast && (
        <div
          id="toast-notification"
          className={clsx(
            'fixed top-6 right-6 z-[9999] px-4 py-3 rounded-lg shadow-xl text-white font-semibold text-sm',
            'transition-all duration-300 transform translate-x-0 flex items-center gap-2 animate-bounce',
            toast.type === 'success' && 'bg-primary border border-primary-light',
            toast.type === 'warning' && 'bg-status-delayed border border-yellow-500',
            toast.type === 'error' && 'bg-status-critical border border-red-500'
          )}
        >
          <span className="material-symbols-outlined">
            {toast.type === 'success' && 'check_circle'}
            {toast.type === 'warning' && 'warning'}
            {toast.type === 'error' && 'error'}
          </span>
          {toast.message}
        </div>
      )}

      {/* ── Fixed Left Sidebar ────────────────────────────── */}
      <Sidebar />

      {/* ── Main Area (offset by sidebar) ─────────────────── */}
      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: 'var(--sidebar-width, 260px)' }}
      >
        {/* Fixed top navigation */}
        <TopNav />

        {/* Scrollable page content — offset from top nav (h-16 = 64px) */}
        <main
          id="main-content"
          className="flex-1 pt-16 p-6 overflow-y-auto scrollbar-thin"
        >
          {/* Child page components render here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
