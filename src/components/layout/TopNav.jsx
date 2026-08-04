// ============================================================
// TopNav.jsx — Top navigation bar shown inside AppLayout
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { useAppContext } from '../../context/AppContext';
import { useTransit } from '../../context/TransitContext';

// ── Page title map — maps route paths to display titles ─────
const PAGE_TITLES = {
  '/dashboard':     'Dashboard',
  '/routes':        'Routes',
  '/stops':         'Stops',
  '/schedules':     'Schedules',
  '/maps':          'Maps',
  '/notifications': 'Notifications',
  '/reports':       'Reports',
  '/drivers':       'Driver Management',
  '/vehicles':      'Vehicle Fleet',
  '/settings':      'Settings',
  '/empty':         'Empty State',
};

/**
 * TopNav — fixed horizontal bar at the top of every app page.
 * Shows the current page title, unread notifications badge, and profile.
 */
export default function TopNav() {
  const { pathname } = useLocation();
  const { user, theme, toggleTheme } = useAppContext();
  const { activeAlertsCount } = useTransit();
  const [searchValue, setSearchValue] = useState('');

  const pageTitle   = PAGE_TITLES[pathname] ?? 'TransitOps';
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Operator'
    : 'Operator';
  const isDark = theme !== 'light';

  return (
    <header
      className="
        fixed top-0 right-0 z-20 h-16
        flex items-center justify-between px-6 gap-4
        bg-secondary/80 backdrop-blur-md
        border-b border-surface-border
      "
      style={{ left: 'var(--sidebar-width, 260px)' }}
    >
      {/* ── Page Title ──────────────────────────────────── */}
      <div>
        <h1 className="text-lg font-semibold text-slate-100 leading-tight">
          {pageTitle}
        </h1>
        <p className="text-xs text-slate-500 hidden sm:block">
          TransitOps Management System
        </p>
      </div>

      {/* ── Search Bar ──────────────────────────────────── */}
      <div className="relative flex-1 max-w-sm hidden md:flex items-center">
        <MagnifyingGlassIcon className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          id="global-search"
          type="search"
          placeholder="Search routes, stops…"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="input pl-9 py-2 text-sm"
        />
      </div>

      {/* ── Right Controls ──────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          id="topnav-theme-toggle"
          type="button"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:bg-surface-light
                     hover:text-slate-100 transition-colors duration-200"
        >
          {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>

        {/* Notification bell with live badge count */}
        <button
          id="topnav-notifications"
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-slate-400 hover:bg-surface-light
                     hover:text-slate-100 transition-colors duration-200"
        >
          <BellIcon className="w-5 h-5" />
          {activeAlertsCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-status-critical text-[10px] text-white flex items-center justify-center font-bold px-1">
              {activeAlertsCount}
            </span>
          ) : (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center font-bold">
              ✓
            </span>
          )}
        </button>

        {/* User avatar with real name */}
        <button
          id="topnav-user-menu"
          type="button"
          aria-label="User menu"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg
                     text-slate-400 hover:bg-surface-light hover:text-slate-100
                     transition-colors duration-200"
        >
          <UserCircleIcon className="w-7 h-7 text-slate-400" />
          <span className="text-sm text-slate-300 hidden lg:block">{displayName}</span>
        </button>
      </div>
    </header>
  );
}
