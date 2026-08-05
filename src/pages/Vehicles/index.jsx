// ============================================================
// Vehicles/index.jsx — Fleet management (API-backed)
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import {
  TruckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  WrenchScrewdriverIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { vehiclesApi, unwrapList } from '../../services/api';
import { useTransit } from '../../context/TransitContext';
import { useAppContext } from '../../context/AppContext';

export default function VehiclesPage() {
  const { routes, showToast } = useTransit();
  const { user } = useAppContext();
  const canWrite = user?.role === 'ADMIN' || user?.role === 'DISPATCHER';

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [maintForm, setMaintForm] = useState({ description: '', cost: '', serviceDate: '' });
  const [form, setForm] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    capacity: 40,
    status: 'AVAILABLE',
    fuelLevel: 100,
    assignedRouteId: '',
  });
  const isAdmin = user?.role === 'ADMIN';

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehiclesApi.list({ search });
      setVehicles(unwrapList(data));
    } catch (err) {
      setError(err.message || 'Failed to load vehicles');
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
    if (!q) return vehicles;
    return vehicles.filter((v) =>
      `${v.registrationNumber} ${v.make || ''} ${v.model || ''} ${v.status || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [vehicles, search]);

  const openDetail = async (vehicle) => {
    setSelected(vehicle);
    try {
      const m = await vehiclesApi.maintenance(vehicle.id);
      setMaintenance(Array.isArray(m) ? m : unwrapList(m));
    } catch {
      setMaintenance([]);
    }
  };

  const startEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setShowForm(true);
    setForm({
      registrationNumber: vehicle.registrationNumber || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      capacity: vehicle.capacity ?? 40,
      status: vehicle.status || 'AVAILABLE',
      fuelLevel: vehicle.fuelLevel ?? 100,
      assignedRouteId: vehicle.assignedRouteId || '',
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canWrite) return;
    const body = {
      ...form,
      capacity: Number(form.capacity) || 40,
      fuelLevel: Number(form.fuelLevel) || 100,
      assignedRouteId: form.assignedRouteId ? Number(form.assignedRouteId) : null,
      gpsStatus: 'ONLINE',
    };
    try {
      if (editingId) {
        await vehiclesApi.update(editingId, body);
        showToast('Vehicle updated', 'success');
      } else {
        await vehiclesApi.create(body);
        showToast('Vehicle added', 'success');
      }
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch (err) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async (vehicle) => {
    if (!isAdmin) return;
    if (!window.confirm(`Delete vehicle ${vehicle.registrationNumber}?`)) return;
    try {
      await vehiclesApi.remove(vehicle.id);
      showToast('Vehicle deleted', 'success');
      if (selected?.id === vehicle.id) setSelected(null);
      await load();
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    if (!canWrite || !selected) return;
    try {
      await vehiclesApi.addMaintenance(selected.id, {
        description: maintForm.description,
        cost: maintForm.cost ? Number(maintForm.cost) : null,
        serviceDate: maintForm.serviceDate || new Date().toISOString().slice(0, 10),
      });
      showToast('Maintenance record added', 'success');
      setMaintForm({ description: '', cost: '', serviceDate: '' });
      await openDetail(selected);
      await load();
    } catch (err) {
      showToast(err.message || 'Maintenance save failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <TruckIcon className="w-5 h-5 text-primary" />
            Vehicle Fleet
          </h2>
          <p className="section-subtitle">Live GPS status, fuel levels, and maintenance records</p>
        </div>
        {canWrite && (
          <button
            type="button"
            className="btn-primary flex items-center gap-1 text-sm"
            onClick={() => {
              setEditingId(null);
              setShowForm((v) => !v);
            }}
          >
            <PlusIcon className="w-4 h-4" /> Add Vehicle
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface border border-surface-border text-sm text-slate-200"
          placeholder="Search registration, make, status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showForm && canWrite && (
        <form onSubmit={handleCreate} className="card grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm" placeholder="Registration"
            value={form.registrationNumber} onChange={(e) => setForm((f) => ({ ...f, registrationNumber: e.target.value }))} />
          <input className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm" placeholder="Make"
            value={form.make} onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))} />
          <input className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm" placeholder="Model"
            value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
          <input type="number" className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm" placeholder="Capacity"
            value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
          <select className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
            value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
          </select>
          <select className="h-10 px-3 rounded-lg bg-surface-light border border-surface-border text-sm"
            value={form.assignedRouteId} onChange={(e) => setForm((f) => ({ ...f, assignedRouteId: e.target.value }))}>
            <option value="">No route</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.number} — {r.name}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary sm:col-span-2">
            {editingId ? 'Update vehicle' : 'Save vehicle'}
          </button>
        </form>
      )}

      {loading && <div className="card text-slate-400 text-sm">Loading fleet…</div>}
      {error && (
        <div className="card space-y-2">
          <p className="text-status-critical text-sm">{error}</p>
          <button type="button" className="btn-primary w-fit" onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card text-slate-500 text-sm">No vehicles found.</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          {filtered.map((v) => (
            <div
              key={v.id}
              className={clsx(
                'card w-full text-left hover:border-primary/40 transition-colors',
                selected?.id === v.id && 'border-primary'
              )}
            >
              <button type="button" onClick={() => openDetail(v)} className="w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-slate-100 font-semibold">{v.registrationNumber}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {v.make} {v.model} · Cap {v.capacity || '—'}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Fuel {v.fuelLevel != null ? `${v.fuelLevel}%` : '—'} · GPS {v.gpsStatus || '—'}
                    </p>
                  </div>
                  <span className={v.status === 'ACTIVE' || v.status === 'AVAILABLE' ? 'badge-active' : 'badge-delayed'}>
                    {v.status}
                  </span>
                </div>
              </button>
              {canWrite && (
                <div className="flex gap-3 mt-3 pt-2 border-t border-surface-border/50">
                  <button type="button" className="text-xs text-primary inline-flex items-center gap-1" onClick={() => startEdit(v)}>
                    <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                  </button>
                  {isAdmin && (
                    <button type="button" className="text-xs text-status-critical inline-flex items-center gap-1" onClick={() => handleDelete(v)}>
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
            <p className="text-slate-500 text-sm">Select a vehicle for maintenance history.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-slate-100 font-semibold">{selected.registrationNumber}</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Lat {selected.latitude ?? '—'}, Lng {selected.longitude ?? '—'}
                  {selected.lastGpsAt ? ` · Last ping ${new Date(selected.lastGpsAt).toLocaleString()}` : ''}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Due: {selected.maintenanceDue || '—'} · Notes: {selected.maintenanceNotes || '—'}
                </p>
              </div>

              <div>
                <h4 className="text-slate-300 text-xs font-bold uppercase mb-2 flex items-center gap-1">
                  <WrenchScrewdriverIcon className="w-4 h-4" /> Maintenance
                </h4>
                {maintenance.length === 0 ? (
                  <p className="text-slate-500 text-xs mb-3">No maintenance records.</p>
                ) : (
                  <ul className="space-y-1 text-xs text-slate-400 mb-3">
                    {maintenance.map((m) => (
                      <li key={m.id}>
                        {m.serviceDate || '—'} — {m.description || 'Service'}
                        {m.cost != null ? ` (GHS ${m.cost})` : ''}
                      </li>
                    ))}
                  </ul>
                )}
                {canWrite && (
                  <form onSubmit={handleAddMaintenance} className="space-y-2">
                    <input required className="w-full h-9 px-3 rounded-lg bg-surface-light border border-surface-border text-xs"
                      placeholder="Description" value={maintForm.description}
                      onChange={(e) => setMaintForm((f) => ({ ...f, description: e.target.value }))} />
                    <div className="flex gap-2">
                      <input type="date" className="h-9 px-3 rounded-lg bg-surface-light border border-surface-border text-xs flex-1"
                        value={maintForm.serviceDate}
                        onChange={(e) => setMaintForm((f) => ({ ...f, serviceDate: e.target.value }))} />
                      <input type="number" step="0.01" className="h-9 px-3 rounded-lg bg-surface-light border border-surface-border text-xs w-28"
                        placeholder="Cost" value={maintForm.cost}
                        onChange={(e) => setMaintForm((f) => ({ ...f, cost: e.target.value }))} />
                    </div>
                    <button type="submit" className="btn-primary text-xs">Add maintenance</button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
