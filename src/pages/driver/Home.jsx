// ============================================================
// Driver Home — today's assignment / shift
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TruckIcon,
  MapIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { driverMeApi } from '../../services/api';
import { useTransit } from '../../context/TransitContext';

export default function DriverHome() {
  const { showToast } = useTransit();
  const [profile, setProfile] = useState(null);
  const [shift, setShift] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [p, s, a] = await Promise.all([
        driverMeApi.profile(),
        driverMeApi.shift(),
        driverMeApi.attendanceToday(),
      ]);
      setProfile(p);
      setShift(s);
      setAttendance(a);
    } catch (err) {
      setError(err.message || 'Failed to load today\'s assignment');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCheckIn = async () => {
    setBusy(true);
    try {
      const a = await driverMeApi.checkIn();
      setAttendance(a);
      showToast('Checked in', 'success');
    } catch (err) {
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleCheckOut = async () => {
    setBusy(true);
    try {
      const a = await driverMeApi.checkOut();
      setAttendance(a);
      showToast('Checked out', 'success');
    } catch (err) {
      showToast(err.message || 'Check-out failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="text-slate-400 text-sm">Loading today’s assignment…</p>;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-status-critical text-sm">{error}</p>
        <button type="button" className="btn-primary text-sm" onClick={load}>Retry</button>
      </div>
    );
  }

  const checkedIn = !!(attendance?.checkInAt || attendance?.checkInTime);
  const checkedOut = !!(attendance?.checkOutAt || attendance?.checkOutTime);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">
          Hello{profile?.firstName ? `, ${profile.firstName}` : ''}
        </h1>
        <p className="text-slate-400 text-sm mt-1">Your assignment for today</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card space-y-2">
          <div className="flex items-center gap-2 text-primary text-sm font-medium">
            <MapIcon className="w-5 h-5" />
            Assigned route
          </div>
          <p className="text-slate-100 font-semibold text-lg">
            {shift?.routeNumber || profile?.assignedRouteCode || '—'}
          </p>
          <p className="text-slate-400 text-sm">
            {shift?.routeName || profile?.assignedRouteName || 'No route assigned'}
          </p>
        </div>

        <div className="card space-y-2">
          <div className="flex items-center gap-2 text-primary text-sm font-medium">
            <TruckIcon className="w-5 h-5" />
            Vehicle
          </div>
          <p className="text-slate-100 font-semibold text-lg">
            {shift?.busNumber || profile?.assignedVehicle || '—'}
          </p>
          <p className="text-slate-400 text-sm">
            Depot: {profile?.assignedDepot || '—'}
          </p>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center gap-2 text-primary text-sm font-medium">
          <ClockIcon className="w-5 h-5" />
          Shift
        </div>
        <p className="text-slate-100">
          {shift?.shiftName || 'Shift'} · {shift?.startTime || '—'} – {shift?.endTime || '—'}
        </p>
        <p className="text-slate-400 text-sm">Status: {shift?.status || attendance?.status || '—'}</p>
        {Array.isArray(shift?.stops) && shift.stops.length > 0 && (
          <p className="text-slate-500 text-xs">Stops: {shift.stops.join(' → ')}</p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {!checkedIn && (
            <button type="button" disabled={busy} className="btn-primary text-sm" onClick={handleCheckIn}>
              Check in
            </button>
          )}
          {checkedIn && !checkedOut && (
            <button type="button" disabled={busy} className="btn-ghost text-sm" onClick={handleCheckOut}>
              Check out
            </button>
          )}
          {checkedIn && (
            <span className="inline-flex items-center gap-1 text-primary text-sm">
              <CheckCircleIcon className="w-4 h-4" />
              In: {attendance?.checkInTime || 'recorded'}
              {checkedOut ? ` · Out: ${attendance?.checkOutTime || 'recorded'}` : ''}
            </span>
          )}
        </div>
      </div>

      <Link to="/driver/trip" className="inline-flex text-primary text-sm font-medium hover:underline">
        Open live trip →
      </Link>
    </div>
  );
}
