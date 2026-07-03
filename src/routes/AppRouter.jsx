// ============================================================
// AppRouter.jsx — Central routing configuration for TransitOps
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { Routes, Route } from 'react-router-dom';

// ── Layout ──────────────────────────────────────────────────
import AppLayout from '../layouts/AppLayout';

// ── Pages ───────────────────────────────────────────────────
import Splash from '../pages/Splash';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import RoutesPage from '../pages/Routes';
import Stops from '../pages/Stops';
import Schedules from '../pages/Schedules';
import Notifications from '../pages/Notifications';
import EmptyState from '../pages/EmptyState';
import Maps from '../pages/Maps';

/**
 * AppRouter — renders all app routes.
 * Pages inside <AppLayout> get sidebar + topnav automatically.
 * Splash and Login render standalone (no layout).
 */
export default function AppRouter() {
  return (
    <Routes>
      {/* ── Standalone Pages (no sidebar) ───────────────── */}
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />

      {/* ── App Pages (inside sidebar layout) ───────────── */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/stops" element={<Stops />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<EmptyState title="System Reports" description="Generate operational logs, fleet metrics, and performance charts." />} />
        <Route path="/drivers" element={<EmptyState title="Driver Management" description="Manage driver rosters, schedules, and active duty assignments." />} />
        <Route path="/vehicles" element={<EmptyState title="Vehicle Fleet" description="Monitor transit vehicles, maintenance schedules, and telemetry status." />} />
        <Route path="/settings" element={<EmptyState title="Settings" description="Configure global system parameters, notification rules, and admin permissions." />} />
        <Route path="/empty" element={<EmptyState />} />
      </Route>
    </Routes>
  );
}
