// ============================================================
// Schedules/index.jsx — Transit Schedule Management
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState, useMemo } from 'react';
import {
  CalendarDaysIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTransit } from '../../context/TransitContext';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Schedules() {
  const { routes, schedules, addSchedule, deleteSchedule, updateSchedule, showToast } = useTransit();

  // Active day index (0 = Mon, ..., 6 = Sun)
  // Default to today's day (shifted: 0=Sun → Mon=0, Sun=6)
  const todayIdx = useMemo(() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  }, []);

  const [activeDay, setActiveDay] = useState(todayIdx);
  const [selectedRouteId, setSelectedRouteId] = useState('All');

  // Inline New Schedule card toggle & form fields
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    routeId: routes[0]?.id || '',
    selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '08:00',
    endTime: '12:00',
    frequency: '30',
    notes: '',
  });

  // Calculate the dates for the current week dynamically
  const getDayDateLabel = (dayIdx) => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...
    const diffToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);
    
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + dayIdx);
    
    // Format: "Day DD Month" (e.g. "Monday 27 July")
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNum = targetDate.getDate();
    const monthName = targetDate.toLocaleDateString('en-US', { month: 'long' });
    
    return `${dayName} ${dayNum} ${monthName}`;
  };

  const activeDayName = DAYS_OF_WEEK[activeDay];
  const dateHeading = getDayDateLabel(activeDay);

  // Filter schedules for the selected route and day
  const filteredSchedules = useMemo(() => {
    return schedules
      .filter((s) => {
        const matchesDay = s.days.includes(activeDayName);
        const matchesRoute = selectedRouteId === 'All' || s.routeId === selectedRouteId;
        return matchesDay && matchesRoute;
      })
      // Sort chronologically
      .sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }, [schedules, activeDayName, selectedRouteId]);

  // Handle new schedule generator
  const handleSaveSchedule = () => {
    const { routeId, selectedDays, startTime, endTime, frequency, notes } = form;
    if (!routeId || selectedDays.length === 0 || !startTime || !endTime || !frequency) return;

    // Convert start and end times to minutes
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const freq = Number(frequency);

    if (startMin > endMin || freq <= 0) return;

    // Generate schedule entries
    const generated = [];

    for (let current = startMin; current <= endMin; current += freq) {
      const h = Math.floor(current / 60) % 24;
      const m = current % 60;
      const departStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      
      // Compute arrival time (+25 min)
      const arrivalMin = current + 25;
      const arrH = Math.floor(arrivalMin / 60) % 24;
      const arrM = arrivalMin % 60;
      const arriveStr = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;

      // Determine status based on time
      let status = 'On Time';
      const now = new Date();
      const currentMinNow = now.getHours() * 60 + now.getMinutes();

      if (current < currentMinNow) {
        status = 'Completed';
      } else if (current <= currentMinNow + 15) {
        status = 'Running';
      }

      generated.push({
        routeId,
        days: selectedDays,
        departureTime: departStr,
        arrivalTime: arriveStr,
        status,
        notes: notes || 'Generated run',
      });
    }

    // Persist generated runs via API (single batch)
    addSchedule(generated);
    setIsAddOpen(false);
    // Reset form
    setForm({
      routeId: routes[0]?.id || '',
      selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      startTime: '08:00',
      endTime: '12:00',
      frequency: '30',
      notes: '',
    });
  };

  const toggleDaySelection = (day) => {
    setForm((prev) => {
      const days = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day];
      return { ...prev, selectedDays: days };
    });
  };

  return (
    <div className="space-y-6">
      
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="section-title">Schedules — {dateHeading}</h2>
          <p className="section-subtitle">
            Manage and view daily timetables for campus shuttle routes
          </p>
        </div>
        <button
          type="button"
          id="schedules-add-btn"
          className="btn-primary flex items-center gap-2 cursor-pointer"
          onClick={() => setIsAddOpen((prev) => !prev)}
        >
          <PlusIcon className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {/* ── INLINE NEW SCHEDULE CARD (Slides down with transition) ── */}
      <div
        className={clsx(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isAddOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="card border border-primary/20 bg-surface-light p-5 mb-6">
          <h3 className="text-slate-100 font-bold text-sm mb-4">New Schedule Generator</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            
            {/* Route Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Route</label>
              <select
                value={form.routeId}
                onChange={(e) => setForm((prev) => ({ ...prev, routeId: e.target.value }))}
                className="input bg-surface"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>{r.number} — {r.name}</option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Frequency</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={form.frequency}
                  onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value }))}
                  className="input bg-surface pr-16"
                />
                <span className="absolute right-4 text-xs font-medium text-slate-500">minutes</span>
              </div>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                className="input bg-surface"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                className="input bg-surface"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Peak hour reinforcement runs"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="input bg-surface"
              />
            </div>

            {/* Days multi-select checkboxes */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-2">Select Target Days</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS_OF_WEEK.map((day) => {
                  const selected = form.selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDaySelection(day)}
                      className={clsx(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer border",
                        selected
                          ? "bg-primary border-primary text-white shadow-sm shadow-primary/30"
                          : "bg-surface text-slate-400 border-surface-border hover:text-slate-200"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="flex gap-3 border-t border-surface-border pt-4 mt-4">
            <button
              type="button"
              className="btn-ghost flex-1 py-2 justify-center text-xs font-bold"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary flex-1 py-2 justify-center text-xs font-bold bg-primary hover:bg-primary/95 text-white"
              onClick={handleSaveSchedule}
            >
              Generate Runs
            </button>
          </div>
        </div>
      </div>

      {/* ── Day Navigation Bar ────────────────────────────── */}
      <div className="card flex items-center gap-3 py-3">
        {/* Scroll previous day */}
        <button
          type="button"
          id="schedules-prev"
          className="btn-ghost p-2 cursor-pointer"
          onClick={() => setActiveDay((d) => (d - 1 + 7) % 7)}
          aria-label="Previous day"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {/* Day tab options */}
        <div className="flex gap-1.5 flex-1 overflow-x-auto">
          {DAYS_OF_WEEK.map((day, index) => (
            <button
              key={day}
              type="button"
              id={`schedules-day-tab-${day}`}
              onClick={() => setActiveDay(index)}
              className={clsx(
                "flex-1 min-w-[50px] py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer",
                index === activeDay
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-400 hover:bg-surface-light hover:text-slate-200'
              )}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Scroll next day */}
        <button
          type="button"
          id="schedules-next"
          className="btn-ghost p-2 cursor-pointer"
          onClick={() => setActiveDay((d) => (d + 1) % 7)}
          aria-label="Next day"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* ── Route Selection Dropdown ───────────────────────── */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter Route:</label>
        <select
          id="schedules-route-select"
          value={selectedRouteId}
          onChange={(e) => setSelectedRouteId(e.target.value)}
          className="input w-64 bg-surface-light border-surface-border text-xs"
        >
          <option value="All">All Routes</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>{r.number} — {r.name}</option>
          ))}
        </select>
      </div>

      {/* ── Schedules Timetable List ────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        {filteredSchedules.length > 0 ? (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-slate-900/50">
                  <th className="px-5 py-3.5 text-slate-500 font-bold text-xs uppercase tracking-wider">Departure</th>
                  <th className="px-5 py-3.5 text-slate-500 font-bold text-xs uppercase tracking-wider">Route</th>
                  <th className="px-5 py-3.5 text-slate-500 font-bold text-xs uppercase tracking-wider">From → To</th>
                  <th className="px-5 py-3.5 text-slate-500 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-slate-500 font-bold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((run) => {
                  const routeObj = routes.find((r) => r.id === run.routeId);
                  return (
                    <tr
                      key={run.id}
                      className="border-b border-surface-border last:border-0 hover:bg-surface-light/40 transition-colors"
                    >
                      {/* Departure */}
                      <td className="px-5 py-3.5 font-mono text-slate-200 flex items-center gap-2 font-semibold">
                        <ClockIcon className="w-4 h-4 text-slate-500" />
                        {run.departureTime}
                      </td>

                      {/* Route */}
                      <td className="px-5 py-3.5">
                        {routeObj ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded"
                              style={{ backgroundColor: `${routeObj.color}15`, color: routeObj.color }}
                            >
                              {routeObj.number}
                            </span>
                            <span className="text-slate-300 font-medium text-xs truncate max-w-[120px] inline-block">
                              {routeObj.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs font-semibold">{run.routeId}</span>
                        )}
                      </td>

                      {/* Path direction */}
                      <td className="px-5 py-3.5 text-xs text-slate-400 font-medium">
                        {routeObj ? (
                          <span>{routeObj.startStop} → {routeObj.endStop}</span>
                        ) : (
                          <span>Route not found</span>
                        )}
                      </td>

                      {/* Status pill with custom animations/styles */}
                      <td className="px-5 py-3.5">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            run.status === 'On Time' && 'bg-status-active/10 text-primary border-primary/20',
                            run.status === 'Running' && 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse',
                            run.status === 'Delayed' && 'bg-status-delayed/10 text-status-delayed border-status-delayed/20',
                            run.status === 'Completed' && 'bg-slate-700/10 text-slate-500 border-slate-700/25'
                          )}
                        >
                          {run.status === 'Running' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                          )}
                          {run.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="text-xs text-primary hover:underline font-bold cursor-pointer"
                            onClick={async () => {
                              try {
                                const next = run.delayStatus === 'DELAYED' ? 'ON_TIME' : 'DELAYED';
                                await updateSchedule(run.id, {
                                  delayStatus: next,
                                  delayMinutes: next === 'DELAYED' ? (run.delayMinutes || 5) : 0,
                                  status: next === 'DELAYED' ? 'DELAYED' : 'SCHEDULED',
                                });
                              } catch (err) {
                                showToast(err.message || 'Update failed', 'error');
                              }
                            }}
                          >
                            Toggle delay
                          </button>
                          <button
                            type="button"
                            className="text-xs text-status-critical hover:underline font-bold cursor-pointer"
                            onClick={async () => {
                              if (!window.confirm('Delete this schedule run?')) return;
                              try {
                                await deleteSchedule(run.id);
                              } catch (err) {
                                showToast(err.message || 'Delete failed', 'error');
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty state */
          <div className="py-14 text-center">
            <CalendarDaysIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold text-sm">No scheduled runs found</p>
            <p className="text-slate-500 text-xs mt-1">There are no runs registered for Route on this day.</p>
            <button
              type="button"
              className="btn-primary mt-4 mx-auto text-xs font-bold"
              onClick={() => setIsAddOpen(true)}
            >
              Create New Timetable
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
