// ============================================================
// Stops/index.jsx — Bus stop management page
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { StopCircleIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

// ── Mock stop data ───────────────────────────────────────────
const mockStops = [
  { id: 'STP-001', name: 'Central Terminal',     routes: 8,  zone: 'A', active: true  },
  { id: 'STP-002', name: 'Airport Terminal T1',  routes: 3,  zone: 'C', active: true  },
  { id: 'STP-003', name: 'North Station',         routes: 5,  zone: 'B', active: true  },
  { id: 'STP-004', name: 'University Gate',       routes: 4,  zone: 'B', active: false },
  { id: 'STP-005', name: 'Harbor Wharf',          routes: 2,  zone: 'D', active: true  },
  { id: 'STP-006', name: 'City Hall Square',      routes: 7,  zone: 'A', active: true  },
  { id: 'STP-007', name: 'West Market',           routes: 3,  zone: 'C', active: true  },
  { id: 'STP-008', name: 'East Industrial Park',  routes: 2,  zone: 'D', active: false },
];

/**
 * Stops — filterable list of all bus stops.
 * Search filters by stop name in real-time.
 */
export default function Stops() {
  const [search, setSearch] = useState('');

  // Filter stops by search query (case-insensitive)
  const filtered = mockStops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="section-title">Stops</h2>
          <p className="section-subtitle">{mockStops.length} registered stops across all zones</p>
        </div>
        <button type="button" className="btn-primary" id="stops-add">
          <PlusIcon className="w-4 h-4" />
          Add Stop
        </button>
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
                <tr key={stop.id} className="border-b border-surface-border last:border-0 hover:bg-surface-light/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <StopCircleIcon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-slate-200 font-medium">{stop.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{stop.id}</td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded bg-surface-light text-slate-400 text-xs">Zone {stop.zone}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-300 hidden lg:table-cell">{stop.routes}</td>
                  <td className="px-5 py-3">
                    <span className={stop.active ? 'badge-active' : 'badge-delayed'}>
                      {stop.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-500">No stops match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
