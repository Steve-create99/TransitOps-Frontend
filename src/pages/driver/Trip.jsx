// ============================================================
// Driver Trip — active trip status
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { MapIcon } from '@heroicons/react/24/outline';
import { driverMeApi } from '../../services/api';
import { useTransit } from '../../context/TransitContext';

const STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'ON_BREAK', 'COMPLETED'];

export default function DriverTrip() {
  const { showToast } = useTransit();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const t = await driverMeApi.activeTrip();
      setTrip(t);
    } catch (err) {
      setError(err.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (status) => {
    setBusy(true);
    try {
      const t = await driverMeApi.tripStatus(status);
      setTrip(t);
      showToast(`Trip status: ${status}`, 'success');
    } catch (err) {
      showToast(err.message || 'Could not update trip status', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-slate-400 text-sm">Loading trip…</p>;
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-status-critical text-sm">{error}</p>
        <button type="button" className="btn-primary text-sm" onClick={load}>Retry</button>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="card max-w-xl">
        <p className="text-slate-300">No active trip right now.</p>
        <p className="text-slate-500 text-sm mt-1">Check back when you have an assignment, or update status below if available.</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={busy}
              className="btn-ghost text-xs"
              onClick={() => updateStatus(s)}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <MapIcon className="w-6 h-6 text-primary" />
          Live trip
        </h1>
        <p className="text-slate-400 text-sm mt-1">Update your run status for dispatch</p>
      </div>

      <div className="card space-y-3">
        <p className="text-slate-100 font-semibold text-lg">
          {trip.routeNumber || trip.routeId || 'Route'} · {trip.routeName || ''}
        </p>
        <p className="text-slate-400 text-sm">Bus: {trip.busNumber || '—'}</p>
        <p className="text-slate-200 text-sm">
          Status: <span className="text-primary font-medium">{trip.status || '—'}</span>
        </p>
        <p className="text-slate-400 text-sm">
          Stops: {trip.completedStopsCount ?? 0} / {trip.totalStopsCount ?? 0}
          {trip.nextStopName ? ` · Next: ${trip.nextStopName}` : ''}
        </p>
        {Array.isArray(trip.stops) && trip.stops.length > 0 && (
          <p className="text-slate-500 text-xs">{trip.stops.join(' → ')}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy || trip.status === s}
            className={trip.status === s ? 'btn-primary text-xs' : 'btn-ghost text-xs'}
            onClick={() => updateStatus(s)}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
    </div>
  );
}
