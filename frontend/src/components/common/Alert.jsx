// src/components/common/Alert.jsx
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const alertStyles = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: Info,
    iconColor: 'text-action',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: CheckCircle2,
    iconColor: 'text-success',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: AlertTriangle,
    iconColor: 'text-warning',
  },
  error: {
    container: 'bg-rose-50 border-rose-200 text-rose-900',
    icon: AlertCircle,
    iconColor: 'text-danger',
  },
};

export default function Alert({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  className = '',
}) {
  const style = alertStyles[type] || alertStyles.info;
  const Icon = style.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${style.container} ${className}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1">
        {title && <h4 className="text-sm font-semibold">{title}</h4>}
        {message && <p className="text-xs leading-relaxed mt-0.5">{message}</p>}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
