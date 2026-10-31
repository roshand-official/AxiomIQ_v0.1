// src/components/common/FilterDropdown.jsx
import { ChevronDown } from 'lucide-react';

export default function FilterDropdown({
  label,
  options = [],
  value,
  onChange,
  showAll = true,
  allLabel = 'All',
  className = '',
}) {
  return (
    <div className={`relative inline-flex flex-col ${className}`}>
      {label && (
        <label className="text-xs font-medium text-text-secondary mb-1">{label}</label>
      )}
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className="select-field pr-9 min-w-[140px]"
        >
          {showAll && <option value="">{allLabel}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
      </div>
    </div>
  );
}
