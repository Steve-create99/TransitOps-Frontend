// ============================================================
// Maps/index.jsx — KNUST Interactive Transit Map Overlay
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState, useEffect, useRef } from 'react';
import {
  ArrowPathIcon,
  PlusIcon,
  MinusIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTransit } from '../../context/TransitContext';

export default function Maps() {
  const {
    routes,
    stops,
    logs,
    clearLogs,
    restoreLogs,
  } = useTransit();

  // Map state
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const routesLayerGroupRef = useRef(null);
  const stopsLayerGroupRef = useRef(null);

  // Floating Control Panel settings
  const [routeFilter, setRouteFilter] = useState('All Routes');
  const [showStops, setShowStops] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Activity log states
  const [clearing, setClearing] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;
    const L = window.L;

    // Create map centered on KNUST
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([6.6745, -1.5716], 15);

    mapRef.current = map;

    // Add clean dark-styled OpenStreetMap tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Create layer groups for routing and stops
    routesLayerGroupRef.current = L.layerGroup().addTo(map);
    stopsLayerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  // Update map overlays on filter or toggle change
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;
    const routesGroup = routesLayerGroupRef.current;
    const stopsGroup = stopsLayerGroupRef.current;

    routesGroup.clearLayers();
    stopsGroup.clearLayers();

    // 1. Draw Routes
    if (showRoutes) {
      routes.forEach((route) => {
        const isSelected = routeFilter === 'All Routes' || routeFilter === route.number;
        const opacity = isSelected ? 0.9 : 0.2;
        const weight = isSelected ? 5.5 : 2;

        const coords = [route.startStop, ...route.intermediateStops, route.endStop]
          .map((stopName) => {
            const stopObj = stops.find((s) => s.name === stopName);
            return stopObj ? [stopObj.lat, stopObj.lng] : null;
          })
          .filter(Boolean);

        if (coords.length > 0) {
          const polyline = L.polyline(coords, {
            color: route.color,
            weight: weight,
            opacity: opacity,
            lineJoin: 'round',
          });
          routesGroup.addLayer(polyline);
        }
      });
    }

    // 2. Draw Stops
    if (showStops) {
      stops.forEach((stop) => {
        const isSelected = routeFilter === 'All Routes' || stop.routes.includes(routeFilter);
        const opacity = isSelected ? 1.0 : 0.2;

        const routesCount = stop.routes.length;
        let color = '#1D9E75'; // multi-route teal

        if (routesCount === 1) {
          const routeObj = routes.find((r) => r.number === stop.routes[0]);
          if (routeObj) color = routeObj.color;
        }

        // Custom divIcon marker matching design guidelines
        const iconHtml = routesCount > 1
          ? `<div style="background-color: #1D9E75; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; color: white; font-size: 10px; font-weight: 800; box-shadow: 0 2px 6px rgba(0,0,0,0.4); opacity: ${opacity};">${routesCount}</div>`
          : `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); opacity: ${opacity};"></div>`;

        const icon = L.divIcon({
          className: 'custom-stop-marker-wrapper',
          html: iconHtml,
          iconSize: routesCount > 1 ? [22, 22] : [16, 16],
          iconAnchor: routesCount > 1 ? [11, 11] : [8, 8],
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: icon });

        // Popup building
        const routeBadges = stop.routes
          .map((routeNum) => {
            const routeObj = routes.find((r) => r.number === routeNum);
            const routeColor = routeObj ? routeObj.color : '#1D9E75';
            return `<span style="background-color: ${routeColor}20; color: ${routeColor}; border: 1px solid ${routeColor}40; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-right: 4px; display: inline-block;">${routeNum}</span>`;
          })
          .join('');

        const statusLabel = stop.active
          ? '<span style="color: #1D9E75; font-weight: bold;">Active ✓</span>'
          : '<span style="color: #D85A30; font-weight: bold;">Inactive ✗</span>';

        const popupHtml = `
          <div style="font-family: 'Inter', sans-serif; min-width: 160px; color: #0F1E35;">
            <p style="font-size: 13px; font-weight: 700; margin: 0 0 6px 0;">${stop.name}</p>
            <div style="margin-bottom: 8px;">${routeBadges}</div>
            <p style="font-size: 11px; margin: 3px 0; color: #475569;">Avg daily riders: <strong>${stop.riders}</strong></p>
            <p style="font-size: 11px; margin: 3px 0; color: #475569;">Status: ${statusLabel}</p>
          </div>
        `;

        marker.bindPopup(popupHtml);

        if (showLabels) {
          marker.bindTooltip(stop.name, {
            permanent: false,
            direction: 'top',
            offset: [0, -10],
          });
        }

        stopsGroup.addLayer(marker);
      });
    }
  }, [routes, stops, routeFilter, showStops, showRoutes, showLabels]);

  // Controls Handlers
  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([6.6745, -1.5716], 15, { animate: true });
    }
    setRouteFilter('All Routes');
  };

  const handleClearOrRestoreLogs = () => {
    if (logs.length === 0) {
      restoreLogs();
    } else {
      setClearing(true);
      setTimeout(() => {
        clearLogs();
        setClearing(false);
      }, 200); // 200ms slide-out animation delay
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-112px)] overflow-hidden">
      
      {/* ── Main Section (Leaflet Map Container + Side Legend) ── */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        
        {/* Left Side: Map frame */}
        <div className="flex-1 card p-0 relative overflow-hidden bg-[#08131F] border-surface-border select-none">
          
          {/* Leaflet instance element */}
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Control Panel (Top Left) */}
          <div className="absolute top-4 left-4 z-[1000] bg-white text-slate-800 p-4 rounded-xl shadow-2xl border border-slate-200 w-64">
            <h4 className="font-bold text-sm mb-3 text-slate-900">Map Filter Control</h4>
            
            {/* Route Filter Dropdown */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Route Focus</label>
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

            {/* Checkbox Layers Toggles */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <label className="flex items-center gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStops}
                  onChange={(e) => setShowStops(e.target.checked)}
                  className="rounded text-primary focus:ring-primary accent-primary"
                />
                Show Stops
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  className="rounded text-primary focus:ring-primary accent-primary"
                />
                Show Routes
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded text-primary focus:ring-primary accent-primary"
                />
                Show Labels
              </label>
            </div>
          </div>

          {/* Floating Map Controls Panel (Top Right) */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 bg-slate-900/90 border border-surface-border p-1.5 rounded-xl shadow-2xl">
            <button
              type="button"
              id="map-reset-view"
              className="p-2 bg-surface hover:bg-surface-light rounded-lg text-slate-200 hover:text-white transition-colors border border-surface-border"
              onClick={handleResetView}
              title="Reset View to Center"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="map-zoom-in"
              className="p-2 bg-surface hover:bg-surface-light rounded-lg text-slate-200 hover:text-white transition-colors border border-surface-border"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="map-zoom-out"
              className="p-2 bg-surface hover:bg-surface-light rounded-lg text-slate-200 hover:text-white transition-colors border border-surface-border"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Map Legend Swatches Card (Bottom Right) */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/95 border border-surface-border p-3.5 rounded-xl shadow-2xl max-w-xs text-xs">
            <p className="font-semibold text-slate-200 mb-2.5 uppercase tracking-widest text-[9px]">Routes Legend</p>
            <div className="space-y-2">
              {routes.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span className="w-3.5 h-1 rounded" style={{ backgroundColor: r.color }} />
                  <span className="text-slate-300 font-medium">{r.number} · {r.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Section: Scrollable Activity Event Log ── */}
      <div className="card py-4 flex flex-col justify-between h-48 shrink-0">
        
        {/* Log header */}
        <div className="flex items-center justify-between border-b border-surface-border/50 pb-2 mb-3">
          <span className="text-slate-200 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <BellIcon className="w-4.5 h-4.5 text-orange-400" />
            Live Dispatch Activity Log
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

        {/* Logs content */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className={clsx(
                  "flex items-center justify-between p-2.5 rounded-lg bg-surface-light/40 border border-surface-border/50 text-xs text-slate-300 transform transition-all duration-200",
                  clearing ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
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
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded-full text-[10px] font-medium border",
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
              </div>
            ))
          ) : (
            /* Empty State Container */
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <span className="material-symbols-outlined text-slate-600 text-3xl mb-1.5">hourglass_empty</span>
              <p className="text-slate-400 text-xs font-semibold">No activity logged yet</p>
              <button
                type="button"
                className="btn-ghost py-1 px-3 mt-2 text-[10px] font-bold"
                onClick={restoreLogs}
              >
                <ArrowPathIcon className="w-3 h-3 inline mr-1" />
                Restore Original Logs
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
