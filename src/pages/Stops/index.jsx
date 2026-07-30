// ============================================================
// Stops/index.jsx — KNUST Campus Stop Management
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState, useMemo } from 'react';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTransit } from '../../context/TransitContext';

export default function Stops() {
  const { stops, routes } = useTransit(); // live derived stops
  const [search, setSearch] = useState('');
  const [hoveredStopName, setHoveredStopName] = useState(null);

  // Search filter (filters by stop name OR route number)
  const filteredStops = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stops;
    return stops.filter((stop) => {
      const matchName = stop.name.toLowerCase().includes(q);
      const matchRoute = stop.routes.some((rNum) => rNum.toLowerCase().includes(q));
      return matchName || matchRoute;
    });
  }, [stops, search]);

  // Project lat/lng coordinate onto SVG percentage coordinates
  // Lat bounds: 6.6690 to 6.6780, Lng bounds: -1.5770 to -1.5630
  const projectCoordinate = (lat, lng) => {
    const minLat = 6.6690, maxLat = 6.6780;
    const minLng = -1.5770, maxLng = -1.5630;
    
    // Calculate percentage values
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
    
    return { x: `${x}%`, y: `${y}%` };
  };

  const activeCount = filteredStops.filter((s) => s.active).length;

  return (
    <div className="space-y-6">
      
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="section-title">Stops</h2>
          <p className="section-subtitle">
            {stops.length} campus stop points derived · {activeCount} active in current routing
          </p>
        </div>
        
        <div className="flex items-center gap-3 text-xs">
          <span className="badge-active">Active Stops: {stops.filter(s => s.active).length}</span>
          <span className="badge-delayed">Inactive Stops: {stops.filter(s => !s.active).length}</span>
        </div>
      </div>

      {/* ── Search Bar ────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          id="stops-search"
          type="search"
          placeholder="Search stops by name or route number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* ── Grid Layout: Cards List & Interactive Map ──────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Stop Cards list */}
        <div className="xl:col-span-2 space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredStops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStops.map((stop) => (
                <div
                  key={stop.id}
                  className={clsx(
                    "card p-4 flex flex-col justify-between hover:border-primary/40 cursor-pointer transition-all duration-200",
                    hoveredStopName === stop.name ? "border-primary ring-1 ring-primary/20 bg-surface-light" : "border-surface-border"
                  )}
                  onMouseEnter={() => setHoveredStopName(stop.name)}
                  onMouseLeave={() => setHoveredStopName(null)}
                >
                  {/* Stop Name and Status */}
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4.5 h-4.5 text-primary shrink-0" />
                      <h4 className="text-slate-100 font-bold text-sm leading-snug">{stop.name}</h4>
                    </div>
                    <span className={stop.active ? 'badge-active' : 'badge-delayed'}>
                      {stop.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 font-semibold mb-3">ZONE: {stop.zone} · ID: {stop.id}</p>

                  {/* Route Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-surface-border/50">
                    {stop.routes.map((routeNum) => {
                      const rObj = routes.find((r) => r.number === routeNum);
                      const color = rObj ? rObj.color : '#1D9E75';
                      return (
                        <span
                          key={routeNum}
                          className="text-[9px] font-bold px-2 py-0.5 rounded border"
                          style={{
                            color: color,
                            backgroundColor: `${color}10`,
                            borderColor: `${color}30`
                          }}
                        >
                          {routeNum}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="card text-center py-14">
              <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">location_off</span>
              <p className="text-slate-300 font-semibold text-sm">No stops match your search</p>
              <button
                type="button"
                className="btn-ghost mt-4 mx-auto text-xs font-bold"
                onClick={() => setSearch('')}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Interactive SVG Schematic Map */}
        <div className="card p-0 h-[480px] xl:h-full relative overflow-hidden bg-[#070f1a] border-surface-border flex flex-col">
          <div className="absolute top-4 left-4 z-20">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-surface-border uppercase tracking-widest">
              KNUST Schematic Layout
            </span>
          </div>

          {/* SVG Map Area */}
          <svg className="w-full h-full p-6" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
            
            {/* Draw route lines */}
            {routes.map((route) => {
              const stopCoords = [route.startStop, ...route.intermediateStops, route.endStop]
                .map((stopName) => {
                  const s = stops.find((x) => x.name === stopName);
                  return s ? projectCoordinate(s.lat, s.lng) : null;
                })
                .filter(Boolean);

              // Map coords into SVG points format
              const pointsStr = stopCoords.map((pt) => `${pt.x},${pt.y}`).join(' ');
              const isRouteActive = hoveredStopName
                ? route.intermediateStops.includes(hoveredStopName) || route.startStop === hoveredStopName || route.endStop === hoveredStopName
                : true;

              return (
                <polyline
                  key={route.id}
                  points={pointsStr}
                  fill="none"
                  stroke={route.color}
                  strokeWidth={hoveredStopName && isRouteActive ? 3 : 1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isRouteActive ? 0.6 : 0.15}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Draw Stop Node Pins */}
            {stops.map((stop) => {
              const { x, y } = projectCoordinate(stop.lat, stop.lng);
              const isHovered = hoveredStopName === stop.name;
              
              // Decide badge color
              const routesCount = stop.routes.length;
              let color = '#1D9E75';
              if (routesCount === 1) {
                const rObj = routes.find((r) => r.number === stop.routes[0]);
                if (rObj) color = rObj.color;
              }

              return (
                <g
                  key={stop.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredStopName(stop.name)}
                  onMouseLeave={() => setHoveredStopName(null)}
                >
                  {/* Outer pulsing ring on hover */}
                  {isHovered && (
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      className="animate-ping"
                      opacity="0.45"
                    />
                  )}
                  {/* Outer solid glow ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 8 : 5}
                    fill={isHovered ? `${color}25` : '#070f1a'}
                    stroke={color}
                    strokeWidth={isHovered ? 2.5 : 1.75}
                    className="transition-all duration-200"
                  />
                  {/* Core marker dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r="2.5"
                    fill={color}
                  />

                  {/* Pin label (visible on hover) */}
                  {isHovered && (
                    <g transform={`translate(0, -12)`}>
                      <rect
                        x="-50"
                        y="-16"
                        width="100"
                        height="18"
                        rx="4"
                        fill="#0F1E35"
                        stroke={color}
                        strokeWidth="1"
                        className="shadow-xl"
                      />
                      <text
                        x="0"
                        y="-4"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        {stop.name.length > 18 ? `${stop.name.slice(0, 16)}..` : stop.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

      </div>

      <p className="text-xs text-slate-600 text-center">
        Stops and schematic map dynamically sync with the active route network.
      </p>
    </div>
  );
}
