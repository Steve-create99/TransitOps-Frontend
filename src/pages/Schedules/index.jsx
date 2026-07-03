// ============================================================
// Schedules/index.jsx — Transit schedule management page
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { CalendarDaysIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// ── Mock schedule data ───────────────────────────────────────
const scheduleSlots = [
  { id: 'SCH-001', route: 'RT-01 Central — Airport',   depart: '06:00', arrive: '06:45', bus: 'BUS-102', status: 'On Time',  badge: 'badge-active'   },
  { id: 'SCH-002', route: 'RT-07 North — City Loop',    depart: '06:15', arrive: '07:10', bus: 'BUS-087', status: 'Delayed',  badge: 'badge-delayed'  },
  { id: 'SCH-003', route: 'RT-14 East — Harbor Bridge', depart: '06:30', arrive: '07:15', bus: 'BUS-054', status: 'On Time',  badge: 'badge-active'   },
  { id: 'SCH-004', route: 'RT-22 South — University',   depart: '06:45', arrive: '07:30', bus: 'BUS-031', status: 'Critical', badge: 'badge-critical' },
  { id: 'SCH-005', route: 'RT-30 West — Industrial',    depart: '07:00', arrive: '07:50', bus: 'BUS-119', status: 'On Time',  badge: 'badge-active'   },
  { id: 'SCH-006', route: 'RT-38 Downtown — Riverfront',depart: '07:15', arrive: '07:55', bus: 'BUS-076', status: 'On Time',  badge: 'badge-active'   },
];

// ── Day labels for the week selector ────────────────────────
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Schedules — shows today's departure/arrival schedule.
 * Week navigation and per-trip status badges.
 */
export default function Schedules() {
  // Today is Thursday (index 3) for demo purposes
  const activeDay = 3;

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="section-title">Schedules</h2>
          <p className="section-subtitle">Weekly departure and arrival timetable</p>
        </div>
        <button type="button" className="btn-primary" id="schedules-add">
          <PlusIcon className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {/* ── Week Navigation ───────────────────────────────── */}
      <div className="card flex items-center gap-3">
        <button type="button" className="btn-ghost p-2" id="schedules-prev-week" aria-label="Previous week">
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {/* Day tabs */}
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {days.map((day, index) => (
            <button
              key={day}
              type="button"
              className={`
                flex-1 min-w-[48px] py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${index === activeDay
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:bg-surface-light hover:text-slate-100'
                }
              `}
            >
              {day}
            </button>
          ))}
        </div>

        <button type="button" className="btn-ghost p-2" id="schedules-next-week" aria-label="Next week">
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* ── Schedule Table ────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">Route</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Depart</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Arrive</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide hidden md:table-cell">Bus</th>
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {scheduleSlots.map((slot) => (
              <tr key={slot.id} className="border-b border-surface-border last:border-0 hover:bg-surface-light/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <CalendarDaysIcon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-slate-200 font-medium">{slot.route}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-300 hidden sm:table-cell">{slot.depart}</td>
                <td className="px-5 py-3 text-slate-300 hidden sm:table-cell">{slot.arrive}</td>
                <td className="px-5 py-3 text-slate-500 hidden md:table-cell">{slot.bus}</td>
                <td className="px-5 py-3">
                  <span className={slot.badge}>{slot.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
