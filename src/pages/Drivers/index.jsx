// ============================================================
// Drivers/index.jsx — Driver roster (API-backed)
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { UsersIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { driversApi, unwrapList } from '../../services/api';
import { useTransit } from '../../context/TransitContext';
import { useAppContext } from '../../context/AppContext';

export default function DriversPage() {
  const { routes, showToast } = useTransit();
  const { user } = useAppContext();
  const canWrite = user?.role === 'ADMIN' || user?.role === 'DISPATCHER';

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    employmentStatus: 'ACTIVE',
    availability: 'AVAILABLE',
    assignedRouteId: '',
  });

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canWrite) return;
    try {
      await driversApi.create({
        ...form,
        assignedRouteId: form.assignedRouteId ? Number(form.assignedRouteId) : null,
      });
      showToast('Driver created', 'success');
      setShowForm(false);
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseNumber: '',
        employmentStatus: 'ACTIVE',
        availability: 'AVAILABLE',
        assignedRouteId: '',
      });
      await load();
    } catch (err) {
      showToast(err.message || 'Create failed', 'error');
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
          <p className="section-subtitle">Roster, assignments, attendance and incidents from the API</p>
        </div>
        {canWrite && (
          <button type="button" className="btn-primary flex items-center gap-1 text-sm" onClick={() => setShowForm((v) => !v)}>
            <PlusIcon className="w-4 h-4" /> Add Driver
          </button>
        )}
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

      {showForm && canWrite && (
        <form onSubmit={handleCreate} className="card grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            value={form.assignedRouteId}
            onChange={(e) => setForm((f) => ({ ...f, assignedRouteId: e.target.value }))}
          >
            <option value="">No route</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.number} — {r.name}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary sm:col-span-2">Save driver</button>
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
            <button
              key={d.id}
              type="button"
              onClick={() => openDetail(d)}
              className={clsx(
                'card w-full text-left hover:border-primary/40 transition-colors',
                selected?.id === d.id && 'border-primary'
              )}
            >
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
