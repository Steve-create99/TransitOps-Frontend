// ============================================================
// Maps/index.jsx — KNUST campus map (MapLibre + ORS routing)
// ============================================================

import { useMemo, useState, useCallback } from 'react';
import {
  ArrowPathIcon,
  BellIcon,
  ClockIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTransit } from '../../context/TransitContext';
import CampusMap from '../../components/map/CampusMap';
import RouteLayer from '../../components/map/RouteLayer';
import { StopMarker, VehicleMarker } from '../../components/map/MapMarkers';
import { ROUTE_PALETTE, isOrsConfigured } from '../../lib/mapConfig';
import { getRoute, lineStringFromCoords } from '../../lib/routing';

function stopColor(stop, routes) {
  const count = stop.routes?.length || 0;
  if (count === 1) {
    const routeObj = routes.find((r) => r.number === stop.routes[0]);
    if (routeObj) return routeObj.color;
  }
  return '#1D9E75';
}

function routeStopCoords(route, stops) {
  return [route.startStop, ...(route.intermediateStops || []), route.endStop]
    .map((name) => {
      const s = stops.find((x) => x.name === name);
      return s && Number.isFinite(s.lng) && Number.isFinite(s.lat)
        ? [Number(s.lng), Number(s.lat)]
        : null;
    })
    .filter(Boolean);
}

export default function Maps() {
  const {
    routes,
    stops,
    logs,
    clearLogs,
    restoreLogs,
    vehicleLocations,
  } = useTransit();

  const [routeFilter, setRouteFilter] = useState('All Routes');
  const [showStops, setShowStops] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [planFrom, setPlanFrom] = useState('');
  const [planTo, setPlanTo] = useState('');
  const [plannedRoute, setPlannedRoute] = useState(null);
  const [planMeta, setPlanMeta] = useState(null);
  const [planError, setPlanError] = useState('');
  const [planLoading, setPlanLoading] = useState(false);

  const overlayRoutes = useMemo(() => {
    if (!showRoutes) return [];
    return routes
      .map((route, idx) => {
        const selected = routeFilter === 'All Routes' || routeFilter === route.number;
        const coords = routeStopCoords(route, stops);
        if (coords.length < 2) return null;
        return {
          id: String(route.id ?? route.number),
          color: route.color || ROUTE_PALETTE[idx % ROUTE_PALETTE.length],
          opacity: selected ? 0.92 : 0.22,
          width: selected ? 5 : 2.5,
          data: lineStringFromCoords(coords, { routeNumber: route.number }),
          number: route.number,
          name: route.name,
        };
      })
      .filter(Boolean);
  }, [routes, stops, showRoutes, routeFilter]);

  const visibleStops = useMemo(() => {
    if (!showStops) return [];
    return stops.filter((stop) => {
      if (routeFilter === 'All Routes') return true;
      return (stop.routes || []).includes(routeFilter);
    });
  }, [stops, showStops, routeFilter]);

  const showLegend = overlayRoutes.length > 2;

  const handlePlanRoute = useCallback(async () => {
    setPlanError('');
    setPlannedRoute(null);
    setPlanMeta(null);

    if (!isOrsConfigured()) {
      setPlanError('Routing temporarily unavailable — set VITE_ORS_API_KEY');
      return;
    }

    const from = stops.find((s) => String(s.id) === String(planFrom) || s.name === planFrom);
    const to = stops.find((s) => String(s.id) === String(planTo) || s.name === planTo);
    if (!from || !to) {
      setPlanError('Select a start and end stop from backend data');
      return;
    }
    if (from.id === to.id) {
      setPlanError('Choose two different stops');
      return;
    }

    setPlanLoading(true);
    try {
      const result = await getRoute(
        [Number(from.lng), Number(from.lat)],
        [Number(to.lng), Number(to.lat)],
        'driving-car'
      );
      setPlannedRoute(result.geojson);
      setPlanMeta({
        from: from.name,
        to: to.name,
        distanceKm: (result.distanceM / 1000).toFixed(2),
        durationMin: Math.max(1, Math.round(result.durationS / 60)),
      });
    } catch (err) {
      setPlanError(err.message || 'Routing failed');
    } finally {
      setPlanLoading(false);
    }
  }, [planFrom, planTo, stops]);

  const handleClearOrRestoreLogs = () => {
    if (logs.length === 0) {
      restoreLogs();
    } else {
      setClearing(true);
      setTimeout(() => {
        clearLogs();
        setClearing(false);
      }, 200);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-112px)] overflow-hidden">
      <div className="flex-1 flex gap-4 min-h-0 relative">
        <div className="flex-1 card p-0 relative overflow-hidden bg-[#08131F] border-surface-border select-none">
          <CampusMap className="w-full h-full absolute inset-0">
            {overlayRoutes.map((r) => (
              <RouteLayer
                key={r.id}
                id={r.id}
                data={r.data}
                color={r.color}
                width={r.width}
                opacity={r.opacity}
              />
            ))}
            {plannedRoute ? (
              <RouteLayer
                id="ors-planned"
                data={plannedRoute}
                color="#F472B6"
                width={6}
                opacity={1}
              />
            ) : null}
            {visibleStops.map((stop) => (
              <StopMarker
                key={stop.id}
                stop={stop}
                color={stopColor(stop, routes)}
                opacity={
                  routeFilter === 'All Routes' || (stop.routes || []).includes(routeFilter)
                    ? 1
                    : 0.25
                }
                showLabel={showLabels}
              />
            ))}
            {(vehicleLocations || []).map((v) => (
              <VehicleMarker key={v.vehicleId || v.id || v.registrationNumber} vehicle={v} />
            ))}
          </CampusMap>

          {/* Filters */}
          <div className="absolute top-4 left-4 z-20 bg-white text-slate-800 p-4 rounded-xl shadow-2xl border border-slate-200 w-72 max-h-[calc(100%-2rem)] overflow-y-auto">
            <h4 className="font-bold text-sm mb-3 text-slate-900 flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-primary" aria-hidden />
              Map controls
            </h4>

            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5" htmlFor="map-route-filter">
                Route focus
              </label>
              <select
                id="map-route-filter"
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All Routes">All Routes</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.number}>
                    {r.number} — {r.name.split(' – ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3 mb-4">
              <label className="flex items-center gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                <input type="checkbox" checked={showStops} onChange={(e) => setShowStops(e.target.checked)} className="rounded text-primary accent-primary" />
                Show stops
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                <input type="checkbox" checked={showRoutes} onChange={(e) => setShowRoutes(e.target.checked)} className="rounded text-primary accent-primary" />
                Show routes
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} className="rounded text-primary accent-primary" />
                Show stop labels
              </label>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Plan route (ORS)</p>
              <select
                value={planFrom}
                onChange={(e) => setPlanFrom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700"
                aria-label="Start stop"
              >
                <option value="">Start stop</option>
                {stops.map((s) => (
                  <option key={`from-${s.id}`} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={planTo}
                onChange={(e) => setPlanTo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700"
                aria-label="End stop"
              >
                <option value="">End stop</option>
                {stops.map((s) => (
                  <option key={`to-${s.id}`} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn-primary w-full text-xs py-2"
                disabled={planLoading}
                onClick={handlePlanRoute}
              >
                {planLoading ? 'Calculating…' : 'Get campus route'}
              </button>
              {planMeta ? (
                <p className="text-[11px] text-slate-600">
                  {planMeta.from} → {planMeta.to}: {planMeta.distanceKm} km · ~{planMeta.durationMin} min
                </p>
              ) : null}
              {planError ? (
                <p className="text-[11px] text-status-critical font-medium" role="alert">{planError}</p>
              ) : null}
              {!isOrsConfigured() ? (
                <p className="text-[10px] text-slate-500">Add VITE_ORS_API_KEY to enable turn-by-turn campus routing.</p>
              ) : null}
            </div>
          </div>

          {showLegend ? (
            <div className="absolute bottom-4 right-4 z-20 bg-slate-900/95 border border-surface-border p-3.5 rounded-xl shadow-2xl max-w-xs text-xs">
              <p className="font-semibold text-slate-200 mb-2.5 uppercase tracking-widest text-[9px]">Routes legend</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {overlayRoutes.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <span className="w-3.5 h-1 rounded" style={{ backgroundColor: r.color }} />
                    <span className="text-slate-300 font-medium truncate">{r.number} · {r.name}</span>
                  </div>
                ))}
                {plannedRoute ? (
                  <div className="flex items-center gap-2 pt-1 border-t border-surface-border">
                    <span className="w-3.5 h-1 rounded bg-pink-400" />
                    <span className="text-slate-300 font-medium">ORS planned path</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card py-4 flex flex-col justify-between h-48 shrink-0">
        <div className="flex items-center justify-between border-b border-surface-border/50 pb-2 mb-3">
          <span className="text-slate-200 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <BellIcon className="w-4 h-4 text-status-delayed" aria-hidden />
            Live dispatch activity log
          </span>
          <button
            type="button"
            id="map-clear-log"
            className="text-[10px] text-primary hover:text-primary/80 font-bold cursor-pointer transition-colors"
            onClick={handleClearOrRestoreLogs}
          >
            {logs.length === 0 ? 'Restore Log' : 'Clear Log'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className={clsx(
                  'flex items-center justify-between p-2.5 rounded-lg bg-surface-light/40 border border-surface-border/50 text-xs text-slate-300 transform transition-all duration-200',
                  clearing ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-semibold font-mono">[{log.time}]</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={{
                      color: routes.find((r) => r.number === log.route)?.color || '#1D9E75',
                      backgroundColor: `${routes.find((r) => r.number === log.route)?.color || '#1D9E75'}15`,
                    }}
                  >
                    Route {log.route}
                  </span>
                  <span className="font-semibold text-slate-200">{log.stop}</span>
                </div>
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded-full text-[10px] font-medium border',
                    log.event.includes('Delayed') && 'bg-status-delayed/10 text-status-delayed border-status-delayed/20',
                    log.event.includes('Overcrowded') && 'bg-status-critical/10 text-status-critical border-status-critical/20',
                    log.event === 'Arrived' && 'bg-primary/10 text-primary border-primary/20',
                    log.event === 'Departed' && 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    log.event === 'On time' && 'bg-primary/10 text-primary border-primary/20'
                  )}
                >
                  {log.event}
                </span>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <ClockIcon className="w-8 h-8 text-slate-600 mb-1.5" aria-hidden />
              <p className="text-slate-400 text-xs font-semibold">No activity logged yet</p>
              <button type="button" className="btn-ghost py-1 px-3 mt-2 text-[10px] font-bold" onClick={restoreLogs}>
                <ArrowPathIcon className="w-3 h-3 inline mr-1" aria-hidden />
                Restore original logs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
