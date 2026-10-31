// src/components/common/StatusBadge.jsx
import { getStatusColor, getStatusLabel } from '../../utils/formatters';

const colorClassMap = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
};

const dotColorMap = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-action',
  neutral: 'bg-gray-400',
};

export default function StatusBadge({ status, showDot = true, className = '' }) {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  const badgeClass = colorClassMap[color] || colorClassMap.neutral;
  const dotClass = dotColorMap[color] || dotColorMap.neutral;

  return (
    <span className={`${badgeClass} ${className}`}>
      {showDot && (
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotClass}`} />
      )}
      {label}
    </span>
  );
}
