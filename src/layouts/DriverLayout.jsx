// ============================================================
// DriverLayout.jsx — Separate shell for DRIVER web portal
// ============================================================

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  MapIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useAppContext } from '../context/AppContext';
import { useTransit } from '../context/TransitContext';
import BrandLogo from '../components/common/BrandLogo';

const navItems = [
  { to: '/driver', end: true, label: 'Today', icon: HomeIcon },
  { to: '/driver/trip', label: 'Trip', icon: MapIcon },
  { to: '/driver/history', label: 'History', icon: ClockIcon },
  { to: '/driver/incidents', label: 'Incidents', icon: ExclamationTriangleIcon },
  { to: '/driver/notifications', label: 'Alerts', icon: BellIcon },
  { to: '/driver/profile', label: 'Profile', icon: UserCircleIcon },
];

function displayName(user) {
  if (!user) return 'Driver';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Driver';
}

export default function DriverLayout() {
  const { user, logout } = useAppContext();
  const { toast } = useTransit();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col md:flex-row">
      {toast && (
        <div
          className={clsx(
            'fixed top-6 right-6 z-[9999] px-4 py-3 rounded-lg shadow-xl text-white font-semibold text-sm',
            toast.type === 'success' && 'bg-primary',
            toast.type === 'warning' && 'bg-status-delayed',
            toast.type === 'error' && 'bg-status-critical'
          )}
        >
          {toast.message}
        </div>
      )}

      <aside className="md:w-64 md:min-h-screen bg-secondary border-b md:border-b-0 md:border-r border-surface-border flex flex-col">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-border">
          <BrandLogo size="sm" />
          <div>
            <p className="text-white font-bold text-sm leading-tight">TransitOps</p>
            <p className="text-slate-500 text-xs">Driver Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {navItems.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={!!end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-surface-border space-y-2">
          <p className="text-slate-200 text-sm font-medium truncate">{displayName(user)}</p>
          <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-status-critical text-sm mt-2"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
