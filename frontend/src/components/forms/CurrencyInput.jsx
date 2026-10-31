// src/components/forms/CurrencyInput.jsx
// ============================================================================
// Input with ₹ prefix — formats to INR on blur
// ============================================================================
import React, { forwardRef, useState, useCallback } from 'react';

/**
 * Formats a numeric value to INR display string (e.g. "1,23,456.00").
 */
function formatINR(value) {
  if (value === '' || value === null || value === undefined || isNaN(Number(value))) {
    return '';
  }
  const num = Number(value);
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Strips formatting characters and returns a clean numeric string.
 */
function parseINR(formatted) {
  if (!formatted) return '';
  return formatted.replace(/,/g, '');
}

const CurrencyInput = forwardRef(function CurrencyInput(
  { error, value, onChange, onBlur, onFocus, className = '', ...props },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(() =>
    value !== undefined && value !== '' ? formatINR(value) : ''
  );

  // When focused, show raw numeric value for easy editing
  const handleFocus = useCallback(
    (e) => {
      setIsFocused(true);
      const raw = parseINR(displayValue);
      setDisplayValue(raw);
      onFocus?.(e);
    },
    [displayValue, onFocus]
  );

  // On blur, format the value
  const handleBlur = useCallback(
    (e) => {
      setIsFocused(false);
      const raw = parseINR(e.target.value);
      const formatted = formatINR(raw);
      setDisplayValue(formatted);
      // Propagate numeric value
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: raw, name: e.target.name },
        };
        onChange(syntheticEvent);
      }
      onBlur?.(e);
    },
    [onChange, onBlur]
  );

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      // Allow digits, decimal point, and empty
      if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
        setDisplayValue(val);
        if (onChange) {
          onChange(e);
        }
      }
    },
    [onChange]
  );

  // Sync with external controlled value changes when not focused
  React.useEffect(() => {
    if (!isFocused && value !== undefined) {
      setDisplayValue(formatINR(value));
    }
  }, [value, isFocused]);

  return (
    <div className="relative">
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 select-none"
        aria-hidden="true"
      >
        ₹
      </span>
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
          w-full rounded-lg border pl-7 pr-3 py-2 text-sm text-[#172B4D]
          placeholder:text-gray-400
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
    </div>
  );
});

export default CurrencyInput;
