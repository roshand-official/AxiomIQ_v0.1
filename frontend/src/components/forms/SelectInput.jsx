// src/components/forms/SelectInput.jsx
// ============================================================================
// Select dropdown with chevron icon and error state
// ============================================================================
import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const SelectInput = forwardRef(function SelectInput(
  { options = [], placeholder, error, className = '', ...props },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`
          w-full appearance-none rounded-lg border px-3 py-2 pr-9 text-sm text-[#172B4D]
          bg-white
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${error
            ? 'border-[#DC5252] focus:ring-[#DC5252]/30 focus:border-[#DC5252]'
            : 'border-[#E5EAF0] hover:border-gray-300'
          }
          ${className}
        `}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    </div>
  );
});

export default SelectInput;
