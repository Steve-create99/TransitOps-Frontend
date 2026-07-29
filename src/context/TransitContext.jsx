// ============================================================
// context/TransitContext.jsx — Shared transit data store
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================
// Centralises routes, stops, and schedules so every page
// reads from and writes to the same in-memory store,
// enabling real-time cross-page sync.

import { createContext, useContext, useState } from 'react';

// ── KNUST Campus Shuttle Stops ───────────────────────────────
const KNUST_STOPS = [
  'Main Gate',
  'Unity Hall',
  'Republic Hall',
  'College of Engineering',
  'KNUST Hospital',
  'Commercial Area (Tech Junction)',
  'SRC Building',
  'Africa Hall',
  'Brunei Hostel',
  'Paa Joe Stadium',
  'Science & Technology Library',
  'Pharmacy Building',
  'College of Science',
  'School of Medical Sciences',
  'Great Hall',
  'Administration Block',
  'UDS Gate',
  'KNUST Market',
  'Katanga Hall',
  'Queen Elizabeth Hall',
];

// ── Seed KNUST Routes ────────────────────────────────────────
const SEED_ROUTES = [
  {
    id: 'RT-01',
    name: 'Main Gate — KNUST Hospital',
    number: 'K-01',
    startStop: 'Main Gate',
    endStop: 'KNUST Hospital',
    intermediateStops: ['Unity Hall', 'Republic Hall', 'SRC Building'],
    status: 'Active',
    buses: 6,
    type: 'Circular',
    direction: 'Northbound',
  },
  {
    id: 'RT-02',
    name: 'Commercial Area — College of Engineering',
    number: 'K-02',
    startStop: 'Commercial Area (Tech Junction)',
    endStop: 'College of Engineering',
    intermediateStops: ['Africa Hall', 'Brunei Hostel', 'Paa Joe Stadium'],
    status: 'Active',
    buses: 4,
    type: 'Express',
    direction: 'Eastbound',
  },
  {
    id: 'RT-03',
    name: 'Africa Hall — Main Gate Loop',
    number: 'K-03',
    startStop: 'Africa Hall',
    endStop: 'Main Gate',
    intermediateStops: ['Katanga Hall', 'SRC Building', 'Great Hall', 'Administration Block'],
    status: 'Active',
    buses: 5,
    type: 'Circular',
    direction: 'Westbound',
  },
  {
    id: 'RT-04',
    name: 'Brunei Hostel — KNUST Market',
    number: 'K-04',
    startStop: 'Brunei Hostel',
    endStop: 'KNUST Market',
    intermediateStops: ['Queen Elizabeth Hall', 'College of Science', 'Administration Block'],
    status: 'Inactive',
    buses: 3,
    type: 'Feeder',
    direction: 'Southbound',
  },
  {
    id: 'RT-05',
    name: 'Great Hall — School of Medical Sciences',
    number: 'K-05',
    startStop: 'Great Hall',
    endStop: 'School of Medical Sciences',
    intermediateStops: ['Science & Technology Library', 'Pharmacy Building'],
    status: 'Active',
    buses: 4,
    type: 'Express',
    direction: 'Northbound',
  },
  {
    id: 'RT-06',
    name: 'UDS Gate — SRC Building',
    number: 'K-06',
    startStop: 'UDS Gate',
    endStop: 'SRC Building',
    intermediateStops: ['KNUST Market', 'Paa Joe Stadium', 'Unity Hall'],
    status: 'Active',
    buses: 5,
    type: 'Regular',
    direction: 'Eastbound',
  },
];

// ── Derive stops from route data ─────────────────────────────
// Each unique stop gets a record counting how many routes serve it.
function deriveStops(routes) {
  const stopMap = {}; // name → { routes: Set, active: bool }
  routes.forEach((r) => {
    const allStops = [r.startStop, ...r.intermediateStops, r.endStop];
    allStops.forEach((stopName) => {
      if (!stopMap[stopName]) {
        stopMap[stopName] = { routeIds: new Set(), active: r.status === 'Active' };
      }
      stopMap[stopName].routeIds.add(r.id);
      if (r.status === 'Active') stopMap[stopName].active = true;
    });
  });

  return Object.entries(stopMap).map(([name, data], idx) => ({
    id: `STP-${String(idx + 1).padStart(3, '0')}`,
    name,
    routes: data.routeIds.size,
    zone: name.includes('Hall') ? 'Residential' : name.includes('College') || name.includes('School') ? 'Academic' : name.includes('Gate') || name.includes('Market') || name.includes('Commercial') ? 'Gateway' : 'General',
    active: data.active,
  }));
}

// ── Seed Schedules ───────────────────────────────────────────
const SEED_SCHEDULES = [
  {
    id: 'SCH-001',
    routeId: 'RT-01',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    departureTime: '06:00',
    arrivalTime: '06:30',
    status: 'Active',
  },
  {
    id: 'SCH-002',
    routeId: 'RT-02',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    departureTime: '07:00',
    arrivalTime: '07:25',
    status: 'Active',
  },
  {
    id: 'SCH-003',
    routeId: 'RT-03',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    departureTime: '07:30',
    arrivalTime: '08:10',
    status: 'Active',
  },
  {
    id: 'SCH-004',
    routeId: 'RT-04',
    days: ['Sat', 'Sun'],
    departureTime: '09:00',
    arrivalTime: '09:20',
    status: 'Inactive',
  },
  {
    id: 'SCH-005',
    routeId: 'RT-05',
    days: ['Mon', 'Wed', 'Fri'],
    departureTime: '08:00',
    arrivalTime: '08:20',
    status: 'Active',
  },
  {
    id: 'SCH-006',
    routeId: 'RT-06',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    departureTime: '06:45',
    arrivalTime: '07:15',
    status: 'Active',
  },
  {
    id: 'SCH-007',
    routeId: 'RT-01',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    departureTime: '16:00',
    arrivalTime: '16:30',
    status: 'Active',
  },
  {
    id: 'SCH-008',
    routeId: 'RT-03',
    days: ['Sat', 'Sun'],
    departureTime: '10:00',
    arrivalTime: '10:40',
    status: 'Active',
  },
];

// ── Context Definition ───────────────────────────────────────
const TransitContext = createContext(null);

export function TransitProvider({ children }) {
  const [routes, setRoutes] = useState(SEED_ROUTES);
  const [schedules, setSchedules] = useState(SEED_SCHEDULES);

  // Stops are always derived from routes — fully reactive
  const stops = deriveStops(routes);

  // ── Route actions ──────────────────────────────────────────
  const addRoute = (newRoute) => {
    const id = `RT-${String(routes.length + 1).padStart(2, '0')}`;
    setRoutes((prev) => [...prev, { ...newRoute, id, buses: 0 }]);
  };

  const updateRoute = (id, changes) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...changes } : r))
    );
  };

  // ── Schedule actions ───────────────────────────────────────
  const addSchedule = (newSchedule) => {
    const id = `SCH-${String(schedules.length + 1).padStart(3, '0')}`;
    setSchedules((prev) => [...prev, { ...newSchedule, id }]);
  };

  // Expose all KNUST stop names for dropdowns
  const availableStopNames = KNUST_STOPS;

  return (
    <TransitContext.Provider
      value={{
        routes,
        stops,
        schedules,
        addRoute,
        updateRoute,
        addSchedule,
        availableStopNames,
      }}
    >
      {children}
    </TransitContext.Provider>
  );
}

export function useTransit() {
  const ctx = useContext(TransitContext);
  if (!ctx) throw new Error('useTransit must be used inside <TransitProvider>');
  return ctx;
}
