// ============================================================
// Stops/index.jsx — Bus stop management page
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================
// Stops are DERIVED from route data in TransitContext, so any
// change to routes is instantly reflected here — no manual sync needed.

import { useState } from 'react';
import { StopCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTransit } from '../../context/TransitContext';

// ── Zone badge colour helper ─────────────────────────────────
function zoneBadgeClass(zone) {
  const map = {
    Academic:    'bg-blue-900/30 text-blue-300',
    Residential: 'bg-purple-900/30 text-purple-300',
    Gateway:     'bg-amber-900/30 text-amber-300',
    General:     'bg-slate-700/50 text-slate-400',
  };
  return map[zone] ?? map.General;
}

/**
 * Stops — real-time view of every stop across all campus routes.
 * Data is always derived from the central TransitContext so it
 * stays in sync whenever routes are added or changed.
 */
export default function Stops() {
  const { stops } = useTransit(); // live, derived from routes

  const [search, setSearch] = useState('');

  // Real-time filter by stop name (case-insensitive)
  const filtered = stops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = stops.filter((s) => s.active).length;
  const inactiveCount = stops.length - activeCount;

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="section-title">Stops</h2>
          <p className="section-subtitle">
            {stops.length} stops across all routes · {activeCount} active · {inactiveCount} inactive
          </p>
        </div>

        {/* Summary chips */}
        <div className="flex items-center gap-2 text-xs">
          <span className="badge-active">Active: {activeCount}</span>
          <span className="badge-delayed">Inactive: {inactiveCount}</span>
        </div>
      </div>

      {/* ── Search Bar ────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          id="stops-search"
          type="search"
          placeholder="Search stops…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* ── Stops Table ───────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">Stop</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">ID</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide hidden md:table-cell">Zone</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Routes</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((stop) => (
                <tr
                  key={stop.id}
                  className="border-b border-surface-border last:border-0 hover:bg-surface-light/50 transition-colors"
                >
                  {/* Stop name */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <StopCircleIcon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-slate-200 font-medium">{stop.name}</span>
                    </div>
                  </td>

                  {/* ID */}
                  <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{stop.id}</td>

                  {/* Zone */}
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${zoneBadgeClass(stop.zone)}`}>
                      {stop.zone}
                    </span>
                  </td>

                  {/* Route count */}
                  <td className="px-5 py-3 text-slate-300 hidden lg:table-cell">{stop.routes}</td>

                  {/* Status */}
                  <td className="px-5 py-3">
                    <span className={stop.active ? 'badge-active' : 'badge-delayed'}>
                      {stop.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                  No stops match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Sync note ─────────────────────────────────────── */}
      <p className="text-xs text-slate-600 text-center">
        Stops automatically reflect changes made to routes.
      </p>
    </div>
  );
}
