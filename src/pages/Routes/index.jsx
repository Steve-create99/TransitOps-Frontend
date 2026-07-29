// ============================================================
// Routes/index.jsx — KNUST shuttle route management page
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState, useRef, useEffect } from 'react';
import {
  MapIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useTransit } from '../../context/TransitContext';

// ── Status badge helper ──────────────────────────────────────
function statusBadge(status) {
  if (status === 'Active')   return 'badge-active';
  if (status === 'Inactive') return 'badge-delayed';
  return 'badge-critical';
}

// ── Add-Route Modal ──────────────────────────────────────────
function AddRouteModal({ onClose, onSave, availableStopNames }) {
  // Form field state
  const [form, setForm] = useState({
    name: '',
    number: '',
    startStop: '',
    endStop: '',
    intermediateStops: [],
    status: 'Active',
    type: 'Regular',
    direction: 'Northbound',
  });
  const [intermediateInput, setIntermediateInput] = useState('');

  // Update a single form field
  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  // Add an intermediate stop from the input
  const addIntermediate = () => {
    const trimmed = intermediateInput.trim();
    if (trimmed && !form.intermediateStops.includes(trimmed)) {
      set('intermediateStops', [...form.intermediateStops, trimmed]);
    }
    setIntermediateInput('');
  };

  // Remove one intermediate stop by index
  const removeIntermediate = (idx) => {
    set(
      'intermediateStops',
      form.intermediateStops.filter((_, i) => i !== idx)
    );
  };

  // Handle form submission
  const handleSave = () => {
    // Basic validation
    if (!form.name || !form.number || !form.startStop || !form.endStop) return;
    onSave(form);
    onClose();
  };

  // Close modal when clicking the backdrop
  const backdropRef = useRef();
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    /* ── Backdrop ── */
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      {/* ── Modal card ── */}
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-slate-100 font-semibold text-base">Add New Route</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form grid */}
        <div className="space-y-4">

          {/* Route Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Route Name</label>
            <input
              id="route-modal-name"
              type="text"
              placeholder="e.g. Main Gate — KNUST Hospital"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="input"
            />
          </div>

          {/* Route Number */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Route Number</label>
            <input
              id="route-modal-number"
              type="text"
              placeholder="e.g. K-07"
              value={form.number}
              onChange={(e) => set('number', e.target.value)}
              className="input"
            />
          </div>

          {/* Start Stop / End Stop side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Start Stop</label>
              <select
                id="route-modal-start"
                value={form.startStop}
                onChange={(e) => set('startStop', e.target.value)}
                className="input"
              >
                <option value="">Select stop…</option>
                {availableStopNames.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">End Stop</label>
              <select
                id="route-modal-end"
                value={form.endStop}
                onChange={(e) => set('endStop', e.target.value)}
                className="input"
              >
                <option value="">Select stop…</option>
                {availableStopNames.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Intermediate Stops */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Intermediate Stops</label>
            <div className="flex gap-2">
              <select
                id="route-modal-intermediate"
                value={intermediateInput}
                onChange={(e) => setIntermediateInput(e.target.value)}
                className="input"
              >
                <option value="">Add a stop…</option>
                {availableStopNames
                  .filter((s) => s !== form.startStop && s !== form.endStop && !form.intermediateStops.includes(s))
                  .map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
              </select>
              <button
                type="button"
                onClick={addIntermediate}
                className="btn-ghost shrink-0"
                disabled={!intermediateInput}
              >
                Add
              </button>
            </div>

            {/* Chips showing selected intermediate stops */}
            {form.intermediateStops.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.intermediateStops.map((stop, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                  >
                    {stop}
                    <button
                      type="button"
                      onClick={() => removeIntermediate(idx)}
                      className="hover:text-red-400 transition-colors"
                      aria-label={`Remove ${stop}`}
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Type + Direction */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Route Type</label>
              <select
                id="route-modal-type"
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
                className="input"
              >
                {['Regular', 'Express', 'Circular', 'Feeder'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Direction</label>
              <select
                id="route-modal-direction"
                value={form.direction}
                onChange={(e) => set('direction', e.target.value)}
                className="input"
              >
                {['Northbound', 'Southbound', 'Eastbound', 'Westbound'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
            <div className="flex gap-3">
              {['Active', 'Inactive'].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="route-status"
                    value={s}
                    checked={form.status === s}
                    onChange={() => set('status', s)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-slate-300">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-border">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            type="button"
            onClick={handleSave}
            id="route-modal-save"
            className="btn-primary"
            disabled={!form.name || !form.number || !form.startStop || !form.endStop}
          >
            Save Route
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Filter Panel ─────────────────────────────────────────────
function FilterPanel({ filters, onChange, onClose }) {
  return (
    <div className="absolute right-0 top-full mt-2 z-40 w-64 card shadow-xl border border-surface-border">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Filter Routes</p>

      {/* Status filter */}
      <div className="mb-3">
        <label className="block text-xs text-slate-400 mb-1">Status</label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="input"
        >
          <option value="">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Direction filter */}
      <div className="mb-3">
        <label className="block text-xs text-slate-400 mb-1">Direction</label>
        <select
          id="filter-direction"
          value={filters.direction}
          onChange={(e) => onChange({ ...filters, direction: e.target.value })}
          className="input"
        >
          <option value="">All</option>
          {['Northbound', 'Southbound', 'Eastbound', 'Westbound'].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Route Type filter */}
      <div className="mb-4">
        <label className="block text-xs text-slate-400 mb-1">Route Type</label>
        <select
          id="filter-type"
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value })}
          className="input"
        >
          <option value="">All</option>
          {['Regular', 'Express', 'Circular', 'Feeder'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Clear & close */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange({ status: '', direction: '', type: '' })}
          className="btn-ghost text-xs flex-1"
        >
          Clear
        </button>
        <button type="button" onClick={onClose} className="btn-primary text-xs flex-1">
          Apply
        </button>
      </div>
    </div>
  );
}

// ── Main RoutesPage ──────────────────────────────────────────
export default function RoutesPage() {
  const { routes, addRoute, availableStopNames } = useTransit();

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter panel state
  const [showFilter, setShowFilter]   = useState(false);
  const [filters, setFilters]         = useState({ status: '', direction: '', type: '' });
  const filterRef                     = useRef();

  // Search query
  const [search, setSearch] = useState('');

  // Close filter panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Apply filters + search in real time ──────────────────
  const displayedRoutes = routes.filter((r) => {
    // Search by name or route number
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.number.toLowerCase().includes(q);

    // Status / direction / type filters
    const matchStatus    = !filters.status    || r.status    === filters.status;
    const matchDirection = !filters.direction || r.direction === filters.direction;
    const matchType      = !filters.type      || r.type      === filters.type;

    return matchSearch && matchStatus && matchDirection && matchType;
  });

  // Count active filters for badge
  const activeFilterCount = [filters.status, filters.direction, filters.type].filter(Boolean).length;

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="section-title">Routes</h2>
          <p className="section-subtitle">
            KNUST campus shuttle routes · {displayedRoutes.length} of {routes.length} shown
          </p>
        </div>
        <div className="flex items-center gap-2">

          {/* Filter button with relative wrapper for panel */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              id="routes-filter"
              className="btn-ghost"
              onClick={() => setShowFilter((v) => !v)}
            >
              <FunnelIcon className="w-4 h-4" />
              Filter
              {/* Active filter count badge */}
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDownIcon className={`w-3 h-3 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter dropdown panel */}
            {showFilter && (
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onClose={() => setShowFilter(false)}
              />
            )}
          </div>

          {/* Add Route button → opens modal */}
          <button
            type="button"
            id="routes-add"
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <PlusIcon className="w-4 h-4" />
            Add Route
          </button>
        </div>
      </div>

      {/* ── Search Bar ──────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          id="routes-search"
          type="search"
          placeholder="Search by name or number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* ── Routes Grid ─────────────────────────────────────── */}
      {displayedRoutes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedRoutes.map((route) => (
            <div
              key={route.id}
              id={`route-card-${route.id}`}
              className="card hover:border-primary/40 transition-colors duration-200 cursor-pointer"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapIcon className="w-5 h-5 text-primary" />
                </div>
                <span className={statusBadge(route.status)}>{route.status}</span>
              </div>

              {/* Route identifiers */}
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-medium text-slate-500">{route.id}</p>
                <span className="text-xs text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded">
                  {route.number}
                </span>
              </div>
              <h3 className="text-slate-100 font-semibold text-sm mb-1">{route.name}</h3>

              {/* Type + direction tags */}
              <div className="flex gap-1 flex-wrap mb-3">
                <span className="text-xs px-2 py-0.5 rounded bg-surface-light text-slate-400">{route.type}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-light text-slate-400">{route.direction}</span>
              </div>

              {/* Stop summary */}
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                {route.startStop}
                {route.intermediateStops.length > 0 && ` → ${route.intermediateStops.join(' → ')}`}
                {' → '}{route.endStop}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-4 border-t border-surface-border pt-3">
                <div>
                  <p className="text-slate-400 text-xs">Buses</p>
                  <p className="text-slate-100 font-semibold text-sm">{route.buses}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Stops</p>
                  {/* Count: start + intermediate + end */}
                  <p className="text-slate-100 font-semibold text-sm">
                    {route.intermediateStops.length + 2}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="card text-center py-14">
          <MapIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No routes match your search or filters.</p>
          <button
            type="button"
            className="btn-ghost mt-4 mx-auto text-xs"
            onClick={() => { setSearch(''); setFilters({ status: '', direction: '', type: '' }); }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── Add Route Modal ──────────────────────────────────── */}
      {showAddModal && (
        <AddRouteModal
          onClose={() => setShowAddModal(false)}
          onSave={addRoute}
          availableStopNames={availableStopNames}
        />
      )}
    </div>
  );
}
