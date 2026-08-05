// ============================================================
// Dashboard/index.jsx — Main operational overview (API-backed)
// ============================================================

import {
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useTransit } from '../../context/TransitContext';
import AnimatedNumber from '../../components/common/AnimatedNumber';

export default function Dashboard() {
  const {
    routes,
    passengersToday,
    onTimePerformance,
    averageSpeed,
    activeAlertsCount,
    chartSeries,
    kpis,
    loading,
    error,
    refetch,
  } = useTransit();

  const onTimeColor = onTimePerformance > 85
    ? 'text-status-active'
    : onTimePerformance >= 75
    ? 'text-status-delayed'
    : 'text-status-critical';

  const onTimeBg = onTimePerformance > 85
    ? 'bg-status-active/10'
    : onTimePerformance >= 75
    ? 'bg-status-delayed/10'
    : 'bg-status-critical/10';

  if (loading && !kpis) {
    return (
      <div className="space-y-4">
        <h2 className="section-title">Operations Overview</h2>
        <p className="text-slate-400 text-sm">Loading live metrics from server…</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-28 animate-pulse bg-surface-light" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !kpis) {
    return (
      <div className="card space-y-3">
        <h2 className="section-title">Operations Overview</h2>
        <p className="text-status-critical text-sm">{error}</p>
        <button type="button" className="btn-primary w-fit" onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">Operations Overview</h2>
        <p className="section-subtitle">Live KNUST transit network status from TransitOps API</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div id="kpi-passengers" className="card flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
            <UsersIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Passengers Today</p>
            <p className="text-2xl font-bold mt-0.5 text-white">
              <AnimatedNumber value={passengersToday} />
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {kpis?.completedTrips ?? 0} completed trips · {kpis?.activeBuses ?? 0} active buses
            </p>
          </div>
        </div>

        <div id="kpi-ontime" className="card flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${onTimeBg}`}>
            <ClockIcon className={`w-5 h-5 ${onTimeColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">On-Time Rate</p>
            <p className={`text-2xl font-bold mt-0.5 ${onTimeColor}`}>
              <AnimatedNumber value={onTimePerformance} suffix="%" />
            </p>
            <p className="text-slate-500 text-xs mt-1">7-day rolling average</p>
          </div>
        </div>

        <div id="kpi-speed" className="card flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[#0A1628] border border-surface-border">
            <span className="material-symbols-outlined text-primary text-xl">speed</span>
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Avg Network Speed</p>
            <p className="text-2xl font-bold mt-0.5 text-white">
              <AnimatedNumber value={averageSpeed} suffix=" km/h" />
            </p>
            <p className="text-slate-500 text-xs mt-1">From trip metrics</p>
          </div>
        </div>

        <div id="kpi-alerts" className="card flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${activeAlertsCount > 0 ? 'bg-status-critical/10' : 'bg-status-active/10'}`}>
            {activeAlertsCount > 0 ? (
              <ExclamationTriangleIcon className="w-5 h-5 text-status-critical" />
            ) : (
              <BellIcon className="w-5 h-5 text-status-active" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Unread Alerts</p>
            {activeAlertsCount > 0 ? (
              <>
                <p className="text-2xl font-bold mt-0.5 text-status-critical">
                  <AnimatedNumber value={activeAlertsCount} /> Unread
                </p>
                <p className="text-slate-500 text-xs mt-1">Requires dispatcher attention</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold mt-0.5 text-status-active">0 Alerts</p>
                <div className="mt-1">
                  <span className="badge-active">All Clear</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-slate-100 font-semibold flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-primary" />
              Passenger Volume (7 days)
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Boardings from TripMetric aggregates</p>
          </div>
          <span className="badge-active">API</span>
        </div>

        {chartSeries.length === 0 ? (
          <p className="text-slate-500 text-sm py-12 text-center">No chart data yet for this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3048" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0F1E35', border: '1px solid #1E3048', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8', fontSize: 12 }}
                itemStyle={{ color: '#1D9E75' }}
              />
              <defs>
                <linearGradient id="passengerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="passengers"
                stroke="#1D9E75"
                strokeWidth={2}
                fill="url(#passengerGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3 className="text-slate-100 font-semibold mb-4">Route Status</h3>
        {routes.length === 0 ? (
          <p className="text-slate-500 text-sm">No routes returned from the API.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.map((route) => (
              <div key={route.id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                <div>
                  <p className="text-slate-200 text-sm font-medium">{route.name}</p>
                  <p className="text-slate-500 text-xs">{route.number} · {route.type}</p>
                </div>
                <span className={route.status === 'Active' ? 'badge-active' : 'badge-delayed'}>
                  {route.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
