// ============================================================
// Splash/index.jsx — Full-screen landing / splash page
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useNavigate } from 'react-router-dom';
import { TruckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

/**
 * Splash — full-screen brand page shown on first load.
 * Directs the user to the Login screen.
 */
export default function Splash() {
  const navigate = useNavigate();  // Hook to navigate programmatically

  return (
    <div
      className="
        min-h-screen bg-secondary flex flex-col items-center justify-center
        px-6 text-center relative overflow-hidden
      "
    >
      {/* ── Decorative background circles ─────────────────── */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full
                   bg-primary/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full
                   bg-primary/5 blur-3xl pointer-events-none"
      />

      {/* ── Brand Mark ────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div
          className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30
                     flex items-center justify-center shadow-lg shadow-primary/10"
        >
          <TruckIcon className="w-10 h-10 text-primary" />
        </div>

        {/* ── App Name ──────────────────────────────────── */}
        <div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Transit<span className="text-primary">Ops</span>
          </h1>
          <p className="mt-2 text-slate-400 text-lg">
            Public Transit Management Dashboard
          </p>
        </div>

        {/* ── Tagline ───────────────────────────────────── */}
        <p className="max-w-md text-slate-500 text-sm leading-relaxed">
          Real-time fleet tracking, route management, and operational analytics
          for modern public transit authorities.
        </p>

        {/* ── CTA Button ────────────────────────────────── */}
        <button
          id="splash-get-started"
          type="button"
          onClick={() => navigate('/login')}
          className="btn-primary px-8 py-3 text-base mt-2"
        >
          Get Started
          <ArrowRightIcon className="w-4 h-4" />
        </button>

        {/* ── Version badge ─────────────────────────────── */}
        <p className="text-slate-600 text-xs mt-4">
          v1.0.0 — Transit Authority Platform
        </p>
      </div>
    </div>
  );
}
