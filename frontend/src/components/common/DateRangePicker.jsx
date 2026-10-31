// src/components/common/DateRangePicker.jsx
import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const presets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This Month', key: 'thisMonth' },
  { label: 'This Quarter', key: 'thisQuarter' },
  { label: 'This Year', key: 'thisYear' },
];

function getPresetRange(preset) {
  const now = new Date();
  const end = now.toISOString().split('T')[0];

  if (preset.days) {
    const start = new Date(now);
    start.setDate(start.getDate() - preset.days);
    return { start: start.toISOString().split('T')[0], end };
  }

  if (preset.key === 'thisMonth') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: start.toISOString().split('T')[0], end };
  }

  if (preset.key === 'thisQuarter') {
    const qMonth = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), qMonth, 1);
    return { start: start.toISOString().split('T')[0], end };
  }

  if (preset.key === 'thisYear') {
    const start = new Date(now.getFullYear(), 0, 1);
    return { start: start.toISOString().split('T')[0], end };
  }

  return { start: end, end };
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handlePreset = (preset) => {
    const range = getPresetRange(preset);
    onChange?.(range);
    setOpen(false);
  };

  const handleStartChange = (e) => {
    onChange?.({ start: e.target.value, end: endDate || '' });
  };

  const handleEndChange = (e) => {
    onChange?.({ start: startDate || '', end: e.target.value });
  };

  const displayLabel = startDate && endDate
    ? `${startDate} → ${endDate}`
    : 'Select date range';

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="input-field flex items-center gap-2 text-left"
      >
        <Calendar className="w-4 h-4 text-text-muted flex-shrink-0" />
        <span className={`flex-1 truncate text-sm ${!startDate ? 'text-text-muted' : 'text-text-primary'}`}>
          {displayLabel}
        </span>
        <ChevronDown className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1.5 right-0 w-80 card p-4 shadow-lg">
          {/* Custom date inputs */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-text-secondary mb-1 block">Start</label>
              <input
                type="date"
                value={startDate || ''}
                onChange={handleStartChange}
                className="input-field text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-text-secondary mb-1 block">End</label>
              <input
                type="date"
                value={endDate || ''}
                onChange={handleEndChange}
                className="input-field text-sm"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-3" />

          {/* Presets */}
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Quick Select</p>
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset)}
                className="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-text-primary rounded-md transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
