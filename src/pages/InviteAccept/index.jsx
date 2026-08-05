// ============================================================
// InviteAccept — Driver invite acceptance (set password)
// ============================================================

import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  TruckIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { inviteApi, normalizeAuthResponse } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

export default function InviteAccept() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const { login } = useAppContext();

  const [info, setInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setInfo({ valid: false, message: 'Missing invite token' });
        setLoadingInfo(false);
        return;
      }
      try {
        const data = await inviteApi.peek(token);
        if (!cancelled) setInfo(data);
      } catch (err) {
        if (!cancelled) setInfo({ valid: false, message: err.message || 'Invalid invite' });
      } finally {
        if (!cancelled) setLoadingInfo(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const raw = await inviteApi.accept(token, password);
      const norm = normalizeAuthResponse(raw);
      login(norm.user, {
        accessToken: norm.accessToken,
        refreshToken: norm.refreshToken,
        expiresIn: norm.expiresIn,
      });
      setSuccess(raw.message || 'Account activated');
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (err) {
      setError(err.message || 'Could not accept invite');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md card space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
            <TruckIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-primary font-bold">KNUST TransitOps</p>
            <h1 className="text-slate-100 font-semibold text-lg leading-tight">Driver Companion invite</h1>
          </div>
        </div>

        {loadingInfo && <p className="text-slate-400 text-sm">Checking invitation…</p>}

        {!loadingInfo && info && !info.valid && (
          <div className="rounded-xl border border-status-critical/30 bg-status-critical/10 p-3 flex gap-2">
            <ExclamationCircleIcon className="w-5 h-5 text-status-critical shrink-0" />
            <div>
              <p className="text-status-critical text-sm font-medium">{info.message || 'Invalid invite'}</p>
              <Link to="/login" className="text-xs text-primary mt-2 inline-block">Back to sign in</Link>
            </div>
          </div>
        )}

        {!loadingInfo && info?.valid && (
          <>
            <p className="text-slate-400 text-sm">
              Welcome, <span className="text-slate-200 font-medium">{info.firstName} {info.lastName}</span>.
              Set a password to activate your DRIVER account for <span className="text-slate-200">{info.email}</span>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block">
                <span className="text-xs text-slate-500 mb-1 block">Password</span>
                <div className="relative">
                  <LockClosedIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    minLength={8}
                    className="w-full h-11 pl-9 pr-10 rounded-xl bg-surface-light border border-surface-border text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    onClick={() => setShowPwd((v) => !v)}>
                    {showPwd ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </label>
              <label className="block">
                <span className="text-xs text-slate-500 mb-1 block">Confirm password</span>
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  minLength={8}
                  className="w-full h-11 px-3 rounded-xl bg-surface-light border border-surface-border text-sm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </label>

              {error && (
                <p className="text-status-critical text-xs flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4" /> {error}
                </p>
              )}
              {success && (
                <p className="text-primary text-xs flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4" /> {success}
                </p>
              )}

              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? 'Activating…' : 'Activate DRIVER account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
