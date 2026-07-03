// ============================================================
// Maps/index.jsx — Premium Live Transit Network dashboard
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  MapPinIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  UsersIcon,
  TruckIcon,
  ClockIcon,
  BoltIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

// ── Design Tokens & Coordinates ─────────────────────────────

// Major Neighborhood Center Points
const STOPS = {
  CIRCLE:    { id: 'STP-CIR', name: 'Circle Interchange', x: 400, y: 300, isIntersection: true, passengers: 142 },
  ADABRAKA:  { id: 'STP-ADA', name: 'Adabraka Station',    x: 430, y: 390, isIntersection: false, passengers: 68 },
  KANESHIE:  { id: 'STP-KAN', name: 'Kaneshie Market',     x: 260, y: 430, isIntersection: true, passengers: 189 },
  LAPAZ:     { id: 'STP-LAP', name: 'Lapaz Station',       x: 220, y: 220, isIntersection: false, passengers: 120 },
  ACHIMOTA:  { id: 'STP-ACH', name: 'Achimota Mall',       x: 340, y: 120, isIntersection: true, passengers: 95 },
  MADINA:    { id: 'STP-MAD', name: 'Madina Terminal',     x: 580, y: 80,  isIntersection: true, passengers: 154 },
  LEGON:     { id: 'STP-LEG', name: 'Legon Junction',      x: 480, y: 180, isIntersection: false, passengers: 74 },
  TEMA_JNC:  { id: 'STP-TMJ', name: 'Tema Highway Jnc',    x: 630, y: 360, isIntersection: false, passengers: 45 },
  TEMA_TERM: { id: 'STP-TET', name: 'Tema Port Terminal',  x: 740, y: 340, isIntersection: true, passengers: 210 },
  DARKUMAN:  { id: 'STP-DKM', name: 'Darkuman Highway',    x: 240, y: 320, isIntersection: false, passengers: 35 },
};

// Transit Route Definitions
const ROUTES = [
  {
    id: 'R-01',
    name: 'Circle ↔ Kaneshie Loop',
    color: '#1D9E75', // Primary Teal/Green
    stops: [STOPS.CIRCLE, STOPS.ADABRAKA, STOPS.KANESHIE, STOPS.DARKUMAN, STOPS.LAPAZ, STOPS.ACHIMOTA, STOPS.CIRCLE],
  },
  {
    id: 'R-02',
    name: 'Madina ↔ Tema Trunk',
    color: '#EF9F27', // Delayed Amber
    stops: [STOPS.MADINA, STOPS.LEGON, STOPS.CIRCLE, STOPS.ADABRAKA, STOPS.TEMA_JNC, STOPS.TEMA_TERM],
  },
  {
    id: 'R-03',
    name: 'Lapaz ↔ Adabraka Shuttle',
    color: '#3B82F6', // Blue
    stops: [STOPS.LAPAZ, STOPS.DARKUMAN, STOPS.KANESHIE, STOPS.ADABRAKA],
  },
  {
    id: 'R-05',
    name: 'Achimota ↔ Madina Connector',
    color: '#A855F7', // Purple
    stops: [STOPS.ACHIMOTA, STOPS.LEGON, STOPS.CIRCLE, STOPS.MADINA],
  },
];

// Helper to interpolate coordinates along a route path
function getCoordinateAlongPath(stops, progress) {
  if (!stops || stops.length < 2) return { x: 0, y: 0, angle: 0 };
  
  const segmentCount = stops.length - 1;
  const rawIndex = progress * segmentCount;
  let index = Math.floor(rawIndex);
  let localT = rawIndex - index;

  if (index >= segmentCount) {
    index = segmentCount - 1;
    localT = 1.0;
  }

  const pCurr = stops[index];
  const pNext = stops[index + 1];

  const x = pCurr.x + (pNext.x - pCurr.x) * localT;
  const y = pCurr.y + (pNext.y - pCurr.y) * localT;

  const dx = pNext.x - pCurr.x;
  const dy = pNext.y - pCurr.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return { x, y, angle };
}

export default function Maps() {
  // ── State Management ───────────────────────────────────────
  const [buses, setBuses] = useState([
    {
      id: 'GH-1234-21',
      routeId: 'R-01',
      driver: 'Kwame Mensah',
      phone: '+233 24 123 4567',
      speed: 28,
      status: 'On Time',
      progress: 0.15,
      lastGps: '2 mins ago',
      eta: '3 mins',
      currentStop: 'Adabraka Station',
      nextStop: 'Kaneshie Market',
    },
    {
      id: 'GT-5678-22',
      routeId: 'R-02',
      driver: 'Kofi Boateng',
      phone: '+233 20 987 6543',
      speed: 12,
      status: 'Delayed',
      progress: 0.45,
      lastGps: '30 secs ago',
      eta: '14 mins',
      currentStop: 'Madina Zongo',
      nextStop: 'Circle Interchange',
    },
    {
      id: 'GW-9101-23',
      routeId: 'R-03',
      driver: 'Yaw Addo',
      phone: '+233 27 555 4321',
      speed: 35,
      status: 'On Time',
      progress: 0.72,
      lastGps: 'Just now',
      eta: '1 min',
      currentStop: 'Darkuman Highway',
      nextStop: 'Lapaz Station',
    },
    {
      id: 'GR-1122-24',
      routeId: 'R-05',
      driver: 'Ama Serwaa',
      phone: '+233 24 888 9999',
      speed: 18,
      status: 'Delayed',
      progress: 0.33,
      lastGps: '5 mins ago',
      eta: '8 mins',
      currentStop: 'Achimota Mall',
      nextStop: 'Legon Junction',
    },
    {
      id: 'GH-9876-25',
      routeId: 'R-01',
      driver: 'Emmanuel Osei',
      phone: '+233 24 333 2222',
      speed: 0,
      status: 'Critical',
      progress: 0.85,
      lastGps: '10 mins ago',
      eta: 'Delayed indefinitely',
      currentStop: 'Achimota Mall',
      nextStop: 'Circle Interchange',
      alert: 'Engine Overheating Alert',
    },
  ]);

  // Selected & Hovered States
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [hoveredRouteId, setHoveredRouteId] = useState(null);
  const [hoveredStop, setHoveredStop] = useState(null);

  // Layout Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoute, setFilterRoute] = useState('All Routes');
  const [filterStatus, setFilterStatus] = useState('All Statuses');

  // Interactive Map Pan/Zoom Settings
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Map Toggles
  const [toggles, setToggles] = useState({
    traffic: false,
    routes: true,
    stops: true,
    heatmap: false,
    liveTracking: true,
  });

  // Modals / Triggers
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const mapRef = useRef(null);

  // Get currently selected bus object
  const selectedBus = buses.find((b) => b.id === selectedBusId);

  // ── Simulation Engine (Animation) ─────────────────────────
  useEffect(() => {
    let animationFrameId;

    const tick = () => {
      if (toggles.liveTracking) {
        setBuses((prevBuses) =>
          prevBuses.map((bus) => {
            // Critical stationary buses do not progress along route
            if (bus.status === 'Critical' || bus.speed === 0) return bus;

            // Compute delta based on speed (simulated scale)
            const speedFactor = 0.00015 * (bus.speed / 20);
            let nextProgress = bus.progress + speedFactor;
            if (nextProgress > 1.0) nextProgress = 0.0;

            return {
              ...bus,
              progress: nextProgress,
            };
          })
        );
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [toggles.liveTracking]);

  // ── Interactive Map Mouse Events ──────────────────────────
  const handleMouseDown = (e) => {
    // Left mouse click to drag
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    let nextZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    nextZoom = Math.max(0.6, Math.min(3.0, nextZoom));
    setZoom(nextZoom);
  };

  // Center view on specific vehicle coordinates
  const centerOnVehicle = (bus) => {
    const route = ROUTES.find((r) => r.id === bus.routeId);
    const { x, y } = getCoordinateAlongPath(route.stops, bus.progress);
    // Center logic relative to 800x600 canvas coordinate system
    setPan({
      x: 300 - x * zoom,
      y: 200 - y * zoom,
    });
  };

  // Reset viewport zoom and translation
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedBusId(null);
    setSelectedRouteId(null);
  };

  // ── Filters & Search Evaluation ────────────────────────────
  const filteredBuses = buses.filter((bus) => {
    const matchesSearch =
      bus.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoute = filterRoute === 'All Routes' || bus.routeId === filterRoute;
    const matchesStatus = filterStatus === 'All Statuses' || bus.status === filterStatus;
    return matchesSearch && matchesRoute && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-112px)] overflow-hidden">
      
      {/* ── Top Control & Filter Bar ────────────────────────── */}
      <div className="card flex flex-wrap items-center justify-between gap-4 py-3.5">
        
        {/* Search & Dynamic Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4.5 w-4.5 text-slate-500" />
            </span>
            <input
              type="text"
              placeholder="Search vehicle or driver..."
              className="input pl-9 pr-4 py-1.5 bg-surface text-slate-200 border-surface-border text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Route selector dropdown */}
          <select
            className="input w-40 py-1.5 bg-surface text-slate-300 border-surface-border text-sm"
            value={filterRoute}
            onChange={(e) => setFilterRoute(e.target.value)}
          >
            <option>All Routes</option>
            {ROUTES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} ({r.name.split(' ↔ ')[0]})
              </option>
            ))}
          </select>

          {/* Status selector dropdown */}
          <select
            className="input w-40 py-1.5 bg-surface text-slate-300 border-surface-border text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>All Statuses</option>
            <option>On Time</option>
            <option>Delayed</option>
            <option>Critical</option>
          </select>
        </div>

        {/* Live indicator & refresh action */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            <span className="text-slate-300 text-xs font-semibold tracking-wider uppercase">Live Tracking</span>
          </div>

          <button
            type="button"
            className="btn-ghost py-1.5 px-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            onClick={resetView}
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            Reset View
          </button>
        </div>

      </div>

      {/* ── Main Section (Map + Details Panel) ────────────────── */}
      <div className="flex-1 flex gap-4 min-h-0">
        
        {/* Left Side: Neural Map Container (approx. 70% width) */}
        <div className="flex-1 card p-0 relative overflow-hidden bg-[#08131F] border-surface-border select-none flex flex-col">
          
          {/* Map Layer Overlay Options */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <span className="text-xs font-semibold text-slate-505 bg-[#08131F]/90 px-3 py-1.5 rounded-lg border border-surface-border/50 uppercase tracking-widest flex items-center">
              Accra Sector Map
            </span>
          </div>

          {/* Layer toggles panel (top right) */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-[#0F1E35]/90 border border-surface-border p-1 rounded-lg shadow-lg">
            {[
              { id: 'traffic', label: 'Traffic' },
              { id: 'routes', label: 'Routes' },
              { id: 'stops', label: 'Stops' },
              { id: 'heatmap', label: 'Heatmap' },
            ].map((toggle) => (
              <button
                key={toggle.id}
                type="button"
                className={clsx(
                  'px-2.5 py-1 text-xs font-medium rounded transition-all duration-150',
                  toggles[toggle.id]
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                )}
                onClick={() => setToggles((t) => ({ ...t, [toggle.id]: !t[toggle.id] }))}
              >
                {toggle.label}
              </button>
            ))}
          </div>

          {/* Interactive SVG Canvas */}
          <svg
            ref={mapRef}
            className="flex-1 w-full h-full cursor-grab active:cursor-grabbing outline-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* SVG Filters for Futuristic Glowing Accent Effects */}
            <defs>
              <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Faint dot matrix background pattern */}
              <pattern id="matrix-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#1E3048" fillOpacity="0.3" />
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E3048" strokeWidth="0.5" strokeOpacity="0.08" />
              </pattern>
            </defs>

            {/* Transform Group representing pan & zoom offset */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              
              {/* 1. Backdrop Grid */}
              <rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#matrix-grid)" />

              {/* 2. Coastline Representation (Gulf of Guinea) */}
              <path
                d="M -100,530 C 150,550 250,565 420,550 C 580,535 680,510 900,520 L 900,700 L -100,700 Z"
                fill="#060F1A"
                stroke="#1B3150"
                strokeWidth="1.5"
              />
              <text x="680" y="580" fill="#1E3048" className="text-[10px] font-bold tracking-widest uppercase">
                Gulf of Guinea
              </text>

              {/* 3. Base Roads / Street lines (Glowing subtle grey network) */}
              <g stroke="#1E3048" strokeWidth="1" strokeOpacity="0.45" fill="none" strokeDasharray="3 3">
                {/* Horizontal corridors */}
                <line x1="100" y1="120" x2="750" y2="120" />
                <line x1="80" y1="300" x2="820" y2="300" />
                <line x1="50" y1="430" x2="700" y2="430" />
                {/* Vertical/Diagonal connectors */}
                <line x1="340" y1="50" x2="340" y2="500" />
                <line x1="430" y1="100" x2="430" y2="520" />
                <line x1="220" y1="100" x2="480" y2="500" />
                <line x1="580" y1="50" x2="580" y2="480" />
              </g>

              {/* 4. Traffic Flow Toggles Overlay */}
              {toggles.traffic && (
                <g strokeWidth="2.5" fill="none" strokeOpacity="0.8" filter="url(#glow-orange)">
                  {/* Heavy traffic points in red/amber */}
                  <line x1="340" y1="120" x2="480" y2="180" stroke="#D85A30" strokeDasharray="5 5" />
                  <line x1="430" y1="300" x2="430" y2="390" stroke="#EF9F27" />
                  <line x1="260" y1="430" x2="430" y2="390" stroke="#1D9E75" />
                </g>
              )}

              {/* 5. Transit Network Route Lines */}
              {toggles.routes &&
                ROUTES.map((route) => {
                  const pathD = route.stops
                    .map((stop, i) => `${i === 0 ? 'M' : 'L'} ${stop.x} ${stop.y}`)
                    .join(' ');
                  const isHovered = hoveredRouteId === route.id || selectedRouteId === route.id;
                  
                  return (
                    <g key={route.id}>
                      {/* Secondary wider touch line for easier hovering */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="15"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredRouteId(route.id)}
                        onMouseLeave={() => setHoveredRouteId(null)}
                        onClick={() => setSelectedRouteId(route.id === selectedRouteId ? null : route.id)}
                      />
                      {/* Visual core route line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={route.color}
                        strokeWidth={isHovered ? 3.5 : 1.75}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={selectedRouteId && !isHovered ? 0.2 : 0.85}
                        style={{
                          transition: 'stroke-width 200ms, opacity 200ms',
                          filter: isHovered ? 'url(#glow-teal)' : 'none',
                        }}
                      />
                    </g>
                  );
                })}

              {/* 6. Heatmap Layer */}
              {toggles.heatmap && (
                <g opacity="0.18">
                  {Object.values(STOPS).map((stop) => (
                    <circle
                      key={stop.id}
                      cx={stop.x}
                      cy={stop.y}
                      r={stop.passengers * 0.22}
                      fill="radial-gradient(circle, #1D9E75 0%, transparent 80%)"
                      className="fill-primary"
                    />
                  ))}
                </g>
              )}

              {/* 7. Stop Nodes (Glowing Circles) */}
              {toggles.stops &&
                Object.values(STOPS).map((stop) => {
                  const isHovered = hoveredStop?.id === stop.id;
                  const isNodeImportant = stop.isIntersection;

                  return (
                    <g
                      key={stop.id}
                      transform={`translate(${stop.x}, ${stop.y})`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredStop(stop)}
                      onMouseLeave={() => setHoveredStop(null)}
                    >
                      {/* Outer Ring */}
                      <circle
                        r={isHovered ? 12 : isNodeImportant ? 8 : 5}
                        fill="none"
                        stroke="#1D9E75"
                        strokeWidth={1.5}
                        strokeOpacity={isHovered ? 0.8 : 0.4}
                        className="transition-all duration-200"
                      />
                      {/* Center Core */}
                      <circle
                        r={isHovered ? 5.5 : isNodeImportant ? 4 : 2.5}
                        fill={isNodeImportant ? '#1D9E75' : '#0F1E35'}
                        stroke="#1D9E75"
                        strokeWidth={1.5}
                      />
                      
                      {/* Stop Node Label */}
                      {(isHovered || isNodeImportant) && (
                        <text
                          y="-14"
                          textAnchor="middle"
                          fill={isHovered ? '#FFFFFF' : '#94A3B8'}
                          className="text-[9px] font-semibold tracking-wide pointer-events-none select-none bg-slate-950"
                          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                        >
                          {stop.name}
                        </text>
                      )}
                    </g>
                  );
                })}

              {/* 8. Live Animated Bus Markers */}
              {filteredBuses.map((bus) => {
                const route = ROUTES.find((r) => r.id === bus.routeId);
                const isSelected = selectedBusId === bus.id;
                const isHighlighted = selectedRouteId === bus.routeId;
                
                // Get exact position on segment
                const { x, y, angle } = getCoordinateAlongPath(route.stops, bus.progress);

                // Map status colors
                const statusColor =
                  bus.status === 'On Time'
                    ? '#1D9E75'
                    : bus.status === 'Delayed'
                    ? '#EF9F27'
                    : '#D85A30';

                return (
                  <g
                    key={bus.id}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBusId(bus.id);
                    }}
                  >
                    {/* Pulsing selection aura */}
                    {(isSelected || isHighlighted) && (
                      <circle
                        r="24"
                        fill="none"
                        stroke={statusColor}
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        className="animate-[spin_12s_linear_infinite]"
                      />
                    )}

                    {/* Bus Marker container (rotates directional arrow) */}
                    <g transform={`rotate(${angle})`}>
                      {/* Direction Pointer Arrow */}
                      <path
                        d="M 12,-4 L 18,0 L 12,4 Z"
                        fill={statusColor}
                        filter={isSelected ? 'url(#glow-teal)' : 'none'}
                      />
                    </g>

                    {/* Rounded Rectangle Identifier Badge */}
                    <g transform="translate(-16, -10)">
                      <rect
                        width="32"
                        height="18"
                        rx="4"
                        fill="#0F1E35"
                        stroke={statusColor}
                        strokeWidth={isSelected ? 2 : 1}
                        className="shadow-md"
                      />
                      <text
                        x="16"
                        y="12"
                        textAnchor="middle"
                        fill={statusColor}
                        className="text-[8px] font-bold"
                      >
                        {bus.routeId}
                      </text>
                    </g>
                  </g>
                );
              })}

            </g>
          </svg>

          {/* Interactive Zoom & Reset Controls Panel (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5 bg-[#0F1E35]/95 border border-surface-border p-1.5 rounded-lg shadow-lg">
            <button
              type="button"
              className="p-1.5 hover:bg-surface-light rounded text-slate-400 hover:text-white transition-colors"
              onClick={() => setZoom((z) => Math.min(3.0, z * 1.15))}
              title="Zoom In"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 hover:bg-surface-light rounded text-slate-400 hover:text-white transition-colors"
              onClick={() => setZoom((z) => Math.max(0.6, z / 1.15))}
              title="Zoom Out"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 hover:bg-surface-light rounded text-slate-400 hover:text-white transition-colors border-t border-surface-border/50"
              onClick={resetView}
              title="Reset Zoom"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
            {selectedBus && (
              <button
                type="button"
                className="p-1.5 hover:bg-surface-light rounded text-primary transition-colors"
                onClick={() => centerOnVehicle(selectedBus)}
                title="Center on Vehicle"
              >
                <MapPinIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Active Status Metrics Panel (Overlay bottom center) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[#0F1E35]/95 border border-surface-border px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Active</p>
              <p className="text-sm font-bold text-primary">12</p>
            </div>
            <div className="w-px h-6 bg-surface-border" />
            <div className="text-center">
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Delayed</p>
              <p className="text-sm font-bold text-status-delayed">3</p>
            </div>
            <div className="w-px h-6 bg-surface-border" />
            <div className="text-center">
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Offline</p>
              <p className="text-sm font-bold text-status-critical">1</p>
            </div>
            <div className="w-px h-6 bg-surface-border" />
            <div className="text-center">
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Total Fleet</p>
              <p className="text-sm font-bold text-white">16</p>
            </div>
          </div>

          {/* Hover Stop Tooltip Indicator */}
          {hoveredStop && (
            <div
              className="absolute pointer-events-none bg-[#0F1E35] border border-surface-border p-2.5 rounded-lg shadow-xl text-xs z-30"
              style={{
                top: hoveredStop.y * zoom + pan.y - 80,
                left: hoveredStop.x * zoom + pan.x - 70,
              }}
            >
              <p className="font-semibold text-slate-100">{hoveredStop.name}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">Accra Central District</p>
              <div className="flex gap-4 mt-2 pt-1.5 border-t border-surface-border/50 text-[10px]">
                <div>
                  <span className="text-slate-400">Waiting Passengers: </span>
                  <span className="text-primary font-bold">{hoveredStop.passengers}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Details Overlay Panel (approx. 30% width) */}
        <div className="w-80 flex flex-col gap-4 shrink-0 min-h-0 overflow-y-auto scrollbar-thin">
          
          {/* Top Panel Card: Vehicle Details */}
          {selectedBus ? (
            <div className="card flex flex-col relative border-l-2" style={{ borderLeftColor: selectedBus.status === 'On Time' ? '#1D9E75' : selectedBus.status === 'Delayed' ? '#EF9F27' : '#D85A30' }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-100 flex items-center gap-1.5 text-sm">
                    <TruckIcon className="w-4 h-4 text-slate-400" />
                    Bus {selectedBus.id}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Assigned Route ID: {selectedBus.routeId}</p>
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-surface-light transition-colors"
                  onClick={() => setSelectedBusId(null)}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Driver block */}
              <div className="flex items-center gap-3 p-2.5 bg-surface-light/40 rounded-lg border border-surface-border/40 mb-4">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                  <UsersIcon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-200 text-xs font-semibold">{selectedBus.driver}</p>
                  <p className="text-[10px] text-slate-500">Fleet Operations Officer</p>
                </div>
                <a
                  href={`tel:${selectedBus.phone}`}
                  className="p-1.5 bg-surface-light hover:bg-surface-border text-slate-300 hover:text-white rounded-lg transition-colors border border-surface-border/50"
                  title="Call Driver"
                >
                  <PhoneIcon className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Data list rows */}
              <div className="space-y-3 text-xs mb-5">
                <div className="flex justify-between py-1 border-b border-surface-border/30">
                  <span className="text-slate-500">Current Stop</span>
                  <span className="text-slate-300 font-medium">{selectedBus.currentStop}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border/30">
                  <span className="text-slate-500">Next Stop</span>
                  <span className="text-slate-300 font-medium">{selectedBus.nextStop}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border/30">
                  <span className="text-slate-500">Speed (GPS)</span>
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <BoltIcon className="w-3.5 h-3.5 text-primary" />
                    {selectedBus.speed} km/h
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border/30">
                  <span className="text-slate-500">Last GPS Refresh</span>
                  <span className="text-slate-400">{selectedBus.lastGps}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border/30">
                  <span className="text-slate-500">Est. Arrival Time</span>
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5 text-primary" />
                    {selectedBus.eta}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Status</span>
                  <span
                    className={clsx(
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                      selectedBus.status === 'On Time'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : selectedBus.status === 'Delayed'
                        ? 'bg-status-delayed/10 text-status-delayed border border-status-delayed/20'
                        : 'bg-status-critical/10 text-status-critical border border-status-critical/20'
                    )}
                  >
                    {selectedBus.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 mt-auto">
                <button
                  type="button"
                  className="flex-1 btn-primary py-2 px-3 justify-center text-xs font-semibold"
                  onClick={() => centerOnVehicle(selectedBus)}
                >
                  Locate Bus
                </button>
                <button
                  type="button"
                  className="btn-ghost border-status-critical/30 hover:bg-status-critical/15 text-status-critical flex items-center justify-center p-2 rounded-lg"
                  onClick={() => setShowEmergencyModal(true)}
                  title="Trigger Emergency Alert"
                >
                  <ExclamationTriangleIcon className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="card flex-1 flex flex-col justify-center items-center text-center p-6 min-h-[220px]">
              <div className="w-12 h-12 rounded-full bg-surface-light border border-surface-border flex items-center justify-center mb-3">
                <TruckIcon className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-300 font-medium text-sm">No Vehicle Selected</p>
              <p className="text-slate-500 text-xs mt-1 max-w-[200px]">
                Click on a live bus marker or list item to view real-time metrics.
              </p>
            </div>
          )}

          {/* Bottom Panel Card: Live Vehicle List */}
          <div className="card flex-1 flex flex-col min-h-[300px]">
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">
              Fleet Grid ({filteredBuses.length})
            </h4>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {filteredBuses.map((bus) => {
                const isSelected = selectedBusId === bus.id;
                return (
                  <div
                    key={bus.id}
                    className={clsx(
                      'p-3 rounded-lg border cursor-pointer transition-all duration-150 flex items-center justify-between',
                      isSelected
                        ? 'bg-primary/10 border-primary'
                        : 'bg-surface-light/30 border-surface-border hover:bg-surface-light/60'
                    )}
                    onClick={() => {
                      setSelectedBusId(bus.id);
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              bus.status === 'On Time'
                                ? '#1D9E75'
                                : bus.status === 'Delayed'
                                ? '#EF9F27'
                                : '#D85A30',
                          }}
                        />
                        <span className="text-slate-200 text-xs font-bold">{bus.id}</span>
                        <span className="text-[10px] text-slate-500">({bus.routeId})</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{bus.driver}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-slate-200 text-xs font-semibold">{bus.speed} km/h</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{bus.eta} left</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* ── Bottom Analytics & Notifications Panel ───────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 shrink-0">
        
        {/* KPI Panel Cards */}
        <div className="xl:col-span-2 card grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          <div className="border-r border-surface-border/50 pr-4">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">On-Time Performance</p>
            <p className="text-lg font-bold text-primary mt-1">98.2%</p>
            <span className="text-[9px] text-slate-500">+1.2% from last week</span>
          </div>
          <div className="border-r border-surface-border/50 px-2 md:px-4">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Average Network Speed</p>
            <p className="text-lg font-bold text-slate-200 mt-1">26.4 km/h</p>
            <span className="text-[9px] text-slate-500">Within normal range</span>
          </div>
          <div className="border-r border-surface-border/50 px-2 md:px-4">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Passengers Today</p>
            <p className="text-lg font-bold text-slate-200 mt-1">2,543</p>
            <span className="text-[9px] text-primary font-medium">92% capacity utilization</span>
          </div>
          <div className="pl-4">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active Alerts</p>
            <p className="text-lg font-bold text-status-critical mt-1">2 Critical</p>
            <span className="text-[9px] text-slate-500">Resolution team assigned</span>
          </div>
        </div>

        {/* Notifications & Warning Alerts Feed */}
        <div className="card py-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-surface-border/50 pb-2 mb-2">
            <span className="text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <BellIcon className="w-4 h-4 text-status-delayed text-orange-400" />
              Incidents & Dispatch Feed
            </span>
            <span className="text-[9px] text-primary cursor-pointer hover:underline">Clear Logs</span>
          </div>

          <div className="space-y-2 max-h-[70px] overflow-y-auto scrollbar-thin text-[11px] pr-1">
            <div className="flex justify-between text-slate-300">
              <span className="truncate pr-4 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-status-critical" />
                <strong>R-01 (GH-9876-25):</strong> Engine Overheating alert at Achimota Mall
              </span>
              <span className="text-[9px] text-slate-500 shrink-0">10m ago</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="truncate pr-4 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-status-delayed" />
                <strong>R-02:</strong> Gridlock congestion on Madina road sector
              </span>
              <span className="text-[9px] text-slate-500 shrink-0">15m ago</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Emergency Alert Confirmation Modal ─────────────────── */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 bg-surface border border-status-critical/30 shadow-2xl relative">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-status-critical/15 border border-status-critical/30 flex items-center justify-center shrink-0">
                <ExclamationTriangleIcon className="w-6 h-6 text-status-critical" />
              </div>
              <div>
                <h3 className="text-slate-100 font-bold text-base">Confirm Emergency Broadcast?</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  This action triggers a priority emergency warning alert on bus <strong>{selectedBus?.id}</strong>.
                  The driver will receive a dashboard alarm, and emergency services will be dispatched automatically.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-surface-border/50 pt-4">
              <button
                type="button"
                className="btn-ghost text-xs px-4 py-2 border-surface-border hover:bg-surface-light text-slate-300"
                onClick={() => setShowEmergencyModal(false)}
              >
                Cancel Alert
              </button>
              <button
                type="button"
                className="btn-primary bg-status-critical hover:bg-status-critical/90 border-none text-xs px-4 py-2"
                onClick={() => {
                  setShowEmergencyModal(false);
                  alert(`Emergency alert broadcasted for vehicle ${selectedBus?.id}`);
                }}
              >
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
