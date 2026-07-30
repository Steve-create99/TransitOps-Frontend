// ============================================================
// Routes/index.jsx — KNUST Shuttle Route Management
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState, useMemo } from 'react';
import {
  MapIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTransit } from '../../context/TransitContext';

const SWATCH_COLORS = [
  '#1D9E75', // teal
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#EF4444', // red
];

export default function RoutesPage() {
  const { routes, addRoute, deleteRoute, availableStopNames } = useTransit();

  // Search
  const [search, setSearch] = useState('');

  // Add Route form inline card toggle & form fields
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    number: '',
    name: '',
    startStop: '',
    endStop: '',
    frequency: '',
    color: SWATCH_COLORS[0],
    status: 'Active',
  });

  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterFreq, setFilterFreq] = useState('Any');
  const [sortBy, setSortBy] = useState('Route Number');

  // Applied filters (actual filter logic inputs)
  const [appliedStatus, setAppliedStatus] = useState('All');
  const [appliedFreq, setAppliedFreq] = useState('Any');
  const [appliedSortBy, setAppliedSortBy] = useState('Route Number');

  const handleApplyFilters = () => {
    setAppliedStatus(filterStatus);
    setAppliedFreq(filterFreq);
    setAppliedSortBy(sortBy);
    setShowFilter(false);
  };

  const handleResetFilters = () => {
    setFilterStatus('All');
    setFilterFreq('Any');
    setSortBy('Route Number');
    setAppliedStatus('All');
    setAppliedFreq('Any');
    setAppliedSortBy('Route Number');
    setShowFilter(false);
  };

  const isFilterActive = appliedStatus !== 'All' || appliedFreq !== 'Any' || appliedSortBy !== 'Route Number';

  // Filtered & Sorted routes list
  const displayedRoutes = useMemo(() => {
    let result = routes.filter((r) => {
      // 1. Search term (onInput matches real-time)
      const q = search.toLowerCase();
      const matchesSearch = r.name.toLowerCase().includes(q) || r.number.toLowerCase().includes(q);

      // 2. Status
      const matchesStatus = appliedStatus === 'All' || r.status === appliedStatus;

      // 3. Frequency
      let matchesFreq = true;
      const freqNum = Number(r.frequency);
      if (appliedFreq === 'Under 10 min') {
        matchesFreq = freqNum < 10;
      } else if (appliedFreq === '10–20 min') {
        matchesFreq = freqNum >= 10 && freqNum <= 20;
      } else if (appliedFreq === '20+ min') {
        matchesFreq = freqNum > 20;
      }

      return matchesSearch && matchesStatus && matchesFreq;
    });

    // 4. Sort By
    if (appliedSortBy === 'Route Number') {
      result = [...result].sort((a, b) => a.number.localeCompare(b.number));
    } else if (appliedSortBy === 'Name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (appliedSortBy === 'Stop Count') {
      result = [...result].sort((a, b) => {
        const aCount = (a.intermediateStops?.length || 0) + 2;
        const bCount = (b.intermediateStops?.length || 0) + 2;
        return bCount - aCount; // descending
      });
    } else if (appliedSortBy === 'Frequency') {
      result = [...result].sort((a, b) => Number(a.frequency) - Number(b.frequency));
    }

    return result;
  }, [routes, search, appliedStatus, appliedFreq, appliedSortBy]);

  const handleSaveRoute = () => {
    if (!form.number || !form.name || !form.startStop || !form.endStop || !form.frequency) {
      return;
    }
    
    // Convert form into the structure expected by TransitContext
    const newRoute = {
      number: form.number,
      name: form.name,
      startStop: form.startStop,
      endStop: form.endStop,
      intermediateStops: [], // simple initial blank intermediate stops list
      frequency: Number(form.frequency),
      color: form.color,
      status: form.status,
      buses: form.status === 'Active' ? Math.floor(Math.random() * 4) + 2 : 0,
      type: 'Regular',
      direction: 'Northbound',
    };

    addRoute(newRoute);
    setIsAddOpen(false);

    // Reset form
    setForm({
      number: '',
      name: '',
      startStop: '',
      endStop: '',
      frequency: '',
      color: SWATCH_COLORS[0],
      status: 'Active',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="section-title">Routes</h2>
          <p className="section-subtitle">
            KNUST campus shuttle network · {displayedRoutes.length} route{displayedRoutes.length !== 1 ? 's' : ''} listed
          </p>
        </div>
        
        {/* Replace FAB with "+ Add Route" button in top-right */}
        <button
          type="button"
          id="routes-add-btn"
          className="btn-primary flex items-center gap-2 cursor-pointer"
          onClick={() => setIsAddOpen((prev) => !prev)}
        >
          <PlusIcon className="w-4 h-4" />
          Add Route
        </button>
      </div>

      {/* ── INLINE ADD ROUTE CARD (Slides down with transition) ── */}
      <div
        className={clsx(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isAddOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="card border border-primary/20 bg-surface-light p-5 mb-6">
          <h3 className="text-slate-100 font-bold text-sm mb-4">Add New Route</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            
            {/* Route Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Route Number</label>
              <input
                type="text"
                placeholder="e.g. K-07"
                value={form.number}
                onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))}
                className="input bg-surface"
              />
            </div>

            {/* Route Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Route Name</label>
              <input
                type="text"
                placeholder="e.g. Sports Complex Loop"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="input bg-surface"
              />
            </div>

            {/* Start Stop Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Start Stop</label>
              <select
                value={form.startStop}
                onChange={(e) => setForm((prev) => ({ ...prev, startStop: e.target.value }))}
                className="input bg-surface"
              >
                <option value="">Select KNUST stop...</option>
                {availableStopNames.map((stop) => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>

            {/* End Stop Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">End Stop</label>
              <select
                value={form.endStop}
                onChange={(e) => setForm((prev) => ({ ...prev, endStop: e.target.value }))}
                className="input bg-surface"
              >
                <option value="">Select KNUST stop...</option>
                {availableStopNames.map((stop) => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Frequency</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={form.frequency}
                  onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value }))}
                  className="input bg-surface pr-16"
                />
                <span className="absolute right-4 text-xs font-medium text-slate-500">minutes</span>
              </div>
            </div>

            {/* Status toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Status</label>
              <div className="flex items-center gap-3 h-[42px]">
                <span className={clsx("text-xs font-semibold", form.status === 'Active' ? 'text-primary' : 'text-slate-400')}>
                  {form.status}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.status === 'Active'}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.checked ? 'Active' : 'Inactive' }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            {/* Route Color swatches */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-2">Route Color</label>
              <div className="flex gap-3">
                {SWATCH_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    style={{ backgroundColor: c }}
                    className={clsx(
                      "w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center border",
                      form.color === c ? "scale-110 border-white ring-2 ring-primary/45" : "border-transparent opacity-80 hover:opacity-100"
                    )}
                    onClick={() => setForm((prev) => ({ ...prev, color: c }))}
                  >
                    {form.color === c && (
                      <span className="text-[10px] text-white font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="flex gap-3 border-t border-surface-border pt-4 mt-4">
            <button
              type="button"
              className="btn-ghost flex-1 py-2 justify-center text-xs font-bold"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary flex-1 py-2 justify-center text-xs font-bold bg-primary hover:bg-primary/95 text-white"
              onClick={handleSaveRoute}
            >
              Save Route
            </button>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────── */}
      <div className="flex items-center gap-3 relative z-30">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            id="routes-search"
            type="search"
            placeholder="Search by name or number…"
            value={search}
            onInput={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>

        {/* Filter Trigger Button */}
        <div className="relative">
          <button
            type="button"
            id="routes-filter-btn"
            className={clsx(
              "btn-ghost flex items-center gap-1.5 cursor-pointer relative",
              isFilterActive && "border-primary text-primary"
            )}
            onClick={() => setShowFilter((prev) => !prev)}
          >
            <FunnelIcon className="w-4 h-4" />
            Filter
            
            {/* Teal dot badge when any filter is active */}
            {isFilterActive && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>

          {/* Filter dropdown panel */}
          {showFilter && (
            <div className="absolute right-0 top-full mt-2 w-64 card shadow-2xl border border-surface-border bg-slate-900 p-4 z-[999]">
              <p className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-3.5">Filter Options</p>
              
              {/* Status radios */}
              <div className="mb-3.5">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Status</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['All', 'Active', 'Delayed', 'Inactive'].map((s) => (
                    <label key={s} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="filter-status-radio"
                        checked={filterStatus === s}
                        onChange={() => setFilterStatus(s)}
                        className="accent-primary"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              {/* Frequency selection */}
              <div className="mb-3.5">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Frequency</label>
                <select
                  value={filterFreq}
                  onChange={(e) => setFilterFreq(e.target.value)}
                  className="w-full bg-surface border border-surface-border text-xs rounded p-1.5 text-slate-300 focus:outline-none"
                >
                  <option value="Any">Any</option>
                  <option value="Under 10 min">Under 10 min</option>
                  <option value="10–20 min">10–20 min</option>
                  <option value="20+ min">20+ min</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="mb-4">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-surface border border-surface-border text-xs rounded p-1.5 text-slate-300 focus:outline-none"
                >
                  <option value="Route Number">Route Number</option>
                  <option value="Name">Name</option>
                  <option value="Stop Count">Stop Count</option>
                  <option value="Frequency">Frequency</option>
                </select>
              </div>

              {/* Actions row */}
              <div className="flex gap-2.5 border-t border-surface-border/50 pt-3">
                <button
                  type="button"
                  className="btn-ghost flex-1 py-1.5 text-xs font-semibold justify-center cursor-pointer"
                  onClick={handleResetFilters}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn-primary flex-1 py-1.5 text-xs font-semibold justify-center cursor-pointer bg-primary text-white border-none"
                  onClick={handleApplyFilters}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Routes Grid ─────────────────────────────────────── */}
      {displayedRoutes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedRoutes.map((route) => (
            <div
              key={route.id}
              className="card hover:border-primary/40 transition-all duration-200 cursor-pointer flex flex-col group relative"
            >
              {/* Delete Route button (allows testing Stop deletion) */}
              <button
                type="button"
                className="absolute top-4 right-4 text-slate-500 hover:text-status-critical p-1 rounded hover:bg-surface-light opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRoute(route.id);
                }}
                title="Delete Route"
              >
                <TrashIcon className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-start justify-between mb-3.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${route.color}15` }}
                >
                  <MapIcon className="w-4.5 h-4.5" style={{ color: route.color }} />
                </div>
                <span
                  className={clsx(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                    route.status === 'Active' && 'bg-status-active/10 text-primary border-primary/20',
                    route.status === 'Delayed' && 'bg-status-delayed/10 text-status-delayed border-status-delayed/20',
                    route.status === 'Inactive' && 'bg-status-critical/10 text-status-critical border-status-critical/20'
                  )}
                >
                  {route.status}
                </span>
              </div>

              {/* Title & Number */}
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${route.color}15`, color: route.color }}
                >
                  {route.number}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">{route.id}</span>
              </div>
              <h3 className="text-slate-100 font-bold text-sm mb-2">{route.name}</h3>

              {/* Stop Chain Summary */}
              <p className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-3">
                {route.startStop}
                {route.intermediateStops && route.intermediateStops.length > 0 && ` → ${route.intermediateStops.join(' → ')}`}
                {' → '}{route.endStop}
              </p>

              {/* Bottom statistics */}
              <div className="flex items-center gap-5 border-t border-surface-border/50 pt-3 mt-auto">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wide">Frequency</p>
                  <p className="text-slate-200 font-semibold text-sm">{route.frequency} min</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wide">Stop Count</p>
                  <p className="text-slate-200 font-semibold text-sm">
                    {((route.intermediateStops?.length || 0) + 2)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wide">Assigned Buses</p>
                  <p className="text-slate-200 font-semibold text-sm">{route.buses}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="card text-center py-14">
          <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">map</span>
          <p className="text-slate-300 font-semibold text-sm">No routes match your search</p>
          <p className="text-slate-500 text-xs mt-1">Try resetting the filters or clearing the search terms.</p>
          <button
            type="button"
            className="btn-ghost mt-4 mx-auto text-xs font-bold"
            onClick={handleResetFilters}
          >
            Clear Filters & Search
          </button>
        </div>
      )}
    </div>
  );
}
