// ============================================================
// AppLayout.jsx — Shared shell for all authenticated app pages
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopNav  from '../components/layout/TopNav';

/**
 * AppLayout — wraps authenticated pages with:
 *   - Fixed sidebar (260px left)
 *   - Fixed top navigation bar (height 64px)
 *   - Scrollable main content area
 *
 * Child routes render via <Outlet />.
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-secondary flex">

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
