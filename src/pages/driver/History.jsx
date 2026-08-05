// ============================================================
// Driver History — own attendance + incidents
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { driverMeApi } from '../../services/api';

export default function DriverHistory() {
  const [attendance, setAttendance] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [a, i] = await Promise.all([
        driverMeApi.attendance(),
        driverMeApi.incidents(),
      ]);
      setAttendance(Array.isArray(a) ? a : []);
      setIncidents(Array.isArray(i) ? i : []);
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-slate-400 text-sm">Loading history…</p>;
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-status-critical text-sm">{error}</p>
        <button type="button" className="btn-primary text-sm" onClick={load}>Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <ClockIcon className="w-6 h-6 text-primary" />
          My history
        </h1>
        <p className="text-slate-400 text-sm mt-1">Your attendance and reported incidents only</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Attendance</h2>
        {attendance.length === 0 ? (
          <p className="text-slate-500 text-sm">No attendance records yet.</p>
        ) : (
          <ul className="space-y-2">
            {attendance.map((row) => (
              <li key={row.id || row.date} className="card text-sm flex flex-wrap gap-x-4 gap-y-1">
                <span className="text-slate-200 font-medium">{row.date || '—'}</span>
                <span className="text-slate-400">In: {row.checkInTime || '—'}</span>
                <span className="text-slate-400">Out: {row.checkOutTime || '—'}</span>
                <span className="text-slate-500">{row.status || ''}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Incidents</h2>
        {incidents.length === 0 ? (
          <p className="text-slate-500 text-sm">No incidents reported.</p>
        ) : (
          <ul className="space-y-2">
            {incidents.map((row) => (
              <li key={row.id} className="card text-sm space-y-1">
                <p className="text-slate-200 font-medium">{row.title || row.category || 'Incident'}</p>
                <p className="text-slate-400">{row.description || row.details || ''}</p>
                <p className="text-slate-500 text-xs">
                  {row.severity || ''} {row.createdAt ? `· ${new Date(row.createdAt).toLocaleString()}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
