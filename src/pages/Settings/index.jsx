// ============================================================
// Settings/index.jsx — Appearance + organization settings (API)
// ============================================================

import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../../context/AppContext';
import { settingsApi, unwrapList } from '../../services/api';
import clsx from 'clsx';

export default function Settings() {
  const { theme, setTheme, user } = useAppContext();
  const isDark = theme !== 'light';
  const isAdmin = user?.role === 'ADMIN';

  const [org, setOrg] = useState(null);
  const [audit, setAudit] = useState([]);
  const [orgError, setOrgError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const [settings, logs] = await Promise.all([
          settingsApi.get(),
          settingsApi.auditLogs({ size: 20 }),
        ]);
        if (!cancelled) {
          setOrg(settings);
          setAudit(unwrapList(logs));
          setOrgError(null);
        }
      } catch (err) {
        if (!cancelled) setOrgError(err.message || 'Could not load settings');
      }
    })();
    return () => { cancelled = true; };
  }, [isAdmin]);

  const saveOrg = async () => {
    if (!org || !isAdmin) return;
    setSaving(true);
    try {
      const updated = await settingsApi.update({
        organizationName: org.organizationName,
        brandingPrimaryColor: org.brandingPrimaryColor,
        contactEmail: org.contactEmail,
        timezone: org.timezone,
      });
      setOrg(updated);
    } catch (err) {
      setOrgError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="section-title gap-2">
          <Cog6ToothIcon className="w-6 h-6 text-primary" />
          Settings
        </h2>
        <p className="section-subtitle">
          Appearance preferences and organization configuration.
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
        </dl>
      </div>

      {isAdmin && (
        <div className="card space-y-4">
          <h3 className="text-slate-100 font-semibold text-sm">Organization (API)</h3>
          {orgError && <p className="text-status-critical text-xs">{orgError}</p>}
          {org && (
            <>
              <input className="w-full h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
                value={org.organizationName || ''}
                onChange={(e) => setOrg((o) => ({ ...o, organizationName: e.target.value }))}
                placeholder="Organization name" />
              <input className="w-full h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
                value={org.contactEmail || ''}
                onChange={(e) => setOrg((o) => ({ ...o, contactEmail: e.target.value }))}
                placeholder="Contact email" />
              <input className="w-full h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
                value={org.timezone || ''}
                onChange={(e) => setOrg((o) => ({ ...o, timezone: e.target.value }))}
                placeholder="Timezone" />
              <button type="button" className="btn-primary w-fit text-sm" disabled={saving} onClick={saveOrg}>
                {saving ? 'Saving…' : 'Save organization'}
              </button>
            </>
          )}

          <div>
            <h4 className="text-slate-300 text-xs font-bold uppercase mb-2">Recent audit log</h4>
            {audit.length === 0 ? (
              <p className="text-slate-500 text-xs">No audit entries.</p>
            ) : (
              <ul className="space-y-1 text-xs text-slate-400 max-h-48 overflow-y-auto">
                {audit.map((a) => (
                  <li key={a.id}>
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'} — {a.actor} {a.action} {a.entityType}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
