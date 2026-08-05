// ============================================================
// Drivers/index.jsx — Driver roster + email invite (API-backed)
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { driversApi, unwrapList } from '../../services/api';
import { useTransit } from '../../context/TransitContext';
import { useAppContext } from '../../context/AppContext';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  licenseNumber: '',
  employmentStatus: 'ACTIVE',
  availability: 'AVAILABLE',
  assignedRouteId: '',
};

export default function DriversPage() {
  const { routes, showToast } = useTransit();
  const { user } = useAppContext();
  const canWrite = user?.role === 'ADMIN' || user?.role === 'DISPATCHER';
  const isAdmin = user?.role === 'ADMIN';

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    assignedRouteId: '',
  });
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await driversApi.list({ search });
      setDrivers(unwrapList(data));
    } catch (err) {
      setError(err.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter((d) =>
      `${d.firstName} ${d.lastName} ${d.email || ''} ${d.licenseNumber || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [drivers, search]);

  const openDetail = async (driver) => {
    setSelected(driver);
    try {
      const [inc, att] = await Promise.all([
        driversApi.incidents(driver.id).catch(() => []),
        driversApi.attendance(driver.id).catch(() => []),
      ]);
      setIncidents(Array.isArray(inc) ? inc : unwrapList(inc));
      setAttendance(Array.isArray(att) ? att : unwrapList(att));
    } catch {
      setIncidents([]);
      setAttendance([]);
    }
  };

  const startEdit = (driver) => {
    setEditingId(driver.id);
    setShowForm(true);
    setShowInvite(false);
    setForm({
      firstName: driver.firstName || '',
      lastName: driver.lastName || '',
      email: driver.email || '',
      phone: driver.phone || '',
      licenseNumber: driver.licenseNumber || '',
      employmentStatus: driver.employmentStatus || 'ACTIVE',
      availability: driver.availability || 'AVAILABLE',
      assignedRouteId: driver.assignedRouteId || '',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canWrite) return;
    const body = {
      ...form,
      assignedRouteId: form.assignedRouteId ? Number(form.assignedRouteId) : null,
    };
    try {
      if (editingId) {
        await driversApi.update(editingId, body);
        showToast('Driver updated', 'success');
      } else {
        await driversApi.create(body);
        showToast('Driver created', 'success');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async (driver) => {
    if (!isAdmin) return;
    if (!window.confirm(`Delete driver ${driver.firstName} ${driver.lastName}?`)) return;
    try {
      await driversApi.remove(driver.id);
      showToast('Driver deleted', 'success');
      if (selected?.id === driver.id) setSelected(null);
      await load();
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setInviting(true);
    // #region agent log
    const _lic = (inviteForm.licenseNumber || '').trim();
    fetch('http://127.0.0.1:7897/ingest/83a22195-7c60-48a5-a891-98ed1298e176',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'be8849'},body:JSON.stringify({sessionId:'be8849',runId:'pre-fix',hypothesisId:'A',location:'Drivers/index.jsx:handleInvite',message:'invite submit',data:{hasLicense:!!_lic,licenseLen:_lic.length,hasRoute:!!inviteForm.assignedRouteId,emailDomain:(inviteForm.email||'').split('@')[1]||null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    try {
      const result = await driversApi.invite({
        ...inviteForm,
        assignedRouteId: inviteForm.assignedRouteId ? Number(inviteForm.assignedRouteId) : null,
      });
      // #region agent log
      fetch('http://127.0.0.1:7897/ingest/83a22195-7c60-48a5-a891-98ed1298e176',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'be8849'},body:JSON.stringify({sessionId:'be8849',runId:'post-fix',hypothesisId:'C',location:'Drivers/index.jsx:handleInvite:ok',message:'invite api ok',data:{emailSent:result?.emailSent===true,status:result?.status||null,hasDriverId:!!result?.driverId,hasAcceptUrl:!!result?.acceptUrl,msgHasDomainHint:/verify a domain|testing domain|Resend/i.test(result?.message||'')},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (result.emailSent === false && result.acceptUrl) {
        try {
          await navigator.clipboard.writeText(result.acceptUrl);
          showToast((result.message || 'Invite created') + ' Accept link copied to clipboard.', 'warning');
        } catch {
          showToast(result.message || 'Invite created (copy accept link from network response)', 'warning');
          // eslint-disable-next-line no-console
          console.info('Invite accept URL:', result.acceptUrl);
        }
      } else {
        showToast(result.message || 'Invitation sent', 'success');
      }
      setShowInvite(false);
      setInviteForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        assignedRouteId: '',
      });
      await load();
    } catch (err) {
      const msg = err.message || 'Invite failed';
      // #region agent log
      fetch('http://127.0.0.1:7897/ingest/83a22195-7c60-48a5-a891-98ed1298e176',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'be8849'},body:JSON.stringify({sessionId:'be8849',runId:'pre-fix',hypothesisId:'A',location:'Drivers/index.jsx:handleInvite:err',message:'invite api error',data:{isDupLicense:/license_number|duplicate key|ukcr60ij/i.test(msg),isConflict:/already exists|conflict/i.test(msg),isResend:/resend|email was not sent/i.test(msg),msgSnippet:String(msg).slice(0,180)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      showToast(msg, 'error');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            Driver Management
          </h2>
          <p className="section-subtitle">Roster, email invites, assignments, attendance and incidents</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <button
              type="button"
              className="btn-primary flex items-center gap-1 text-sm"
              onClick={() => {
                setShowInvite((v) => !v);
                setShowForm(false);
                setEditingId(null);
              }}
            >
              <EnvelopeIcon className="w-4 h-4" /> Invite by email
            </button>
          )}
          {canWrite && (
            <button
              type="button"
              className="h-10 px-3 rounded-xl border border-surface-border text-sm text-slate-200 hover:border-primary/40"
              onClick={() => {
                setShowForm((v) => !v);
                setShowInvite(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              <span className="inline-flex items-center gap-1">
                <PlusIcon className="w-4 h-4" /> Add Driver
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface border border-surface-border text-sm text-slate-200"
          placeholder="Search drivers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showInvite && isAdmin && (
        <form onSubmit={handleInvite} className="card grid grid-cols-1 sm:grid-cols-2 gap-3">
          <p className="sm:col-span-2 text-xs text-slate-400">
            Sends a KNUST TransitOps Driver Companion email with an accept link. Self-registration stays disabled.
            While <code className="text-slate-300">RESEND_FROM_EMAIL</code> uses <code className="text-slate-300">onboarding@resend.dev</code>,
            Resend only delivers to your Resend account email — verify a domain at resend.com/domains to invite other drivers.
            If email fails, the accept link is copied for you to share manually.
          </p>
          {['firstName', 'lastName', 'email', 'phone', 'licenseNumber'].map((field) => (
            <input
              key={field}
              required={field === 'firstName' || field === 'lastName' || field === 'email'}
              type={field === 'email' ? 'email' : 'text'}
              className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
              placeholder={field}
              value={inviteForm[field]}
              onChange={(e) => setInviteForm((f) => ({ ...f, [field]: e.target.value }))}
            />
          ))}
          <select
            className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
            value={inviteForm.assignedRouteId}
            onChange={(e) => setInviteForm((f) => ({ ...f, assignedRouteId: e.target.value }))}
          >
            <option value="">No route yet</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.number} — {r.name}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary sm:col-span-2" disabled={inviting}>
            {inviting ? 'Sending…' : 'Send invite email'}
          </button>
        </form>
      )}

      {showForm && canWrite && (
        <form onSubmit={handleSave} className="card grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['firstName', 'lastName', 'email', 'phone', 'licenseNumber'].map((field) => (
            <input
              key={field}
              required={field === 'firstName' || field === 'lastName'}
              className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
              placeholder={field}
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
            />
          ))}
          <select
            className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
            value={form.employmentStatus}
            onChange={(e) => setForm((f) => ({ ...f, employmentStatus: e.target.value }))}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INVITED">INVITED</option>
            <option value="ON_LEAVE">ON_LEAVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <select
            className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
            value={form.assignedRouteId}
            onChange={(e) => setForm((f) => ({ ...f, assignedRouteId: e.target.value }))}
          >
            <option value="">No route</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.number} — {r.name}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary sm:col-span-2">
            {editingId ? 'Update driver' : 'Save driver'}
          </button>
        </form>
      )}

      {loading && <div className="card text-slate-400 text-sm">Loading drivers…</div>}
      {error && (
        <div className="card space-y-2">
          <p className="text-status-critical text-sm">{error}</p>
          <button type="button" className="btn-primary w-fit" onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card text-slate-500 text-sm">No drivers found.</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          {filtered.map((d) => (
            <div
              key={d.id}
              className={clsx(
                'card w-full text-left hover:border-primary/40 transition-colors',
                selected?.id === d.id && 'border-primary'
              )}
            >
              <button type="button" onClick={() => openDetail(d)} className="w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-slate-100 font-semibold">{d.firstName} {d.lastName}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{d.email || 'No email'} · {d.phone || 'No phone'}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {d.assignedRouteName || 'Unassigned'} · License {d.licenseNumber || '—'}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={d.employmentStatus === 'ACTIVE' ? 'badge-active' : 'badge-delayed'}>
                      {d.employmentStatus || '—'}
                    </span>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">{d.availability}</p>
                  </div>
                </div>
              </button>
              {canWrite && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-surface-border/60">
                  <button type="button" className="text-xs text-primary inline-flex items-center gap-1" onClick={() => startEdit(d)}>
                    <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                  </button>
                  {isAdmin && (
                    <button type="button" className="text-xs text-status-critical inline-flex items-center gap-1" onClick={() => handleDelete(d)}>
                      <TrashIcon className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card min-h-[240px]">
          {!selected ? (
            <p className="text-slate-500 text-sm">Select a driver to view attendance and incidents.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-slate-100 font-semibold text-base">
                  {selected.firstName} {selected.lastName}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Route: {selected.assignedRouteName || '—'} · Expiry: {selected.licenseExpiry || '—'}
                </p>
              </div>
              <div>
                <h4 className="text-slate-300 text-xs font-bold uppercase mb-2">Recent attendance</h4>
                {attendance.length === 0 ? (
                  <p className="text-slate-500 text-xs">No attendance records.</p>
                ) : (
                  <ul className="space-y-1 text-xs text-slate-400">
                    {attendance.slice(0, 8).map((a) => (
                      <li key={a.id || `${a.date}-${a.status}`}>
                        {a.date || a.checkInAt || '—'} — {a.status || 'RECORD'}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="text-slate-300 text-xs font-bold uppercase mb-2">Incidents</h4>
                {incidents.length === 0 ? (
                  <p className="text-slate-500 text-xs">No incidents.</p>
                ) : (
                  <ul className="space-y-1 text-xs text-slate-400">
                    {incidents.slice(0, 8).map((i) => (
                      <li key={i.id}>{i.title || i.description} ({i.severity || '—'})</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
