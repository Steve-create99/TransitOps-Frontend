// ============================================================
// Notifications/index.jsx — System alerts and notifications
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================

import {
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// ── Mock notification data ───────────────────────────────────
const mockNotifications = [
  {
    id: 'notif-001',
    type:    'critical',
    icon:    ExclamationTriangleIcon,
    title:   'Route RT-22 — Service Disruption',
    message: 'Bus BUS-031 has broken down at University Gate. Replacement dispatched.',
    time:    '2 min ago',
    read:    false,
    badge:   'badge-critical',
    iconColor: 'text-status-critical',
    iconBg:    'bg-status-critical/10',
  },
  {
    id: 'notif-002',
    type:    'warning',
    icon:    ExclamationTriangleIcon,
    title:   'Route RT-07 — Delay Alert',
    message: 'North City Loop running 12 minutes behind schedule due to traffic.',
    time:    '8 min ago',
    read:    false,
    badge:   'badge-delayed',
    iconColor: 'text-status-delayed',
    iconBg:    'bg-status-delayed/10',
  },
  {
    id: 'notif-003',
    type:    'info',
    icon:    InformationCircleIcon,
    title:   'Schedule Update — Weekend Service',
    message: 'Weekend reduced-service schedule is now active for routes RT-30 and RT-38.',
    time:    '1 hr ago',
    read:    true,
    badge:   null,
    iconColor: 'text-slate-400',
    iconBg:    'bg-surface-light',
  },
  {
    id: 'notif-004',
    type:    'success',
    icon:    CheckCircleIcon,
    title:   'Maintenance Complete — BUS-102',
    message: 'Bus BUS-102 has completed scheduled maintenance and is back in service.',
    time:    '3 hr ago',
    read:    true,
    badge:   null,
    iconColor: 'text-status-active',
    iconBg:    'bg-status-active/10',
  },
  {
    id: 'notif-005',
    type:    'info',
    icon:    InformationCircleIcon,
    title:   'New Route Added — RT-45',
    message: 'Route RT-45 (Suburb Express) has been added and will begin service Monday.',
    time:    'Yesterday',
    read:    true,
    badge:   null,
    iconColor: 'text-slate-400',
    iconBg:    'bg-surface-light',
  },
];

/**
 * Notifications — list of system alerts, sorted newest first.
 * Unread notifications are highlighted with a left border accent.
 */
export default function Notifications() {
  // Count unread notifications
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <BellIcon className="w-5 h-5 text-primary" />
            Notifications
          </h2>
          <p className="section-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        <button type="button" className="btn-ghost" id="notifications-mark-all-read">
          Mark all as read
        </button>
      </div>

      {/* ── Notification List ─────────────────────────────── */}
      <div className="space-y-3">
        {mockNotifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <div
              key={notif.id}
              id={notif.id}
              className={`
                card flex items-start gap-4 transition-all duration-200
                ${!notif.read ? 'border-l-2 border-l-primary' : ''}
              `}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.iconBg}`}>
                <Icon className={`w-5 h-5 ${notif.iconColor}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className={`text-sm font-semibold ${!notif.read ? 'text-slate-100' : 'text-slate-300'}`}>
                    {notif.title}
                  </p>
                  {notif.badge && <span className={notif.badge}>{notif.type}</span>}
                </div>
                <p className="text-slate-400 text-sm mt-1">{notif.message}</p>
                <p className="text-slate-600 text-xs mt-2">{notif.time}</p>
              </div>

              {/* Unread dot */}
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" aria-label="Unread" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
