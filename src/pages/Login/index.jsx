// ============================================================
// Login/index.jsx — Authentication page
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TruckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

/**
 * Login — email + password form.
 * On submit, navigates to /dashboard (auth logic to be wired in Phase 2).
 */
export default function Login() {
  const navigate = useNavigate();

  // Form state
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);  // Toggle password visibility
  const [loading,  setLoading]  = useState(false);

  // Handle form submit — simulates login for now
  function handleSubmit(e) {
    e.preventDefault();          // Prevent page reload
    setLoading(true);

    // Simulate async login with 800ms delay, then go to dashboard
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 800);
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4 relative overflow-hidden">

      {/* ── Background decorative blobs ───────────────────── */}
      <div aria-hidden="true"
           className="absolute top-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div aria-hidden="true"
           className="absolute bottom-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      {/* ── Login Card ────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-xl bg-primary/20 border border-primary/30
                          items-center justify-center mb-4 shadow-lg shadow-primary/10">
            <TruckIcon className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to TransitOps</p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="card space-y-5"
          noValidate
        >
          {/* Email field */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-1.5">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              placeholder="operator@transitops.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPwd ? 'text' : 'password'}  // Toggle visibility
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-10"
              />
              {/* Show / hide password toggle */}
              <button
                type="button"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPwd
                  ? <EyeSlashIcon className="w-4 h-4" />
                  : <EyeIcon      className="w-4 h-4" />
                }
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Back to splash */}
        <p className="text-center text-slate-500 text-sm mt-6">
          <Link to="/" className="text-primary hover:underline">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
