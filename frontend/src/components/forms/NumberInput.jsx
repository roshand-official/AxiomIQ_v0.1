// src/components/forms/NumberInput.jsx
// ============================================================================
// Number input with optional min/max/step
// ============================================================================
import React, { forwardRef } from 'react';

const NumberInput = forwardRef(function NumberInput(
  { error, min, max, step, className = '', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type="number"
      min={min}
      max={max}
      step={step}
      className={`
        w-full rounded-lg border px-3 py-2 text-sm text-[#172B4D]
        placeholder:text-gray-400
        bg-white
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]
        disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
        [appearance:textfield]
        [&::-webkit-outer-spin-button]:appearance-none
        [&::-webkit-inner-spin-button]:appearance-none
        ${error
          ? 'border-[#DC5252] focus:ring-[#DC5252]/30 focus:border-[#DC5252]'
          : 'border-[#E5EAF0] hover:border-gray-300'
        }
        ${className}
      `}
      aria-invalid={error ? 'true' : undefined}
      {...props}
    />
  );
});

export default NumberInput;
