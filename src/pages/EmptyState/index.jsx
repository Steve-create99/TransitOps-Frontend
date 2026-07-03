// ============================================================
// EmptyState/index.jsx — Generic empty state page
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { FolderOpenIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

/**
 * EmptyState — reusable placeholder shown when content is missing.
 * Can be adapted with props for per-section empty states.
 */
export default function EmptyState({ title = 'Nothing here yet', description = 'This section is currently empty. Content will appear here once data is loaded or records are created.' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">

      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-surface-light border border-surface-border
                      flex items-center justify-center mb-6">
        <FolderOpenIcon className="w-10 h-10 text-slate-500" />
      </div>

      {/* Heading */}
      <h2 className="section-title text-slate-200 mb-2">{title}</h2>

      {/* Description */}
      <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="btn-primary" id="empty-go-dashboard">
          Go to Dashboard
        </Link>
        <button type="button" className="btn-ghost" id="empty-retry">
          Retry
        </button>
      </div>
    </div>
  );
}
