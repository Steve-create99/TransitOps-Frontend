// ============================================================
// Settings/index.jsx — Appearance, org, invites, web push
// ============================================================

import { useEffect, useState } from 'react';
import {
  SunIcon,
  MoonIcon,
  Cog6ToothIcon,
  BellAlertIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { useAppContext } from '../../context/AppContext';
import { settingsApi, unwrapList } from '../../services/api';
import { disableWebPush, enableWebPush, getPushStatus } from '../../services/push';
import clsx from 'clsx';

export default function Settings() {
  const { theme, setTheme, user } = useAppContext();
  const isDark = theme !== 'light';
  const isAdmin = user?.role === 'ADMIN';

  const [org, setOrg] = useState(null);
  const [audit, setAudit] = useState([]);
  const [orgError, setOrgError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pushStatus, setPushStatus] = useState({ supported: false, subscribed: false, permission: 'default' });
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMsg, setPushMsg] = useState('');
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'DRIVER',
  });
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  useEffect(() => {
    getPushStatus().then(setPushStatus).catch(() => {});
  }, []);

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
        emailNotifications: org.emailNotifications,
        pushNotifications: org.pushNotifications,
      });
      setOrg(updated);
    } catch (err) {
      setOrgError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const togglePush = async () => {
    setPushBusy(true);
    setPushMsg('');
    try {
      if (pushStatus.subscribed) {
        await disableWebPush();
        setPushMsg('Browser notifications disabled on this device.');
      } else {
        await enableWebPush();
        setPushMsg('Browser notifications enabled. You will receive invites and operational alerts.');
      }
      setPushStatus(await getPushStatus());
    } catch (err) {
      setPushMsg(err.message || 'Could not update notification permission');
    } finally {
      setPushBusy(false);
    }
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setInviteBusy(true);
    setInviteMsg('');
    try {
      const result = await settingsApi.invite(inviteForm);
      setInviteMsg(result.message || `Invite processed for ${inviteForm.email}`);
      setInviteForm({ firstName: '', lastName: '', email: '', role: 'DRIVER' });
      const logs = await settingsApi.auditLogs({ size: 20 });
      setAudit(unwrapList(logs));
    } catch (err) {
      setInviteMsg(err.message || 'Invite failed');
    } finally {
      setInviteBusy(false);
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
          Appearance, browser notifications, organization configuration, and invites.
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

      <div className="card space-y-4">
        <div className="flex items-start gap-3">
          <BellAlertIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-slate-100 font-semibold text-sm">Browser notifications</h3>
            <p className="text-slate-500 text-xs mt-1">
              Enable web push for this browser to receive invite confirmations, delays, and incident alerts.
              Requires HTTPS (Cloudflare Pages) or localhost, and an ADMIN/DISPATCHER session.
            </p>
          </div>
        </div>
        {!pushStatus.supported ? (
          <p className="text-slate-500 text-xs">This browser does not support web push.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-primary text-sm" disabled={pushBusy} onClick={togglePush}>
              {pushBusy
                ? 'Working…'
                : pushStatus.subscribed
                  ? 'Disable notifications'
                  : 'Enable notifications'}
            </button>
            <span className="text-xs text-slate-500">
              Permission: {pushStatus.permission}
              {pushStatus.subscribed ? ' · subscribed' : ''}
            </span>
          </div>
        )}
        {pushMsg && <p className="text-xs text-slate-300">{pushMsg}</p>}
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
          <h3 className="text-slate-100 font-semibold text-sm flex items-center gap-2">
            <EnvelopeIcon className="w-4 h-4 text-primary" /> Invite user
          </h3>
          <p className="text-slate-500 text-xs">
            DRIVER invites send a Resend email with an accept link. Other roles are created as staff accounts.
            Public self-registration remains disabled.
          </p>
          <form onSubmit={sendInvite} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
              placeholder="First name" value={inviteForm.firstName}
              onChange={(e) => setInviteForm((f) => ({ ...f, firstName: e.target.value }))} />
            <input required className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
              placeholder="Last name" value={inviteForm.lastName}
              onChange={(e) => setInviteForm((f) => ({ ...f, lastName: e.target.value }))} />
            <input required type="email" className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
              placeholder="Email" value={inviteForm.email}
              onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))} />
            <select className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
              value={inviteForm.role}
              onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="DRIVER">DRIVER (email invite)</option>
              <option value="DISPATCHER">DISPATCHER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button type="submit" className="btn-primary sm:col-span-2 text-sm" disabled={inviteBusy}>
              {inviteBusy ? 'Sending…' : 'Send invite'}
            </button>
          </form>
          {inviteMsg && <p className="text-xs text-slate-300">{inviteMsg}</p>}
        </div>
      )}

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
