// src/components/common/KPICard.jsx
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorThemes = {
  blue: {
    iconBg: 'bg-blue-50',
    iconText: 'text-action',
  },
  green: {
    iconBg: 'bg-success-light',
    iconText: 'text-success',
  },
  amber: {
    iconBg: 'bg-warning-light',
    iconText: 'text-warning',
  },
  red: {
    iconBg: 'bg-danger-light',
    iconText: 'text-danger',
  },
  navy: {
    iconBg: 'bg-slate-100',
    iconText: 'text-navy',
  },
};

export default function KPICard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  trend,
  color = 'blue',
  className = '',
}) {
  const theme = colorThemes[color] || colorThemes.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`card p-5 flex items-start gap-4 ${className}`}
    >
      {Icon && (
        <div className={`flex-shrink-0 w-11 h-11 rounded-lg ${theme.iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${theme.iconText}`} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-secondary truncate">{title}</p>
        <p className="text-2xl font-bold text-text-primary mt-0.5 tracking-tight">{value}</p>

        {(subtitle || change != null) && (
          <div className="flex items-center gap-1.5 mt-1.5">
            {change != null && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-secondary'
                }`}
              >
                {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                {typeof change === 'number' ? `${change > 0 ? '+' : ''}${change}%` : change}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-text-muted">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
