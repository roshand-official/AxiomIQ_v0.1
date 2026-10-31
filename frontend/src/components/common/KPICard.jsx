// src/components/common/KPICard.jsx
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Enterprise Financial Metric Display
 * Designed for maximum readability and visual discipline (Stripe/Ramp inspired).
 */
export default function KPICard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  trend,
  color = 'default',
  badge = null,
  className = '',
}) {
  return (
    <div
      className={`card p-4 transition-all duration-150 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-secondary truncate tracking-tight">
          {title}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {badge && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-subtle text-text-secondary border border-border">
              {badge}
            </span>
          )}
          {Icon && (
            <Icon className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="mt-2.5">
        <p className="text-2xl font-bold text-text-primary tracking-tight font-mono tabular-nums">
          {value}
        </p>

        {(subtitle || change != null) && (
          <div className="flex items-center gap-1.5 mt-1.5">
            {change != null && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${
                  trend === 'up'
                    ? 'text-success'
                    : trend === 'down'
                    ? 'text-danger'
                    : 'text-text-secondary'
                }`}
              >
                {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                {typeof change === 'number'
                  ? `${change > 0 ? '+' : ''}${change}%`
                  : change}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-text-muted truncate">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
