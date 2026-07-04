// ============================================================
// Login/index.jsx — Authentication page (Sign In / Sign Up)
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TruckIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  MapIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { authApi, normalizeAuthResponse } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

// ── Background Grid Styling Constants ───────────────────────
const diagonalGridStyle = {
  backgroundImage: `
    linear-gradient(45deg, rgba(255, 255, 255, 0.03) 25%, transparent 25%), 
    linear-gradient(-45deg, rgba(255, 255, 255, 0.03) 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.03) 75%), 
    linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.03) 75%)
  `,
  backgroundSize: '40px 40px',
  backgroundPosition: '0 0, 0 20px, 20px 20px, 20px 0',
};

const dotGridStyle = {
  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

// Only two roles are supported — mapped directly to backend enum values
const ROLES = [
  { label: 'Admin',  value: 'ADMIN'  },
  { label: 'Driver', value: 'DRIVER' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppContext();

  // View state: 'signin' or 'signup'
  const [viewMode, setViewMode] = useState('signin');

  // Common form states
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  // Sign up specific form states
  const [firstName,      setFirstName]      = useState('');
  const [lastName,       setLastName]       = useState('');
  const [role,           setRole]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [rememberMe,     setRememberMe]     = useState(false);

  // Feedback states
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Evaluate password strength metrics
  const getPasswordStrength = (val) => {
    if (val.length === 0) return { label: 'Weak',   score: 0, color: '#ba1a1a' };
    if (val.length < 6)   return { label: 'Weak',   score: 1, color: '#ba1a1a' };
    if (val.length < 10)  return { label: 'Fair',   score: 2, color: '#EF9F27' };
    if (val.length < 14)  return { label: 'Good',   score: 3, color: '#008560' };
    return                       { label: 'Strong', score: 4, color: '#1D9E75' };
  };

  const strength = getPasswordStrength(password);

  function resetFeedback() {
    setError('');
    setSuccess('');
  }

  // ── Sign In ─────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    resetFeedback();
    setLoading(true);

    try {
      const raw = await authApi.login(email, password);
      const { accessToken, refreshToken, expiresIn, user } = normalizeAuthResponse(raw);

      if (!accessToken) throw new Error('No token received from server.');

      login(user, { accessToken, refreshToken, expiresIn });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up ─────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    resetFeedback();

    if (!firstName || !lastName || !email || !role || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Register the account, then immediately sign in
      await authApi.register(firstName, lastName, email, role, password);

      const raw = await authApi.login(email, password);
      const { accessToken, refreshToken, expiresIn, user } = normalizeAuthResponse(raw);

      if (!accessToken) throw new Error('Account created but sign-in failed. Please sign in manually.');

      login(user, { accessToken, refreshToken, expiresIn });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Switch view and clear all feedback + shared fields
  const switchView = (mode) => {
    setViewMode(mode);
    setPassword('');
    setConfirmPassword('');
    resetFeedback();
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f9f9ff] overflow-hidden font-sans">
      
      {/* ── Left Column: Branding & Atmosphere ────────────────── */}
      <aside className="hidden lg:flex w-1/2 bg-[#0A1628] flex-col relative items-center justify-center p-12 overflow-hidden shrink-0">
        
        {/* Background Dot Matrix Pattern */}
        <div className="absolute inset-0 pointer-events-none" style={dotGridStyle} />
        {/* Background Diagonal Accent Pattern */}
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={diagonalGridStyle} />

        {/* Dynamic Center Branding Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          
          {/* Brand Mark */}
          <div className="mb-6 flex flex-col items-center">
            <div className="w-[52px] h-[52px] bg-primary flex items-center justify-center rounded-full mb-4 shadow-lg shadow-primary/20">
              <TruckIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-mono">TransitOps</h1>
            <p className="text-slate-400 text-xs mt-1 tracking-wider uppercase">Accra Metro Transit Authority</p>
            <div className="w-16 h-0.5 bg-primary mt-4" />
          </div>

          {/* View-specific highlights panel */}
          {viewMode === 'signin' ? (
            <div className="w-full mt-6 space-y-6">
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Unified Operations Management Portal for scheduling, routing, and live tracking.
              </p>
              
              <ul className="space-y-4 text-left mt-8 w-full max-w-xs mx-auto">
                <li className="flex items-center gap-3.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <MapIcon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <span className="text-sm text-slate-300">Manage routes and stops in real time</span>
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <ChartBarIcon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <span className="text-sm text-slate-300">Monitor network performance at a glance</span>
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <ClockIcon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <span className="text-sm text-slate-300">Schedule and track all bus runs</span>
                </li>
              </ul>
            </div>
          ) : (
            <div className="w-full mt-6 flex flex-col items-center">
              <h2 className="text-sm font-medium text-slate-300 opacity-90 max-w-sm mb-8 leading-relaxed">
                Unified Operations Management for the Accra Metro Transit Authority.
              </h2>
              
              {/* Control center graphics panel */}
              <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  className="w-full h-full object-cover"
                  alt="Accra modern transit command center monitoring desks"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBm_4V9XrVsUwGl2fg7GujMe57RtmqP8pyh5qkoJf9ntMsROfcPhjiK8PCMfBIWUotKr1-327mK1w_r9fJd7oITLOk9SVwG1DGQ4CihOdBNk7SDbcOqjCQ1Qcue0iPNsA6r63oWb2zsX-1v5xK4CEZgRYAxNx3rDoaHPjDPh3G2ust_4urowNqKbsUc-AyiqMDPpgYVXp3CuEc2bmM8KLrfxBwEF0l7VBejdtK0Pd9T1yGeF3UX4Duz2YNTK6qsO_WgPIUMKFwiY2k"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/30 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-left">
                  <p className="text-[9px] text-primary font-bold uppercase tracking-widest mb-1">Infrastructure Hub</p>
                  <p className="text-white text-xs italic leading-relaxed opacity-90">
                    "Ensuring every journey across the city is seamless, safe, and on schedule."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fixed Footer */}
          <div className="mt-12 text-center">
            <p className="text-[11px] text-slate-500">
              © 2026 TransitOps · Accra Metro Transit Authority
            </p>
          </div>

        </div>

      </aside>

      {/* ── Right Column: Sign In / Sign Up Forms ────────────── */}
      <main className="flex-1 bg-white flex flex-col items-center justify-center px-6 py-12 overflow-y-auto scrollbar-thin">
        <div className="w-full max-w-[420px] flex flex-col">
          
          {/* Dynamic Headers */}
          <header className="mb-8">
            <span className="text-[10px] font-bold text-primary tracking-[0.2em] block mb-3 uppercase">
              STAFF PORTAL
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {viewMode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              {viewMode === 'signin'
                ? 'Sign in to your TransitOps account'
                : 'Join the TransitOps staff platform'}
            </p>
          </header>

          {/* ── Feedback Banners ──────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <ExclamationCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              <CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Form renders dynamically based on viewMode */}
          {viewMode === 'signin' ? (

            /* ──────────────── Sign In View ──────────────── */
            <form onSubmit={handleSignIn} className="space-y-5">
              
              {/* Email Input */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700 mb-2" htmlFor="email">
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="you@transitops.gh"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); resetFeedback(); }}
                    className="w-full h-12 pl-11 pr-4 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); resetFeedback(); }}
                    className="w-full h-12 pl-11 pr-12 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPwd ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-200 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                  />
                  <span className="text-slate-500 group-hover:text-slate-800 transition-colors">
                    Remember me
                  </span>
                </label>
                <a href="#" className="font-semibold text-primary hover:underline transition-all">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] bg-primary hover:bg-[#0F6E56] active:scale-[0.98] text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-none disabled:opacity-60"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

            </form>

          ) : (

            /* ──────────────── Sign Up View ──────────────── */
            <form onSubmit={handleSignUp} className="space-y-4">
              
              {/* Full Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">First name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kofi"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Last name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mensah"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Work Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Work email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="email"
                    required
                    placeholder="you@transitops.gh"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Role Select — Admin or Driver only */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Role</label>
                <div className="relative">
                  <BriefcaseIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <select
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-12 pl-11 pr-10 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-primary bg-white transition-all cursor-pointer appearance-none"
                  >
                    <option value="" disabled>Select your role</option>
                    {ROLES.map(({ label, value }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
                </div>
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Password field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-11 pr-10 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {showPwd ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Confirm password</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type={showConfirmPwd ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 pl-11 pr-10 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {showConfirmPwd ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Password Strength Indicator */}
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className="h-1 rounded-full flex-1 transition-all duration-300"
                      style={{ backgroundColor: index <= strength.score ? strength.color : '#bccac1' }}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Password strength:{' '}
                  <span className="font-semibold" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] bg-primary hover:bg-[#0F6E56] active:scale-[0.98] text-white font-bold text-sm rounded-lg transition-all duration-200 shadow-none disabled:opacity-60 mt-2"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

            </form>
          )}

          {/* Toggle View Mode Footer */}
          <footer className="mt-8 text-center text-sm">
            <p className="text-slate-500">
              {viewMode === 'signin' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('signup')}
                    className="text-primary font-bold hover:underline ml-1 cursor-pointer"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('signin')}
                    className="text-primary font-bold hover:underline ml-1 cursor-pointer"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </footer>

          {/* Legal Footer Links (sign up only) */}
          {viewMode === 'signup' && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center gap-4 text-xs text-slate-400">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
