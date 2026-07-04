// ============================================================
// Sidebar.jsx — Fixed left navigation panel
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  MapIcon,
  StopCircleIcon,
  CalendarDaysIcon,
  BellIcon,
  Cog6ToothIcon,
  TruckIcon,
  ChartBarIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useAppContext } from '../../context/AppContext';

// ── Navigation Link Definitions ─────────────────────────────
const navItems = [
  { to: '/dashboard',     label: 'Dashboard',    icon: HomeIcon         },
  { to: '/routes',        label: 'Routes',       icon: GlobeAltIcon     },
  { to: '/stops',         label: 'Stops',        icon: StopCircleIcon   },
  { to: '/schedules',     label: 'Schedules',    icon: CalendarDaysIcon },
  { to: '/maps',          label: 'Maps',         icon: MapIcon          },
  { to: '/notifications', label: 'Notifications', icon: BellIcon        },
  { to: '/reports',       label: 'Reports',      icon: ChartBarIcon     },
  { to: '/drivers',       label: 'Drivers',      icon: UsersIcon        },
  { to: '/vehicles',      label: 'Vehicles',     icon: TruckIcon        },
];

/** Build initials from first and last name */
function getInitials(user) {
  if (!user) return 'TO';
  const first = user.firstName?.[0] ?? '';
  const last  = user.lastName?.[0]  ?? '';
  return (first + last).toUpperCase() || 'TO';
}

/** Build display name from user object */
function getDisplayName(user) {
  if (!user) return 'Operator';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Operator';
}

/**
 * Sidebar — fixed 260px left panel with branding and nav links.
 */
export default function Sidebar() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className="
        fixed top-0 left-0 h-screen w-sidebar z-30
        bg-secondary border-r border-surface-border
        flex flex-col scrollbar-thin overflow-y-auto
      "
    >
      {/* ── Brand Logo ──────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-border">
        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
          <TruckIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight tracking-tight">
            TransitOps
          </p>
          <p className="text-slate-500 text-xs">Transit Management</p>
        </div>
      </div>

      {/* ── Navigation Links ─────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Main Menu
        </p>

        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/15 text-primary font-semibold'
                  : 'text-slate-400 hover:bg-surface-light hover:text-slate-100'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={clsx(
                    'w-5 h-5 shrink-0 transition-colors duration-200',
                    isActive ? 'text-primary' : 'text-slate-500'
                  )}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer — Settings, Logout & User Profile ──────── */}
      <div className="px-3 pb-4 border-t border-surface-border pt-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary/15 text-primary font-semibold'
                : 'text-slate-400 hover:bg-surface-light hover:text-slate-100'
            )
          }
        >
          <Cog6ToothIcon className="w-5 h-5 shrink-0 text-slate-500" />
          Settings
        </NavLink>

        {/* Logout — calls context logout then redirects */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-slate-400 hover:bg-surface-light hover:text-slate-100
                     transition-all duration-200 mt-1"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0 text-slate-500" />
          Logout
        </button>

        {/* User profile block */}
        <div className="mt-3 flex items-center gap-3 px-3 py-2 border-t border-surface-border/50 pt-3">
          <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center shrink-0">
            <span className="text-primary text-xs font-bold">{getInitials(user)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate">{getDisplayName(user)}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
