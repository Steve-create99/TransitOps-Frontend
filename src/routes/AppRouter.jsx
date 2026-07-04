// ============================================================
// AppRouter.jsx — Central routing configuration for TransitOps
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// ── Layout ──────────────────────────────────────────────────
import AppLayout from '../layouts/AppLayout';

// ── Pages ───────────────────────────────────────────────────
import Splash        from '../pages/Splash';
import Login         from '../pages/Login';
import Dashboard     from '../pages/Dashboard';
import RoutesPage    from '../pages/Routes';
import Stops         from '../pages/Stops';
import Schedules     from '../pages/Schedules';
import Notifications from '../pages/Notifications';
import EmptyState    from '../pages/EmptyState';
import Maps          from '../pages/Maps';

/**
 * PrivateRoute — redirects unauthenticated users to /login.
 */
function PrivateRoute() {
  const { user } = useAppContext();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

/**
 * GuestRoute — redirects already-authenticated users to /dashboard.
 * Wraps standalone pages like Splash and Login.
 */
function GuestRoute({ element }) {
  const { user } = useAppContext();
  return user ? <Navigate to="/dashboard" replace /> : element;
}

/**
 * AppRouter — renders all app routes.
 * Pages inside <AppLayout> are protected by PrivateRoute.
 * Splash and Login are guest-only routes.
 */
export default function AppRouter() {
  return (
    <Routes>
      {/* ── Guest-only Pages (redirect to dashboard if logged in) ── */}
      <Route path="/"      element={<GuestRoute element={<Splash />} />} />
      <Route path="/login" element={<GuestRoute element={<Login  />} />} />

      {/* ── Protected App Pages (redirect to /login if not logged in) ── */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/routes"        element={<RoutesPage />} />
          <Route path="/stops"         element={<Stops />} />
          <Route path="/schedules"     element={<Schedules />} />
          <Route path="/maps"          element={<Maps />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports"       element={<EmptyState title="System Reports"    description="Generate operational logs, fleet metrics, and performance charts." />} />
          <Route path="/drivers"       element={<EmptyState title="Driver Management" description="Manage driver rosters, schedules, and active duty assignments." />} />
          <Route path="/vehicles"      element={<EmptyState title="Vehicle Fleet"     description="Monitor transit vehicles, maintenance schedules, and telemetry status." />} />
          <Route path="/settings"      element={<EmptyState title="Settings"          description="Configure global system parameters, notification rules, and admin permissions." />} />
          <Route path="/empty"         element={<EmptyState />} />
        </Route>
      </Route>
    </Routes>
  );
}
