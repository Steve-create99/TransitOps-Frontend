// ============================================================
// context/TransitContext.jsx — Backend-backed operational state
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  unwrapList,
  routesApi,
  stopsApi,
  scheduleApi,
  notificationsApi,
  dashboardApi,
  settingsApi,
  vehiclesApi,
  getAccessToken,
} from '../services/api';
import { useAppContext } from './AppContext';

const TransitContext = createContext(null);

function mapRoute(r) {
  return {
    id: r.id,
    number: r.number || r.code,
    code: r.code,
    name: r.name,
    color: r.color || '#1D9E75',
    startStop: r.startStop,
    endStop: r.endStop,
    intermediateStops: r.intermediateStops || [],
    status: r.status || 'Active',
    frequency: r.frequencyMinutes ?? r.frequency ?? 15,
    buses: r.busCount ?? r.buses ?? 0,
    type: r.type || 'Circular',
    direction: r.direction || '',
  };
}

function mapStop(s, routes = []) {
  const linked = routes
    .filter((r) => {
      const all = [r.startStop, ...(r.intermediateStops || []), r.endStop];
      return all.includes(s.name);
    })
    .map((r) => r.number || r.code);

  return {
    id: s.id,
    name: s.name,
    lat: s.latitude ?? s.lat ?? 6.6745,
    lng: s.longitude ?? s.lng ?? -1.5716,
    riders: s.averageRiders ?? s.riders ?? 0,
    zone: s.zone || 'General',
    routes: linked,
    active: (s.status || 'Active').toLowerCase() === 'active',
    status: s.status || 'Active',
    wheelchairAccessible: !!s.wheelchairAccessible,
    amenities: s.amenities,
  };
}

function mapSchedule(s) {
  const dep = s.departureTime || '';
  const arr = s.arrivalTime || '';
  const departure =
    typeof dep === 'string' ? dep.slice(0, 5) : String(dep || '').slice(0, 5);
  const arrival =
    typeof arr === 'string' ? arr.slice(0, 5) : String(arr || '').slice(0, 5);
  const days = [];
  if (s.weekdays !== false) days.push('Mon', 'Tue', 'Wed', 'Thu', 'Fri');
  if (s.weekends) days.push('Sat', 'Sun');
  if (days.length === 0) days.push('Mon', 'Tue', 'Wed', 'Thu', 'Fri');

  return {
    id: s.id,
    routeId: s.routeId,
    route: s.routeCode || s.routeName,
    routeName: s.routeName,
    routeCode: s.routeCode,
    departure,
    arrival,
    departureTime: departure,
    arrivalTime: arrival,
    days,
    serviceDate: s.serviceDate,
    delayStatus: s.delayStatus || 'ON_TIME',
    delayMinutes: s.delayMinutes || 0,
    driverId: s.driverId,
    driverName: s.driverName,
    vehicleId: s.vehicleId,
    vehicleReg: s.vehicleReg,
    status: s.status || s.delayStatus || 'SCHEDULED',
    weekdays: s.weekdays !== false,
    weekends: !!s.weekends,
  };
}

function mapNotification(n) {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    body: n.message,
    type: (n.category || 'GENERAL').toLowerCase(),
    category: n.category || 'GENERAL',
    priority: n.priority || 'MEDIUM',
    read: !!(n.readFlag ?? n.read),
    time: n.createdAt
      ? new Date(n.createdAt).toLocaleString()
      : '',
    createdAt: n.createdAt,
  };
}

function mapAuditLog(a) {
  return {
    id: a.id,
    time: a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    route: a.entityType || '',
    stop: a.entityId || '',
    event: a.action ? `${a.action}${a.details ? ` — ${a.details}` : ''}` : (a.details || 'Event'),
    actor: a.actor,
  };
}

export function TransitProvider({ children }) {
  const { user } = useAppContext();

  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [vehicleLocations, setVehicleLocations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadAll = useCallback(async () => {
    if (!user || !getAccessToken()) {
      setRoutes([]);
      setStops([]);
      setSchedules([]);
      setNotifications([]);
      setLogs([]);
      setKpis(null);
      setCharts(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [routesRaw, stopsRaw, schedulesRaw, notifRaw, kpisRaw, chartsRaw, locsRaw] =
        await Promise.all([
          routesApi.list(),
          stopsApi.list(),
          scheduleApi.list(),
          notificationsApi.list(),
          dashboardApi.kpis(),
          dashboardApi.charts(),
          vehiclesApi.locations().catch(() => []),
        ]);

      const mappedRoutes = unwrapList(routesRaw).map(mapRoute);
      const mappedStops = unwrapList(stopsRaw).map((s) => mapStop(s, mappedRoutes));
      setRoutes(mappedRoutes);
      setStops(mappedStops);
      setSchedules(unwrapList(schedulesRaw).map(mapSchedule));
      setNotifications(unwrapList(notifRaw).map(mapNotification));
      setKpis(kpisRaw || null);
      setCharts(chartsRaw || null);
      setVehicleLocations(Array.isArray(locsRaw) ? locsRaw : unwrapList(locsRaw));

      if (user.role === 'ADMIN') {
        try {
          const audit = await settingsApi.auditLogs({ size: 30 });
          setLogs(unwrapList(audit).map(mapAuditLog));
        } catch {
          setLogs([]);
        }
      } else {
        setLogs(
          unwrapList(notifRaw)
            .slice(0, 20)
            .map((n) => ({
              id: n.id,
              time: n.createdAt
                ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '',
              route: n.category || '',
              stop: '',
              event: n.title,
            }))
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to load operational data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Soft poll KPIs while authenticated (60s)
  useEffect(() => {
    if (!user || !getAccessToken()) return undefined;
    const id = setInterval(async () => {
      if (document.hidden) return;
      try {
        const [k, c, n] = await Promise.all([
          dashboardApi.kpis(),
          dashboardApi.charts(),
          notificationsApi.list(),
        ]);
        setKpis(k);
        setCharts(c);
        setNotifications(unwrapList(n).map(mapNotification));
      } catch {
        // ignore poll errors
      }
    }, 60000);
    return () => clearInterval(id);
  }, [user]);

  const passengersToday = kpis?.passengersToday ?? 0;
  const onTimePerformance = kpis?.onTimePercentage ?? 0;
  const averageSpeed = kpis?.averageSpeed ?? 0;
  const activeAlertsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const chartSeries = useMemo(() => {
    const volume = charts?.passengerVolume || charts?.dailySeries || [];
    return volume.map((p) => ({
      time: p.day || p.date || p.time,
      passengers: p.passengers ?? 0,
      date: p.date,
    }));
  }, [charts]);

  const availableStopNames = useMemo(
    () => stops.map((s) => s.name).sort(),
    [stops]
  );

  const addRoute = async (newRoute) => {
    const body = {
      code: newRoute.number || newRoute.code,
      name: newRoute.name,
      color: newRoute.color,
      startStop: newRoute.startStop,
      endStop: newRoute.endStop,
      intermediateStops: newRoute.intermediateStops || [],
      status: newRoute.status || 'Active',
      frequencyMinutes: Number(newRoute.frequency) || 15,
      busCount: Number(newRoute.buses) || 0,
      type: newRoute.type || 'Circular',
      direction: newRoute.direction || '',
    };
    await routesApi.create(body);
    showToast(`Route ${body.code} created`, 'success');
    await loadAll();
  };

  const deleteRoute = async (id) => {
    await routesApi.remove(id);
    showToast('Route deleted', 'success');
    await loadAll();
  };

  const addSchedule = async (payload) => {
    const items = Array.isArray(payload) ? payload : [payload];
    for (const newSchedule of items) {
      const body = {
        routeId: Number(newSchedule.routeId),
        serviceDate: newSchedule.serviceDate || new Date().toISOString().slice(0, 10),
        departureTime: newSchedule.departureTime || newSchedule.departure,
        arrivalTime: newSchedule.arrivalTime || newSchedule.arrival,
        weekdays: newSchedule.weekdays ?? (newSchedule.days || []).some((d) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(d)),
        weekends: newSchedule.weekends ?? (newSchedule.days || []).some((d) => ['Sat', 'Sun'].includes(d)),
        holidays: newSchedule.holidays ?? false,
        delayStatus: newSchedule.delayStatus || 'ON_TIME',
        status: newSchedule.status || 'SCHEDULED',
        driverId: newSchedule.driverId || null,
        vehicleId: newSchedule.vehicleId || null,
      };
      await scheduleApi.create(body);
    }
    showToast(
      items.length > 1 ? `${items.length} timetable runs created` : 'Schedule created',
      'success'
    );
    await loadAll();
  };

  const markNotificationRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await notificationsApi.markRead(id);
    } catch {
      showToast('Could not sync read state', 'warning');
      await loadAll();
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationsApi.markAllRead();
      showToast('All alerts marked as read.', 'success');
    } catch {
      showToast('Could not mark all read on server', 'warning');
      await loadAll();
    }
  };

  const clearLogs = () => setLogs([]);
  const restoreLogs = () => loadAll();

  const value = {
    routes,
    stops,
    schedules,
    notifications,
    logs,
    kpis,
    charts,
    chartSeries,
    vehicleLocations,
    passengersToday,
    onTimePerformance,
    averageSpeed,
    activeAlertsCount,
    toast,
    loading,
    error,
    refetch: loadAll,
    addRoute,
    deleteRoute,
    addSchedule,
    markNotificationRead,
    markAllNotificationsRead,
    clearLogs,
    restoreLogs,
    showToast,
    availableStopNames,
  };

  return (
    <TransitContext.Provider value={value}>{children}</TransitContext.Provider>
  );
}

export function useTransit() {
  const ctx = useContext(TransitContext);
  if (!ctx) throw new Error('useTransit must be used inside <TransitProvider>');
  return ctx;
}
