// ============================================================
// Driver Profile — view/update phone + logout
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { driverMeApi } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { useTransit } from '../../context/TransitContext';

export default function DriverProfile() {
  const { logout } = useAppContext();
  const { showToast } = useTransit();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const p = await driverMeApi.profile();
      setProfile(p);
      setPhone(p.phone || '');
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const p = await driverMeApi.updateProfile({ phone: phone.trim() });
      setProfile(p);
      showToast('Profile updated', 'success');
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (loading) return <p className="text-slate-400 text-sm">Loading profile…</p>;
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-status-critical text-sm">{error}</p>
        <button type="button" className="btn-primary text-sm" onClick={load}>Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <UserCircleIcon className="w-6 h-6 text-primary" />
          Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">Your driver account details</p>
      </div>

      <div className="card space-y-2 text-sm">
        <p className="text-slate-100 font-medium text-base">
          {[profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Driver'}
        </p>
        <p className="text-slate-400">{profile?.email}</p>
        <p className="text-slate-500">Employee ID: {profile?.employeeId || '—'}</p>
        <p className="text-slate-500">License: {profile?.licenseNumber || '—'}</p>
        <p className="text-slate-500">
          Route: {profile?.assignedRouteCode || '—'} · Vehicle: {profile?.assignedVehicle || '—'}
        </p>
      </div>

      <form onSubmit={handleSave} className="card space-y-3">
        <label className="block">
          <span className="text-xs text-slate-500 mb-1 block">Phone</span>
          <input
            className="input w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
          />
        </label>
        <p className="text-slate-500 text-xs">
          Password changes are done via invite activation or admin reset — no self-service endpoint yet.
        </p>
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? 'Saving…' : 'Save phone'}
        </button>
      </form>

      <button type="button" onClick={handleLogout} className="btn-ghost text-sm">
        Log out
      </button>
    </div>
  );
}
