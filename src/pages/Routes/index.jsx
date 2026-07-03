// ============================================================
// Routes/index.jsx — Route management page
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { MapIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

// ── Mock route data ──────────────────────────────────────────
const mockRoutes = [
  { id: 'RT-01', name: 'Central — Airport',        buses: 12, stops: 24, status: 'Active',   badge: 'badge-active'   },
  { id: 'RT-07', name: 'North — City Loop',          buses: 8,  stops: 18, status: 'Delayed',  badge: 'badge-delayed'  },
  { id: 'RT-14', name: 'East — Harbor Bridge',       buses: 10, stops: 20, status: 'Active',   badge: 'badge-active'   },
  { id: 'RT-22', name: 'South — University',         buses: 6,  stops: 15, status: 'Critical', badge: 'badge-critical' },
  { id: 'RT-30', name: 'West — Industrial Zone',     buses: 9,  stops: 22, status: 'Active',   badge: 'badge-active'   },
  { id: 'RT-38', name: 'Downtown — Riverfront',      buses: 5,  stops: 12, status: 'Active',   badge: 'badge-active'   },
];

/**
 * RoutesPage — lists all transit routes in a card grid.
 * Each card shows route ID, name, bus count, stop count, and status.
 */
export default function RoutesPage() {
  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="section-title">Routes</h2>
          <p className="section-subtitle">Manage and monitor all transit routes</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost" id="routes-filter">
            <FunnelIcon className="w-4 h-4" />
            Filter
          </button>
          <button type="button" className="btn-primary" id="routes-add">
            <PlusIcon className="w-4 h-4" />
            Add Route
          </button>
        </div>
      </div>

      {/* ── Routes Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockRoutes.map((route) => (
          <div key={route.id} id={`route-card-${route.id}`} className="card hover:border-primary/40 transition-colors duration-200 cursor-pointer">
            {/* Card header */}
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapIcon className="w-5 h-5 text-primary" />
              </div>
              <span className={route.badge}>{route.status}</span>
            </div>

            {/* Route info */}
            <p className="text-xs font-medium text-slate-500 mb-1">{route.id}</p>
            <h3 className="text-slate-100 font-semibold text-sm mb-3">{route.name}</h3>

            {/* Stats row */}
            <div className="flex items-center gap-4 border-t border-surface-border pt-3">
              <div>
                <p className="text-slate-400 text-xs">Buses</p>
                <p className="text-slate-100 font-semibold text-sm">{route.buses}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Stops</p>
                <p className="text-slate-100 font-semibold text-sm">{route.stops}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
