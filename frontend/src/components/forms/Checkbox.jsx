// src/components/forms/Checkbox.jsx
// ============================================================================
// Custom styled checkbox with label
// ============================================================================
import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

const Checkbox = forwardRef(function Checkbox(
  { label, checked, onChange, disabled = false, error, className = '', id, ...props },
  ref
) {
  const checkboxId = id || `checkbox-${label?.replace(/\s+/g, '-').toLowerCase() || Math.random().toString(36).slice(2)}`;

  return (
    <label
      htmlFor={checkboxId}
      className={`
        inline-flex items-center gap-2 cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative flex-shrink-0">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        <div
          className={`
            h-[18px] w-[18px] rounded border-2 flex items-center justify-center
            transition-all duration-150
            peer-focus-visible:ring-2 peer-focus-visible:ring-[#3B82F6]/30
            ${checked
              ? 'bg-[#3B82F6] border-[#3B82F6]'
              : error
                ? 'border-[#DC5252] bg-white'
                : 'border-[#E5EAF0] bg-white hover:border-gray-300'
            }
          `}
        >
          {checked && (
            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          )}
        </div>
      </div>

      {label && (
        <span className="text-sm text-[#172B4D]">{label}</span>
      )}
    </label>
  );
});

export default Checkbox;
