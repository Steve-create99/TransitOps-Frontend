// ============================================================
// context/TransitContext.jsx — Shared transit data store
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================
// Centralises routes, stops, and schedules so every page
// reads from and writes to the same in-memory store,
// enabling real-time cross-page sync.

import { createContext, useContext, useState, useEffect, useMemo } from 'react';

// ── KNUST Campus Stops with Coordinates and Average Riders ──
const KNUST_STOPS = {
  'Tech Junction': { lat: 6.6698, lng: -1.5765, riders: 420, zone: 'Gateway' },
  'Main Gate': { lat: 6.6712, lng: -1.5749, riders: 180, zone: 'Gateway' },
  'Continental Roundabout': { lat: 6.6741, lng: -1.5716, riders: 510, zone: 'General' },
  'Administration Block': { lat: 6.6758, lng: -1.5710, riders: 120, zone: 'Academic' },
  'Prempeh II Library': { lat: 6.6769, lng: -1.5703, riders: 350, zone: 'Academic' },
  'Great Hall': { lat: 6.6754, lng: -1.5688, riders: 280, zone: 'General' },
  'University Hall / Katanga': { lat: 6.6762, lng: -1.5672, riders: 390, zone: 'Residential' },
  'Unity Hall / Conti': { lat: 6.6755, lng: -1.5730, riders: 340, zone: 'Residential' },
  'Africa Hall': { lat: 6.6763, lng: -1.5742, riders: 160, zone: 'Residential' },
  'Queen Elizabeth II Hall': { lat: 6.6771, lng: -1.5728, riders: 210, zone: 'Residential' },
  'Independence Hall': { lat: 6.6779, lng: -1.5714, riders: 290, zone: 'Residential' },
  'Republic Hall': { lat: 6.6773, lng: -1.5699, riders: 310, zone: 'Residential' },
  'Paa Joe Stadium': { lat: 6.6760, lng: -1.5695, riders: 95, zone: 'General' },
  'College of Engineering': { lat: 6.6725, lng: -1.5728, riders: 480, zone: 'Academic' },
  'College of Science': { lat: 6.6733, lng: -1.5712, riders: 410, zone: 'Academic' },
  'KNUST School of Business / KSB': { lat: 6.6740, lng: -1.5698, riders: 330, zone: 'Academic' },
  'College of Art & Built Environment': { lat: 6.6748, lng: -1.5683, riders: 150, zone: 'Academic' },
  'Commercial Area / Market': { lat: 6.6760, lng: -1.5670, riders: 450, zone: 'Gateway' },
  'Brunei Complex': { lat: 6.6766, lng: -1.5658, riders: 260, zone: 'Residential' },
  'Non-Resident Facility / Club B': { lat: 6.6750, lng: -1.5660, riders: 80, zone: 'General' },
  'Botanical Gardens': { lat: 6.6735, lng: -1.5650, riders: 60, zone: 'General' },
  'Ayeduase Junction': { lat: 6.6720, lng: -1.5680, riders: 190, zone: 'Gateway' },
  'Kotei Roundabout': { lat: 6.6705, lng: -1.5655, riders: 110, zone: 'Gateway' },
  'New Site Terminal': { lat: 6.6690, lng: -1.5638, riders: 380, zone: 'Gateway' },
};

// ── Seed KNUST Routes ────────────────────────────────────────
const SEED_ROUTES = [
  {
    id: 'RT-01',
    number: 'K-01',
    name: 'Tech Junction – Katanga Circular',
    color: '#1D9E75',
    startStop: 'Tech Junction',
    endStop: 'Continental Roundabout',
    intermediateStops: ['Main Gate', 'Continental Roundabout', 'Administration Block', 'Prempeh II Library', 'Great Hall', 'University Hall / Katanga'],
    status: 'Active',
    frequency: 10,
    buses: 6,
    type: 'Circular',
    direction: 'Northbound',
  },
  {
    id: 'RT-02',
    number: 'K-02',
    name: 'Halls Circular — North',
    color: '#3B82F6',
    startStop: 'Continental Roundabout',
    endStop: 'Continental Roundabout',
    intermediateStops: ['Unity Hall / Conti', 'Africa Hall', 'Queen Elizabeth II Hall', 'Independence Hall', 'Republic Hall', 'Paa Joe Stadium'],
    status: 'Active',
    frequency: 12,
    buses: 5,
    type: 'Circular',
    direction: 'Northbound',
  },
  {
    id: 'RT-03',
    number: 'K-03',
    name: 'Faculty Express',
    color: '#F59E0B',
    startStop: 'Tech Junction',
    endStop: 'Continental Roundabout',
    intermediateStops: ['Main Gate', 'College of Engineering', 'College of Science', 'KNUST School of Business / KSB', 'College of Art & Built Environment'],
    status: 'Active',
    frequency: 15,
    buses: 4,
    type: 'Express',
    direction: 'Eastbound',
  },
  {
    id: 'RT-04',
    number: 'K-04',
    name: 'Commercial Shuttle',
    color: '#8B5CF6',
    startStop: 'Continental Roundabout',
    endStop: 'Commercial Area / Market',
    intermediateStops: ['Great Hall', 'Commercial Area / Market', 'Brunei Complex', 'Non-Resident Facility / Club B', 'Botanical Gardens'],
    status: 'Active',
    frequency: 15,
    buses: 3,
    type: 'Regular',
    direction: 'Southbound',
  },
  {
    id: 'RT-05',
    number: 'K-05',
    name: 'New Site Connector',
    color: '#EC4899',
    startStop: 'Tech Junction',
    endStop: 'New Site Terminal',
    intermediateStops: ['Main Gate', 'Continental Roundabout', 'Ayeduase Junction', 'Kotei Roundabout'],
    status: 'Inactive',
    frequency: 20,
    buses: 0,
    type: 'Feeder',
    direction: 'Southbound',
  },
  {
    id: 'RT-06',
    number: 'K-06',
    name: 'Library – Stadium Loop',
    color: '#EF4444',
    startStop: 'Prempeh II Library',
    endStop: 'Prempeh II Library',
    intermediateStops: ['Administration Block', 'Great Hall', 'Republic Hall', 'Paa Joe Stadium', 'Independence Hall'],
    status: 'Active',
    frequency: 15,
    buses: 3,
    type: 'Circular',
    direction: 'Westbound',
  },
];

// Helper to calculate arrival time (departure + 25 minutes)
const calculateArrivalTime = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + 25;
  const hr = Math.floor(total / 60) % 24;
  const min = total % 60;
  return `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
};

// ── Seed Schedules ───────────────────────────────────────────
const generateSeedSchedules = () => {
  const times = [
    { time: '06:00', status: 'Completed' },
    { time: '06:15', status: 'Completed' },
    { time: '06:30', status: 'Completed' },
    { time: '06:45', status: 'Completed' },
    { time: '07:00', status: 'Completed' },
    { time: '07:15', status: 'Completed' },
    { time: '07:30', status: 'Completed' },
    { time: '08:00', status: 'Completed' },
    { time: '08:30', status: 'Completed' },
    { time: '09:00', status: 'Completed' },
    { time: '11:30', status: 'Completed' },
    { time: '12:00', status: 'Completed' },
    { time: '12:30', status: 'Completed' },
    { time: '13:00', status: 'Completed' },
    { time: '14:00', status: 'Completed' },
    { time: '15:00', status: 'Running' },
    { time: '16:00', status: 'On Time' },
    { time: '17:00', status: 'Delayed' },
    { time: '17:30', status: 'On Time' },
    { time: '18:00', status: 'On Time' },
  ];

  const list = [];
  let idCount = 1;
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const routeIds = ['RT-01', 'RT-02', 'RT-03', 'RT-04', 'RT-05', 'RT-06'];

  routeIds.forEach((routeId) => {
    times.forEach((t) => {
      list.push({
        id: `SCH-${String(idCount++).padStart(4, '0')}`,
        routeId,
        days: DAYS,
        departureTime: t.time,
        arrivalTime: calculateArrivalTime(t.time),
        status: t.status,
        notes: 'Regular scheduled run',
      });
    });
  });

  return list;
};

// ── Seed Notifications ───────────────────────────────────────
const SEED_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'ALERT',
    title: 'Delay Alert — K-03 Faculty Express',
    message: 'Faculty Express delayed 6 min at College of Engineering.',
    time: '07:14 AM',
    read: false,
    stopName: 'College of Engineering',
    routeNumber: 'K-03'
  },
  {
    id: 'notif-2',
    type: 'INFO',
    title: 'Schedule Added',
    message: 'New schedule added: K-01 06:15 departure.',
    time: '07:10 AM',
    read: true,
    stopName: 'Tech Junction',
    routeNumber: 'K-01'
  },
  {
    id: 'notif-3',
    type: 'ALERT',
    title: 'Capacity Alert',
    message: 'Continental Roundabout at 89% capacity.',
    time: '07:05 AM',
    read: false,
    stopName: 'Continental Roundabout',
    routeNumber: 'K-01'
  },
  {
    id: 'notif-4',
    type: 'SUCCESS',
    title: 'Back on Schedule',
    message: 'K-02 Halls Circular back on schedule.',
    time: '06:58 AM',
    read: true,
    stopName: 'Continental Roundabout',
    routeNumber: 'K-02'
  },
  {
    id: 'notif-5',
    type: 'ALERT',
    title: 'Delay Alert — K-05',
    message: 'K-05 New Site Connector delayed 9 min.',
    time: '06:50 AM',
    read: false,
    stopName: 'New Site Terminal',
    routeNumber: 'K-05'
  },
  {
    id: 'notif-6',
    type: 'INFO',
    title: 'Ridership Peak',
    message: 'Tech Junction — 142 passengers boarded.',
    time: '06:45 AM',
    read: true,
    stopName: 'Tech Junction',
    routeNumber: 'K-05'
  },
  {
    id: 'notif-7',
    type: 'ALERT',
    title: 'Overcrowded Stop',
    message: 'Prempeh II Library stop overcrowded.',
    time: '06:40 AM',
    read: false,
    stopName: 'Prempeh II Library',
    routeNumber: 'K-06'
  },
  {
    id: 'notif-8',
    type: 'INFO',
    title: 'System Operational',
    message: 'System: All routes operational.',
    time: '06:00 AM',
    read: true,
    stopName: 'Main Gate',
    routeNumber: 'K-01'
  },
];

// ── Seed Activity Log ────────────────────────────────────────
const SEED_LOGS = [
  { id: 1, time: '08:52', route: 'K-02', stop: 'Paa Joe Stadium', event: 'Arrived' },
  { id: 2, time: '08:48', route: 'K-01', stop: 'University Hall / Katanga', event: 'Departed' },
  { id: 3, time: '08:40', route: 'K-04', stop: 'Botanical Gardens', event: 'Delayed — 4 min' },
  { id: 4, time: '08:35', route: 'K-03', stop: 'College of Engineering', event: 'Overcrowded — 87%' },
  { id: 5, time: '08:22', route: 'K-06', stop: 'Paa Joe Stadium', event: 'On time' },
  { id: 6, time: '08:15', route: 'K-05', stop: 'Ayeduase Junction', event: 'Arrived' },
  { id: 7, time: '07:58', route: 'K-01', stop: 'Prempeh II Library', event: 'Departed' },
  { id: 8, time: '07:45', route: 'K-03', stop: 'Main Gate', event: 'Arrived' },
  { id: 9, time: '07:30', route: 'K-02', stop: 'Unity Hall / Conti', event: 'On time' },
  { id: 10, time: '07:12', route: 'K-04', stop: 'Brunei Complex', event: 'Departed' },
  { id: 11, time: '06:55', route: 'K-05', stop: 'Kotei Roundabout', event: 'Delayed — 4 min' },
  { id: 12, time: '06:30', route: 'K-01', stop: 'Tech Junction', event: 'Departed' },
];

const TransitContext = createContext(null);

export function TransitProvider({ children }) {
  const [routes, setRoutes] = useState(SEED_ROUTES);
  const [schedules, setSchedules] = useState(generateSeedSchedules);
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const [logs, setLogs] = useState(SEED_LOGS);

  // ── Global Toast State ──
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'warning' }
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ── Dynamic derived stops ──
  const stops = useMemo(() => {
    const stopMap = {};
    routes.forEach((r) => {
      const allRouteStops = [r.startStop, ...r.intermediateStops, r.endStop];
      allRouteStops.forEach((stopName) => {
        if (!stopMap[stopName]) {
          const staticData = KNUST_STOPS[stopName] || { lat: 6.6745, lng: -1.5716, riders: 120, zone: 'General' };
          stopMap[stopName] = {
            name: stopName,
            lat: staticData.lat,
            lng: staticData.lng,
            riders: staticData.riders,
            zone: staticData.zone,
            routeNumbers: new Set(),
            active: false,
          };
        }
        stopMap[stopName].routeNumbers.add(r.number);
        if (r.status === 'Active') {
          stopMap[stopName].active = true;
        }
      });
    });

    return Object.values(stopMap).map((stop, idx) => ({
      id: `STP-${String(idx + 1).padStart(3, '0')}`,
      name: stop.name,
      lat: stop.lat,
      lng: stop.lng,
      riders: stop.riders,
      zone: stop.zone,
      routes: Array.from(stop.routeNumbers),
      active: stop.active,
    }));
  }, [routes]);

  // ── Real-Time Metrics State ──
  const [passengersToday, setPassengersToday] = useState(3200);
  const [onTimePerformance, setOnTimePerformance] = useState(91);
  const [averageSpeed, setAverageSpeed] = useState(18);

  // Active Alerts is derived live from unread notifications
  const activeAlertsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Intervals to update metrics dynamically
  useEffect(() => {
    // 1. Passengers Today (every 30s)
    const passInterval = setInterval(() => {
      setPassengersToday((prev) => prev + Math.floor(Math.random() * (24 - 8 + 1)) + 8);
    }, 30000);

    // 2. On-Time Performance (every 60s)
    const onTimeInterval = setInterval(() => {
      setOnTimePerformance((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return Math.max(78, Math.min(99, next));
      });
    }, 60000);

    // 3. Average Speed (every 45s)
    const speedInterval = setInterval(() => {
      setAverageSpeed(() => {
        return Math.floor(Math.random() * (28 - 12 + 1)) + 12;
      });
    }, 45000);

    return () => {
      clearInterval(passInterval);
      clearInterval(onTimeInterval);
      clearInterval(speedInterval);
    };
  }, []);

  // ── Actions ──
  const addRoute = (newRoute) => {
    const id = `RT-${String(routes.length + 1).padStart(2, '0')}`;
    setRoutes((prev) => [...prev, { ...newRoute, id }]);
    showToast(`Route ${newRoute.number} successfully added!`, 'success');
  };

  const deleteRoute = (id) => {
    const routeToDelete = routes.find((r) => r.id === id);
    if (!routeToDelete) return;
    setRoutes((prev) => prev.filter((r) => r.id !== id));
    // Also cleanup schedules matching this route
    setSchedules((prev) => prev.filter((s) => s.routeId !== id));
    showToast(`Route ${routeToDelete.number} successfully deleted!`, 'success');
  };

  const addSchedule = (newSchedule) => {
    const id = `SCH-${String(schedules.length + 1).padStart(4, '0')}`;
    setSchedules((prev) => [...prev, { ...newSchedule, id }]);
    showToast('Timetable runs successfully generated!', 'success');
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All alerts marked as read.', 'success');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const restoreLogs = () => {
    setLogs(SEED_LOGS);
  };

  const availableStopNames = Object.keys(KNUST_STOPS);

  return (
    <TransitContext.Provider
      value={{
        routes,
        stops,
        schedules,
        notifications,
        logs,
        passengersToday,
        onTimePerformance,
        averageSpeed,
        activeAlertsCount,
        toast,
        addRoute,
        deleteRoute,
        addSchedule,
        markNotificationRead,
        markAllNotificationsRead,
        clearLogs,
        restoreLogs,
        showToast,
        availableStopNames,
        KNUST_STOPS,
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
