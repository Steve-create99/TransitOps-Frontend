// ============================================================
// Notifications/index.jsx — System Alerts and Feed
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import { useState, useEffect } from 'react';
import {
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTransit } from '../../context/TransitContext';

export default function Notifications() {
  const {
    notifications,
    markNotificationRead,
    activeAlertsCount,
  } = useTransit();

  // Local state for smooth 300ms read animations
  const [readingIds, setReadingIds] = useState([]);
  const [lastCheckedTime, setLastCheckedTime] = useState(null);

  // Set the "Last checked" timestamp when all notifications are read
  useEffect(() => {
    if (activeAlertsCount === 0 && !lastCheckedTime) {
      const nowStr = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setLastCheckedTime(nowStr);
    } else if (activeAlertsCount > 0) {
      setLastCheckedTime(null);
    }
  }, [activeAlertsCount, lastCheckedTime]);

  const handleMarkAsRead = (id) => {
    setReadingIds((prev) => [...prev, id]);
    setTimeout(() => {
      markNotificationRead(id);
      setReadingIds((prev) => prev.filter((rid) => rid !== id));
    }, 300); // 300ms fade transition
  };

  const handleMarkAllRead = () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    // Staggered trigger animation
    unread.forEach((n, index) => {
      setTimeout(() => {
        setReadingIds((prev) => [...prev, n.id]);
        
        setTimeout(() => {
          markNotificationRead(n.id);
          setReadingIds((prev) => prev.filter((rid) => rid !== n.id));
        }, 300);
      }, index * 50); // 50ms stagger delay
    });
  };

  // Determine if all notifications are fully read
  const allRead = notifications.every((n) => n.read) && readingIds.length === 0;

  return (
    <div className="space-y-6">
      
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <BellIcon className="w-5 h-5 text-primary" />
            Notifications
          </h2>
          <p className="section-subtitle">
            {!allRead ? `${activeAlertsCount} unread system alert${activeAlertsCount !== 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        
        {!allRead && (
          <button
            type="button"
            id="notifications-mark-all"
            className="btn-ghost text-xs font-bold cursor-pointer"
            onClick={handleMarkAllRead}
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* ── Notification List or Empty State ───────────────── */}
      {!allRead ? (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isUnread = !notif.read;
            const isAnimating = readingIds.includes(notif.id);
            const showAsUnread = isUnread && !isAnimating;

            return (
              <div
                key={notif.id}
                id={`notif-card-${notif.id}`}
                className={clsx(
                  "card flex items-start justify-between gap-4 p-4 transition-all duration-300 transform",
                  showAsUnread
                    ? "border-l-4 border-primary bg-[#F0FAF6] text-slate-800 shadow-lg translate-x-1"
                    : "border-surface-border bg-surface text-slate-300 opacity-90 translate-x-0"
                )}
              >
                <div className="flex items-start gap-4 flex-1">
                  
                  {/* Category Icons */}
                  <div
                    className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                      notif.type === 'ALERT' && (showAsUnread ? 'bg-red-50 text-red-500 border-red-200' : 'bg-status-critical/10 text-status-critical border-status-critical/20'),
                      notif.type === 'SUCCESS' && (showAsUnread ? 'bg-green-50 text-green-600 border-green-200' : 'bg-status-active/10 text-primary border-primary/20'),
                      notif.type === 'INFO' && (showAsUnread ? 'bg-blue-50 text-blue-500 border-blue-200' : 'bg-surface-light text-slate-400 border-surface-border')
                    )}
                  >
                    {notif.type === 'ALERT' && <ExclamationTriangleIcon className="w-5 h-5" />}
                    {notif.type === 'SUCCESS' && <CheckCircleIcon className="w-5 h-5" />}
                    {notif.type === 'INFO' && <InformationCircleIcon className="w-5 h-5" />}
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0 flex-1">
                    <p className={clsx("text-sm font-bold", showAsUnread ? "text-slate-900" : "text-slate-100")}>
                      {notif.title}
                    </p>
                    <p className={clsx("text-xs mt-1 leading-relaxed", showAsUnread ? "text-slate-600" : "text-slate-400")}>
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-2">{notif.time}</p>
                  </div>
                </div>

                {/* Mark as read link */}
                <div className="shrink-0 flex items-center justify-center pt-1">
                  {notif.read ? (
                    <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                      ✓ Read
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={clsx(
                        "text-[11px] font-bold hover:underline cursor-pointer transition-colors",
                        showAsUnread ? "text-primary hover:text-primary/80" : "text-slate-400 hover:text-slate-200"
                      )}
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      {isAnimating ? 'Fading...' : 'Mark as read'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dynamic Catch Up Empty State */
        <div className="card flex flex-col items-center justify-center text-center p-12 border border-primary/20 bg-slate-900">
          <div className="w-16 h-16 rounded-full bg-status-active/15 border border-primary/30 flex items-center justify-center mb-4">
            <CheckCircleIcon className="w-9 h-9 text-primary" />
          </div>
          <h3 className="text-slate-100 font-bold text-base">All caught up! No new alerts.</h3>
          <p className="text-slate-500 text-xs mt-1.5">Last checked: {lastCheckedTime}</p>
        </div>
      )}
    </div>
  );
}
