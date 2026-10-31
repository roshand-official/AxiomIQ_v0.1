// src/components/layout/PageHeader.jsx
export default function PageHeader({
  title,
  description,
  actions = [],
  children,
  badge,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-navy">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        )}
      </div>

      {(actions.length > 0 || children) && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {actions.map((act, index) => {
            const Icon = act.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={act.onClick}
                disabled={act.disabled}
                className={`btn btn-sm ${
                  act.variant === 'primary'
                    ? 'btn-primary'
                    : act.variant === 'danger'
                    ? 'btn-danger'
                    : 'btn-secondary'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{act.label}</span>
              </button>
            );
          })}
          {children}
        </div>
      )}
    </div>
  );
}
