// ============================================================
// Settings/index.jsx — Appearance & system preferences
// ============================================================

import { SunIcon, MoonIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../../context/AppContext';
import clsx from 'clsx';

export default function Settings() {
  const { theme, setTheme, user } = useAppContext();
  const isDark = theme !== 'light';

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="section-title gap-2">
          <Cog6ToothIcon className="w-6 h-6 text-primary" />
          Settings
        </h2>
        <p className="section-subtitle">
          Appearance preferences for the TransitOps operations portal.
        </p>
      </div>

      <div className="card space-y-5">
        <div>
          <h3 className="text-slate-100 font-semibold text-sm mb-1">Appearance</h3>
          <p className="text-slate-500 text-xs">
            Switch between dark operations mode and light daytime mode. Your choice is saved on this device.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={clsx(
              'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors',
              isDark
                ? 'border-primary bg-primary/10'
                : 'border-surface-border bg-surface-light hover:border-primary/40'
            )}
          >
            <MoonIcon className="w-5 h-5 text-primary" />
            <span className="text-slate-100 font-semibold text-sm">Dark mode</span>
            <span className="text-slate-500 text-xs">Default navy operations theme</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={clsx(
              'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors',
              !isDark
                ? 'border-primary bg-primary/10'
                : 'border-surface-border bg-surface-light hover:border-primary/40'
            )}
          >
            <SunIcon className="w-5 h-5 text-primary" />
            <span className="text-slate-100 font-semibold text-sm">Light mode</span>
            <span className="text-slate-500 text-xs">Bright surfaces for daytime desks</span>
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-slate-100 font-semibold text-sm mb-3">Signed-in account</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500 text-xs uppercase tracking-wide mb-1">Name</dt>
            <dd className="text-slate-200 font-medium">
              {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 text-xs uppercase tracking-wide mb-1">Email</dt>
            <dd className="text-slate-200 font-medium">{user?.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500 text-xs uppercase tracking-wide mb-1">Role</dt>
            <dd className="text-slate-200 font-medium">{user?.role || '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500 text-xs uppercase tracking-wide mb-1">Theme</dt>
            <dd className="text-primary font-semibold capitalize">{theme}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
