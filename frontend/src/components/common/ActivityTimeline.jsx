// src/components/common/ActivityTimeline.jsx
import { Link } from 'react-router-dom';
import {
  FileText,
  CreditCard,
  RefreshCw,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

const iconMap = {
  subscription_created: RefreshCw,
  subscription_paused: Clock,
  subscription_resumed: RefreshCw,
  subscription_cancelled: AlertCircle,
  invoice_generated: FileText,
  invoice_overdue: AlertCircle,
  payment_received: CheckCircle2,
  payment_failed: AlertCircle,
  renewal_completed: RefreshCw,
  renewal_requested: Clock,
  discount_applied: Tag,
  customer_created: User,
  staff_assigned: User,
  billing_executed: CreditCard,
};

const colorMap = {
  subscription_created: 'bg-action/10 text-action',
  subscription_paused: 'bg-warning/10 text-warning',
  subscription_resumed: 'bg-success/10 text-success',
  subscription_cancelled: 'bg-danger/10 text-danger',
  invoice_generated: 'bg-action/10 text-action',
  invoice_overdue: 'bg-danger/10 text-danger',
  payment_received: 'bg-success/10 text-success',
  payment_failed: 'bg-danger/10 text-danger',
  renewal_completed: 'bg-success/10 text-success',
  renewal_requested: 'bg-warning/10 text-warning',
  discount_applied: 'bg-purple-50 text-purple-600',
  customer_created: 'bg-teal-50 text-teal-600',
  staff_assigned: 'bg-blue-50 text-blue-600',
  billing_executed: 'bg-emerald-50 text-emerald-600',
};

export default function ActivityTimeline({ activities = [], maxItems = 10 }) {
  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return <p className="text-sm text-text-secondary text-center py-6">No recent activity</p>;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
      {displayActivities.map((act) => {
        const Icon = iconMap[act.type] || Clock;
        const colorClass = colorMap[act.type] || 'bg-gray-100 text-text-secondary';

        return (
          <div key={act.id} className="relative flex items-start gap-3.5 group">
            {/* Timeline icon */}
            <div
              className={`absolute -left-6 mt-0.5 flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-white ${colorClass}`}
            >
              <Icon className="w-3 h-3" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="text-xs text-text-primary font-medium leading-relaxed">
                {act.message}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-text-secondary">
                <span>{formatRelativeTime(act.timestamp)}</span>
                {act.entityType && act.entityId && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-navy">
                      {act.entityId}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
