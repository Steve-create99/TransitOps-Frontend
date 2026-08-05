// ============================================================
// Driver Notifications — own alerts
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { notificationsApi, unwrapList } from '../../services/api';

export default function DriverNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const raw = await notificationsApi.list();
      setItems(unwrapList(raw));
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readFlag: true, read: true } : n))
      );
    } catch {
      // ignore
    }
  };

  if (loading) return <p className="text-slate-400 text-sm">Loading notifications…</p>;
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-status-critical text-sm">{error}</p>
        <button type="button" className="btn-primary text-sm" onClick={load}>Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <BellIcon className="w-6 h-6 text-primary" />
          Notifications
        </h1>
        <p className="text-slate-400 text-sm mt-1">Alerts sent to your account</p>
      </div>

      {items.length === 0 ? (
        <p className="text-slate-500 text-sm">No notifications.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const read = !!(n.readFlag ?? n.read);
            return (
              <li
                key={n.id}
                className={clsx(
                  'card text-sm space-y-1 cursor-pointer',
                  !read && 'border-primary/30'
                )}
                onClick={() => !read && markRead(n.id)}
              >
                <p className={clsx('font-medium', read ? 'text-slate-400' : 'text-slate-100')}>
                  {n.title}
                </p>
                <p className="text-slate-500">{n.message}</p>
                <p className="text-slate-600 text-xs">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
