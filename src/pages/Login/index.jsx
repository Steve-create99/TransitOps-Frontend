// ============================================================
// Login/index.jsx — Authentication page (Sign In / Sign Up)
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { authApi, normalizeAuthResponse, BASE_URL } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { homeForRole } from '../../utils/roles';
import BrandLogo from '../../components/common/BrandLogo';

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
      navigate(homeForRole(user), { replace: true });
    } catch (err) {
      const baseMsg = err.message || 'Invalid email or password. Please try again.';
      // Temporary verify hint: show which API host the client called
      const host = (() => {
        try { return new URL(BASE_URL, window.location.origin).host; } catch { return BASE_URL; }
      })();
      setError(err.status === 0 || /Failed to fetch|Cannot reach/i.test(baseMsg)
        ? `${baseMsg}`
        : `${baseMsg} (api: ${host})`);
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up ─────────────────────────────────────────────────
  // Self-registration disabled — invite-only via Settings
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('Self-registration is disabled. Ask an administrator to invite your account.');
  };

  // Switch view and clear all feedback + shared fields
  const switchView = (mode) => {
    setViewMode(mode);
    setPassword('');
    setConfirmPassword('');
    resetFeedback();
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans text-slate-900 bg-[#F1F5F9] antialiased">
      <main className="w-[900px] h-auto min-h-[560px] bg-white rounded-[1rem] overflow-hidden flex flex-col md:flex-row relative shadow-[0px_10px_25px_rgba(0,0,0,0.05)]">
        
        {/* Left Side: Form */}
        <section className="w-full md:w-1/2 flex flex-col items-center justify-center p-10 relative z-10 bg-white order-2 md:order-1 transition-all">
          {/* Logo Lockup */}
          <div className="flex items-center gap-2 mb-8">
            <BrandLogo size="md" />
            <span className="text-[24px] font-bold text-slate-900 tracking-tight">TransitOps</span>
          </div>

          {/* Heading Section */}
          <div className="text-center w-full">
            <h1 className="text-[26px] font-bold text-slate-900 mb-2">
              {viewMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </h1>
            <div className="w-10 h-[1px] bg-slate-300 mx-auto mb-6"></div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="w-full max-w-[320px] mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
              <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="w-full max-w-[320px] mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-start gap-2">
              <CheckCircleIcon className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          {viewMode === 'signin' ? (
            <form onSubmit={handleSignIn} className="w-full max-w-[320px] flex flex-col gap-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input 
                  type="email" required placeholder="Email Address" 
                  value={email} onChange={(e) => { setEmail(e.target.value); resetFeedback(); }}
                  className="w-full h-[46px] pl-12 pr-4 bg-white border border-slate-200 rounded-full text-[14px] placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                />
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input 
                  type={showPwd ? 'text' : 'password'} required placeholder="Password" 
                  value={password} onChange={(e) => { setPassword(e.target.value); resetFeedback(); }}
                  className="w-full h-[46px] pl-12 pr-12 bg-white border border-slate-200 rounded-full text-[14px] placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary">
                  <span className="material-symbols-outlined">{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <div className="text-center mt-2">
                <a href="#" className="text-primary text-[13px] font-medium hover:underline">Forgot Your Password?</a>
              </div>
              <button type="submit" disabled={loading} className="mt-4 h-[46px] bg-primary hover:bg-[#188663] text-white font-bold text-[14px] rounded-full uppercase tracking-wider active:scale-95 transition-all shadow-md disabled:opacity-70 flex justify-center items-center">
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="w-full max-w-[320px] flex flex-col gap-4">
               <div className="flex gap-2">
                  <input type="text" placeholder="First Name" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-1/2 h-[46px] px-4 border border-slate-200 rounded-full text-[14px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                  <input type="text" placeholder="Last Name" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-1/2 h-[46px] px-4 border border-slate-200 rounded-full text-[14px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
               </div>
               <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                  <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} className="w-full h-[46px] pl-12 pr-4 border border-slate-200 rounded-full text-[14px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
               </div>
               <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">badge</span>
                  <select required value={role} onChange={e => setRole(e.target.value)} className="w-full h-[46px] pl-12 pr-10 border border-slate-200 rounded-full text-[14px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none bg-white">
                    <option value="" disabled>Select Role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="DRIVER">Driver</option>
                  </select>
               </div>
               <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                  <input type={showPwd ? 'text' : 'password'} placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full h-[46px] pl-12 pr-12 border border-slate-200 rounded-full text-[14px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined">{showPwd ? 'visibility_off' : 'visibility'}</span>
                  </button>
               </div>
               <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                  <input type={showConfirmPwd ? 'text' : 'password'} placeholder="Confirm Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full h-[46px] pl-12 pr-12 border border-slate-200 rounded-full text-[14px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                  <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined">{showConfirmPwd ? 'visibility_off' : 'visibility'}</span>
                  </button>
               </div>
               <button type="submit" disabled={loading} className="mt-2 h-[46px] bg-primary hover:bg-[#188663] text-white font-bold text-[14px] rounded-full uppercase tracking-wider active:scale-95 transition-all shadow-md disabled:opacity-70 flex justify-center items-center">
                 {loading ? 'CREATING...' : 'SIGN UP'}
               </button>
            </form>
          )}

        </section>
        
        {/* Right Side: Welcome Panel */}
        <section className={`w-full md:w-1/2 bg-secondary relative overflow-hidden flex flex-col items-center justify-center text-center px-12 py-12 order-1 md:order-2`}>
          {/* Organic Curve Element */}
          <div className={`hidden md:block absolute inset-y-0 ${viewMode === 'signin' ? '-left-[100px] rounded-l-[300px]' : '-right-[100px] rounded-r-[300px]'} w-[200px] bg-secondary z-0`} />
          
          <div className="relative z-20 flex flex-col items-center gap-6">
            <h2 className="text-white text-[30px] font-bold">
              {viewMode === 'signin' ? 'Hello, Friend!' : 'Welcome Back!'}
            </h2>
            <p className="text-slate-300 text-[14px] leading-relaxed max-w-[260px]">
              {viewMode === 'signin' 
                ? 'Register with your personal details to access all TransitOps features'
                : 'To keep connected with us please login with your personal info'}
            </p>
            <button 
              type="button"
              onClick={() => switchView(viewMode === 'signin' ? 'signup' : 'signin')}
              className="mt-4 px-12 h-[46px] border border-white text-white font-bold text-[13px] rounded-full uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all"
            >
              {viewMode === 'signin' ? 'SIGN UP' : 'SIGN IN'}
            </button>
          </div>

          {/* Background Atmosphere */}
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
          <div className="absolute top-[-10%] left-[20%] w-48 h-48 bg-primary/20 blur-[80px] rounded-full"></div>
        </section>
      </main>
      
      {/* Footer Identity */}
      <footer className="fixed bottom-8 text-slate-400 text-[12px] font-medium">
        © 2026 KNUST Campus Transit · TransitOps. All rights reserved.
      </footer>
    </div>
  );
}
