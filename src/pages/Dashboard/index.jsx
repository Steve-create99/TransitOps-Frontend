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
} from '@heroicons/react/24/outline';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

// ── Mock KPI data ────────────────────────────────────────────
const kpiCards = [
  {
    id: 'kpi-active-routes',
    label:   'Active Routes',
    value:   '42',
    change:  '+3 from yesterday',
    icon:    MapIcon,
    color:   'text-status-active',
    bgColor: 'bg-status-active/10',
    badge:   'badge-active',
  },
  {
    id: 'kpi-buses-on-road',
    label:   'Buses On Road',
    value:   '186',
    change:  '92% of fleet',
    icon:    TruckIcon,
    color:   'text-primary',
    bgColor: 'bg-primary/10',
    badge:   'badge-active',
  },
  {
    id: 'kpi-delayed',
    label:   'Delayed',
    value:   '7',
    change:  '4 critical',
    icon:    ClockIcon,
    color:   'text-status-delayed',
    bgColor: 'bg-status-delayed/10',
    badge:   'badge-delayed',
  },
  {
    id: 'kpi-incidents',
    label:   'Incidents Today',
    value:   '2',
    change:  'Under review',
    icon:    ExclamationTriangleIcon,
    color:   'text-status-critical',
    bgColor: 'bg-status-critical/10',
    badge:   'badge-critical',
  },
];

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

// ── Reusable KPI Card ────────────────────────────────────────
function KpiCard({ id, label, value, change, icon: Icon, color, bgColor }) {
  return (
    <div id={id} className="card flex items-start gap-4">
      {/* Icon badge */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>

      <div className="min-w-0">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
        <p className="text-slate-500 text-xs mt-1 truncate">{change}</p>
      </div>
    </div>
  );
}

/**
 * Dashboard — KPI overview grid + passenger trend chart.
 * All data is currently mock; replace with API calls in Phase 2.
 */
export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────── */}
      <div>
        <h2 className="section-title">Operations Overview</h2>
        <p className="section-subtitle">Real-time transit network status — today</p>
      </div>

      {/* ── KPI Cards Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.id} {...card} />
        ))}
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
            {/* Grid lines */}
            <CartesianGrid strokeDasharray="3 3" stroke="#1E3048" />
            {/* X axis — time labels */}
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            {/* Y axis — count */}
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            {/* Tooltip */}
            <Tooltip
              contentStyle={{ background: '#0F1E35', border: '1px solid #1E3048', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8', fontSize: 12 }}
              itemStyle={{ color: '#1D9E75' }}
            />
            {/* Gradient fill for area */}
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

      {/* ── Route Status Table Placeholder ────────────────── */}
      <div className="card">
        <h3 className="text-slate-100 font-semibold mb-4">Route Status</h3>
        <div className="space-y-3">
          {[
            { id: 'RT-01', name: 'Central — Airport',   status: 'Active',   badge: 'badge-active'  },
            { id: 'RT-07', name: 'North — City Loop',    status: 'Delayed',  badge: 'badge-delayed' },
            { id: 'RT-14', name: 'East — Harbor Bridge', status: 'Active',   badge: 'badge-active'  },
            { id: 'RT-22', name: 'South — University',   status: 'Critical', badge: 'badge-critical'},
          ].map((route) => (
            <div key={route.id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
              <div>
                <p className="text-slate-200 text-sm font-medium">{route.name}</p>
                <p className="text-slate-500 text-xs">{route.id}</p>
              </div>
              <span className={route.badge}>{route.status}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
