// ============================================================
// data/mockData.js — Centralized dummy data for development
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================
// Replace these with real API calls once the backend is ready.

/** @type {Array<{id:string, name:string, buses:number, stops:number, status:string}>} */
export const ROUTES = [
  { id: 'RT-01', name: 'Central — Airport',        buses: 12, stops: 24, status: 'Active'   },
  { id: 'RT-07', name: 'North — City Loop',          buses: 8,  stops: 18, status: 'Delayed'  },
  { id: 'RT-14', name: 'East — Harbor Bridge',       buses: 10, stops: 20, status: 'Active'   },
  { id: 'RT-22', name: 'South — University',         buses: 6,  stops: 15, status: 'Critical' },
  { id: 'RT-30', name: 'West — Industrial Zone',     buses: 9,  stops: 22, status: 'Active'   },
  { id: 'RT-38', name: 'Downtown — Riverfront',      buses: 5,  stops: 12, status: 'Active'   },
];

/** @type {Array<{id:string, name:string, routes:number, zone:string, active:boolean}>} */
export const STOPS = [
  { id: 'STP-001', name: 'Central Terminal',    routes: 8, zone: 'A', active: true  },
  { id: 'STP-002', name: 'Airport Terminal T1', routes: 3, zone: 'C', active: true  },
  { id: 'STP-003', name: 'North Station',        routes: 5, zone: 'B', active: true  },
  { id: 'STP-004', name: 'University Gate',      routes: 4, zone: 'B', active: false },
  { id: 'STP-005', name: 'Harbor Wharf',         routes: 2, zone: 'D', active: true  },
];

/** KPI summary data for the dashboard */
export const DASHBOARD_KPI = {
  activeRoutes:   42,
  busesOnRoad:    186,
  fleetTotal:     202,
  delayedRoutes:  7,
  criticalAlerts: 2,
};

/** Hourly passenger volume data for charts */
export const PASSENGER_VOLUME = [
  { time: '06:00', passengers: 820  },
  { time: '07:00', passengers: 2300 },
  { time: '08:00', passengers: 4100 },
  { time: '09:00', passengers: 3200 },
  { time: '10:00', passengers: 1800 },
  { time: '11:00', passengers: 1500 },
  { time: '12:00', passengers: 2100 },
  { time: '13:00', passengers: 1900 },
  { time: '17:00', passengers: 4600 },
  { time: '18:00', passengers: 3100 },
];
