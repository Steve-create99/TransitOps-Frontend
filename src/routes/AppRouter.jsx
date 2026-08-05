// ============================================================
// AppRouter.jsx — Role-aware routing for TransitOps
// ============================================================

import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { homeForRole, isDriver, isStaff } from '../utils/roles';

import AppLayout from '../layouts/AppLayout';
import DriverLayout from '../layouts/DriverLayout';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import RoutesPage from '../pages/Routes';
import Stops from '../pages/Stops';
import Schedules from '../pages/Schedules';
import Notifications from '../pages/Notifications';
import EmptyState from '../pages/EmptyState';
import Maps from '../pages/Maps';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import Drivers from '../pages/Drivers';
import Vehicles from '../pages/Vehicles';
import InviteAccept from '../pages/InviteAccept';

import DriverHome from '../pages/driver/Home';
import DriverTrip from '../pages/driver/Trip';
import DriverHistory from '../pages/driver/History';
import DriverIncidents from '../pages/driver/Incidents';
import DriverNotifications from '../pages/driver/Notifications';
import DriverProfile from '../pages/driver/Profile';

/** Redirects unauthenticated users to /login. */
function PrivateRoute() {
  const { user } = useAppContext();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

/** ADMIN / DISPATCHER only — DRIVER redirected to driver portal. */
function StaffRoute() {
  const { user } = useAppContext();
  if (isDriver(user)) return <Navigate to="/driver" replace />;
  if (!isStaff(user)) return <Navigate to={homeForRole(user)} replace />;
  return <Outlet />;
}

/** DRIVER only — staff redirected to admin dashboard. */
function DriverRoute() {
  const { user } = useAppContext();
  if (isStaff(user)) return <Navigate to="/dashboard" replace />;
  if (!isDriver(user)) return <Navigate to={homeForRole(user)} replace />;
  return <Outlet />;
}

/** Guest pages — logged-in users go to role home. */
function GuestRoute({ element }) {
  const { user } = useAppContext();
  return user ? <Navigate to={homeForRole(user)} replace /> : element;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<GuestRoute element={<Login />} />} />
      <Route path="/invite/accept" element={<InviteAccept />} />

      <Route element={<PrivateRoute />}>
        {/* Staff operations console */}
        <Route element={<StaffRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/stops" element={<Stops />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/empty" element={<EmptyState />} />
          </Route>
        </Route>

        {/* Driver companion web portal */}
        <Route element={<DriverRoute />}>
          <Route path="/driver" element={<DriverLayout />}>
            <Route index element={<DriverHome />} />
            <Route path="trip" element={<DriverTrip />} />
            <Route path="history" element={<DriverHistory />} />
            <Route path="incidents" element={<DriverIncidents />} />
            <Route path="notifications" element={<DriverNotifications />} />
            <Route path="profile" element={<DriverProfile />} />
          </Route>
        </Route>
      </Route>

      {/* Unknown paths → role home or login */}
      <Route path="*" element={<CatchAll />} />
    </Routes>
  );
}

function CatchAll() {
  const { user } = useAppContext();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homeForRole(user)} replace />;
}
