// ============================================================
// Schedules/index.jsx — Transit schedule management page
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState, useRef } from 'react';
import {
  CalendarDaysIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useTransit } from '../../context/TransitContext';

// ── Day labels ───────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ── New Schedule Modal ───────────────────────────────────────
function NewScheduleModal({ onClose, onSave, routes }) {
  const [form, setForm] = useState({
    routeId:       routes[0]?.id ?? '',
    days:          [],
    departureTime: '07:00',
    arrivalTime:   '07:30',
    status:        'Active',
  });

  // Helper to update a single field
  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  // Toggle a day on/off in the multi-select
  const toggleDay = (day) => {
    set(
      'days',
      form.days.includes(day)
        ? form.days.filter((d) => d !== day)
        : [...form.days, day]
    );
  };

  const handleSave = () => {
    if (!form.routeId || form.days.length === 0) return;
    onSave(form);
    onClose();
  };

  // Close on backdrop click
  const backdropRef = useRef();
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-slate-100 font-semibold text-base">New Schedule</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">

          {/* Route selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Route</label>
            <select
              id="schedule-modal-route"
              value={form.routeId}
              onChange={(e) => set('routeId', e.target.value)}
              className="input"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.number} — {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Day multi-select */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Days</label>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map((day) => {
                const selected = form.days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    id={`schedule-day-${day}`}
                    onClick={() => toggleDay(day)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                      ${selected
                        ? 'bg-primary text-white shadow-sm shadow-primary/30'
                        : 'bg-surface-light text-slate-400 hover:text-slate-200 border border-surface-border'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {form.days.length === 0 && (
              <p className="text-xs text-amber-400/80 mt-1">Select at least one day.</p>
            )}
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Departure Time</label>
              <input
                id="schedule-modal-depart"
                type="time"
                value={form.departureTime}
                onChange={(e) => set('departureTime', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Arrival Time</label>
              <input
                id="schedule-modal-arrive"
                type="time"
                value={form.arrivalTime}
                onChange={(e) => set('arrivalTime', e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
            <div className="flex gap-4">
              {['Active', 'Inactive'].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="schedule-status"
                    value={s}
                    checked={form.status === s}
                    onChange={() => set('status', s)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-slate-300">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-border">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            type="button"
            id="schedule-modal-save"
            onClick={handleSave}
            className="btn-primary"
            disabled={!form.routeId || form.days.length === 0}
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Schedules Page ──────────────────────────────────────
export default function Schedules() {
  const { routes, schedules, addSchedule } = useTransit();

  // Active day tab — default to today's day index (Mon=0…Sun=6)
  const todayIdx = (new Date().getDay() + 6) % 7; // JS: 0=Sun → shift to Mon=0
  const [activeDay, setActiveDay] = useState(todayIdx);

  // Modal
  const [showModal, setShowModal] = useState(false);

  // ── Filter schedules for the selected day ────────────────
  const selectedDay = DAYS[activeDay];
  const daySchedules = schedules.filter((s) => s.days.includes(selectedDay));

  // Resolve route object from schedule.routeId
  const routeMap = Object.fromEntries(routes.map((r) => [r.id, r]));

  // Status badge helper
  const scheduleBadge = (status) =>
    status === 'Active' ? 'badge-active' : 'badge-delayed';

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="section-title">Schedules</h2>
          <p className="section-subtitle">
            KNUST campus shuttle timetable · {daySchedules.length} trip{daySchedules.length !== 1 ? 's' : ''} on {selectedDay}
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          id="schedules-add"
          onClick={() => setShowModal(true)}
        >
          <PlusIcon className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {/* ── Day Navigation ────────────────────────────────── */}
      <div className="card flex items-center gap-3">
        {/* Previous day */}
        <button
          type="button"
          id="schedules-prev-day"
          className="btn-ghost p-2"
          onClick={() => setActiveDay((d) => (d - 1 + 7) % 7)}
          aria-label="Previous day"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>

        {/* Day tab buttons */}
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {DAYS.map((day, index) => (
            <button
              key={day}
              type="button"
              id={`day-tab-${day}`}
              onClick={() => setActiveDay(index)}
              className={`
                flex-1 min-w-[48px] py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${index === activeDay
                  ? 'bg-primary text-white shadow-sm shadow-primary/30'
                  : 'text-slate-400 hover:bg-surface-light hover:text-slate-100'
                }
              `}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Next day */}
        <button
          type="button"
          id="schedules-next-day"
          className="btn-ghost p-2"
          onClick={() => setActiveDay((d) => (d + 1) % 7)}
          aria-label="Next day"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* ── Schedule Table ─────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        {daySchedules.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">Route</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Days</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Depart</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Arrive</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {daySchedules.map((slot) => {
                const route = routeMap[slot.routeId];
                return (
                  <tr
                    key={slot.id}
                    className="border-b border-surface-border last:border-0 hover:bg-surface-light/50 transition-colors"
                  >
                    {/* Route info */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <CalendarDaysIcon className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <p className="text-slate-200 font-medium text-sm">
                            {route ? route.name : slot.routeId}
                          </p>
                          {route && (
                            <p className="text-slate-500 text-xs">{route.number}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Days chips */}
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {slot.days.map((d) => (
                          <span
                            key={d}
                            className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              d === selectedDay
                                ? 'bg-primary/20 text-primary'
                                : 'bg-surface-light text-slate-500'
                            }`}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Departure */}
                    <td className="px-5 py-3 text-slate-300 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
                        {slot.departureTime}
                      </div>
                    </td>

                    {/* Arrival */}
                    <td className="px-5 py-3 text-slate-300 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
                        {slot.arrivalTime}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <span className={scheduleBadge(slot.status)}>{slot.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Empty state for selected day */
          <div className="py-14 text-center">
            <CalendarDaysIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No schedules for {selectedDay}.</p>
            <button
              type="button"
              className="btn-primary mt-4 mx-auto text-xs"
              onClick={() => setShowModal(true)}
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Add one now
            </button>
          </div>
        )}
      </div>

      {/* ── All Schedules count ───────────────────────────── */}
      <p className="text-xs text-slate-600 text-right">
        Total schedules: {schedules.length}
      </p>

      {/* ── New Schedule Modal ─────────────────────────────── */}
      {showModal && (
        <NewScheduleModal
          onClose={() => setShowModal(false)}
          onSave={addSchedule}
          routes={routes}
        />
      )}
    </div>
  );
}
