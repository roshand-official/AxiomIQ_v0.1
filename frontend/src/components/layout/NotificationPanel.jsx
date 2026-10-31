// src/components/layout/NotificationPanel.jsx
import { Link } from 'react-router-dom';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Check,
  Bell,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatRelativeTime } from '../../utils/formatters';

const iconStyles = {
  info: { icon: Info, color: 'text-action bg-blue-50' },
  success: { icon: CheckCircle2, color: 'text-success bg-emerald-50' },
  warning: { icon: AlertTriangle, color: 'text-warning bg-amber-50' },
  error: { icon: AlertCircle, color: 'text-danger bg-rose-50' },
};

export default function NotificationPanel({ onClose }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50/75">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-navy">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-action text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="text-xs text-action hover:text-action-dark font-medium flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-border">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-text-secondary text-xs">
            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 8).map((notif) => {
            const style = iconStyles[notif.type] || iconStyles.info;
            const Icon = style.icon;

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markNotificationRead(notif.id);
                  if (onClose) onClose();
                }}
                className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-gray-50/80 cursor-pointer ${
                  !notif.read ? 'bg-blue-50/20' : ''
                }`}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${style.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-text-secondary whitespace-nowrap">
                      {formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-action flex-shrink-0 mt-1" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border bg-gray-50/50 text-center">
        <Link
          to="/admin/dashboard"
          onClick={onClose}
          className="text-xs font-medium text-action hover:underline"
        >
          View all activity
        </Link>
      </div>
    </div>
  );
}
