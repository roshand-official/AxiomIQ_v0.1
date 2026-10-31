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
  info: { icon: Info, color: 'text-action bg-action-light border border-action/20' },
  success: { icon: CheckCircle2, color: 'text-success bg-success-light border border-success/20' },
  warning: { icon: AlertTriangle, color: 'text-warning bg-warning-light border border-warning/20' },
  error: { icon: AlertCircle, color: 'text-danger bg-danger-light border border-danger/20' },
};

export default function NotificationPanel({ onClose }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-80 sm:w-96 bg-white rounded-md shadow-lg border border-border overflow-hidden text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-surface-subtle">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text-primary text-xs">Activity & Alerts</span>
          {unreadCount > 0 && (
            <span className="bg-action text-white text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="text-[11px] text-action hover:text-action-hover font-medium flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3 h-3" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-border">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-text-muted text-xs">
            <Bell className="w-6 h-6 text-border-strong mx-auto mb-1.5 opacity-60" />
            <p>No operational notifications</p>
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
                className={`p-3 flex items-start gap-2.5 transition-colors hover:bg-surface-subtle cursor-pointer ${
                  !notif.read ? 'bg-action-light/30' : ''
                }`}
              >
                <div className={`p-1.5 rounded-md flex-shrink-0 ${style.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-text-muted whitespace-nowrap font-mono">
                      {formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary line-clamp-2 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
                {!notif.read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-action flex-shrink-0 mt-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border bg-surface-subtle text-center">
        <Link
          to="/admin/dashboard"
          onClick={onClose}
          className="text-xs font-medium text-action hover:underline"
        >
          View operational audit stream
        </Link>
      </div>
    </div>
  );
}
