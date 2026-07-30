// ============================================================
// Dashboard/index.jsx — Main operational overview
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import {
  TruckIcon,
  MapIcon,
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

// ── Mock chart data — hourly passenger counts ─────────────────
const passengerData = [
  { time: '06:00', passengers: 820  },
  { time: '07:00', passengers: 2300 },
  { time: '08:00', passengers: 4100 },
  { time: '09:00', passengers: 3200 },
  { time: '10:00', passengers: 1800 },
  { time: '11:00', passengers: 1500 },
  { time: '12:00', passengers: 2100 },
  { time: '13:00', passengers: 1900 },
  { time: '14:00', passengers: 1600 },
  { time: '15:00', passengers: 2400 },
  { time: '16:00', passengers: 3900 },
  { time: '17:00', passengers: 4600 },
  { time: '18:00', passengers: 3100 },
];

/**
 * Dashboard — KPI overview grid + passenger trend chart.
 * Dynamically updates using state synchronized from TransitContext.
 */
export default function Dashboard() {
  const {
    routes,
    passengersToday,
    onTimePerformance,
    averageSpeed,
    activeAlertsCount,
  } = useTransit();

  // Dynamic status-colored tokens for On-Time Performance
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

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────── */}
      <div>
        <h2 className="section-title">Operations Overview</h2>
        <p className="section-subtitle">Real-time KNUST transit network status — today</p>
      </div>

      {/* ── KPI Cards Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* KPI 1: Passengers Today */}
        <div id="kpi-passengers" className="card flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
            <UsersIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Passengers Today</p>
            <p className="text-2xl font-bold mt-0.5 text-white">
              <AnimatedNumber value={passengersToday} />
            </p>
            <p className="text-primary text-xs mt-1 font-semibold flex items-center gap-1">
              <span>↑ +8% vs yesterday</span>
            </p>
          </div>
        </div>

        {/* KPI 2: On-Time Performance */}
        <div id="kpi-ontime" className="card flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${onTimeBg}`}>
            <ClockIcon className={`w-5 h-5 ${onTimeColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">On-Time Rate</p>
            <p className={`text-2xl font-bold mt-0.5 ${onTimeColor}`}>
              <AnimatedNumber value={onTimePerformance} suffix="%" />
            </p>
            <p className="text-slate-500 text-xs mt-1">Fluctuating live</p>
          </div>
        </div>

        {/* KPI 3: Average Network Speed */}
        <div id="kpi-speed" className="card flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[#0A1628] border border-surface-border">
            <span className="material-symbols-outlined text-primary text-xl">speed</span>
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Avg Network Speed</p>
            <p className="text-2xl font-bold mt-0.5 text-white">
              <AnimatedNumber value={averageSpeed} suffix=" km/h" />
            </p>
            <p className="text-slate-500 text-xs mt-1">Speedometer tracking</p>
          </div>
        </div>

        {/* KPI 4: Active Alerts */}
        <div id="kpi-alerts" className="card flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${activeAlertsCount > 0 ? 'bg-status-critical/10' : 'bg-status-active/10'}`}>
            {activeAlertsCount > 0 ? (
              <ExclamationTriangleIcon className="w-5 h-5 text-status-critical" />
            ) : (
              <BellIcon className="w-5 h-5 text-status-active" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Active Alerts</p>
            {activeAlertsCount > 0 ? (
              <>
                <p className="text-2xl font-bold mt-0.5 text-status-critical">
                  <AnimatedNumber value={activeAlertsCount} /> Active
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

      {/* ── Passenger Volume Chart ────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-slate-100 font-semibold flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-primary" />
              Hourly Passenger Volume
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Total boardings across all routes</p>
          </div>
          <span className="badge-active">Live</span>
        </div>

        {/* Recharts responsive area chart */}
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={passengerData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                <stop offset="5%"  stopColor="#1D9E75" stopOpacity={0.25} />
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
      </div>

      {/* ── Route Status Table ─────────────────────────────── */}
      <div className="card">
        <h3 className="text-slate-100 font-semibold mb-4">Route Status</h3>
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
      </div>

    </div>
  );
}
