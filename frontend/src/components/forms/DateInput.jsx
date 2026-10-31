// src/components/forms/DateInput.jsx
// ============================================================================
// Date input field with calendar icon
// ============================================================================
import React, { forwardRef } from 'react';
import { Calendar } from 'lucide-react';

const DateInput = forwardRef(function DateInput(
  { error, className = '', ...props },
  ref
) {
  return (
    <div className="relative">
      <input
        ref={ref}
        type="date"
        className={`
          w-full rounded-lg border px-3 py-2 pl-9 text-sm text-[#172B4D]
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
      />

      <Calendar
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    </div>
  );
});

export default DateInput;
