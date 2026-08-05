// ============================================================
// Driver Incidents — report own incident
// ============================================================

import { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { driverMeApi } from '../../services/api';
import { useTransit } from '../../context/TransitContext';

const CATEGORIES = ['MECHANICAL', 'TRAFFIC', 'SAFETY', 'PASSENGER', 'OTHER'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function DriverIncidents() {
  const { showToast } = useTransit();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [severity, setSeverity] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      await driverMeApi.reportIncident({
        title: title.trim(),
        category,
        severity,
        description: description.trim(),
      });
      showToast('Incident reported', 'success');
      setTitle('');
      setDescription('');
      setCategory('OTHER');
      setSeverity('MEDIUM');
    } catch (err) {
      const msg = err.message || 'Could not report incident';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-6 h-6 text-primary" />
          Report incident
        </h1>
        <p className="text-slate-400 text-sm mt-1">Filed against your driver record only</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && <p className="text-status-critical text-sm">{error}</p>}

        <label className="block">
          <span className="text-xs text-slate-500 mb-1 block">Title</span>
          <input
            className="input w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-slate-500 mb-1 block">Category</span>
            <select className="input w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-slate-500 mb-1 block">Severity</span>
            <select className="input w-full" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-slate-500 mb-1 block">Description</span>
          <textarea
            className="input w-full min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happened?"
          />
        </label>

        <button type="submit" disabled={submitting} className="btn-primary text-sm">
          {submitting ? 'Submitting…' : 'Submit report'}
        </button>
      </form>
    </div>
  );
}
