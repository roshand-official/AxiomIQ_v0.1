// src/components/forms/RadioGroup.jsx
// ============================================================================
// Radio button group — styled consistently
// ============================================================================
import React, { forwardRef } from 'react';

const RadioGroup = forwardRef(function RadioGroup(
  {
    options = [],
    name,
    value,
    onChange,
    disabled = false,
    error,
    direction = 'vertical', // 'vertical' | 'horizontal'
    className = '',
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={name}
      className={`
        flex gap-3
        ${direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}
        ${className}
      `}
      {...props}
    >
      {options.map((opt) => {
        const optId = `${name}-${opt.value}`;
        const isSelected = value === opt.value;

        return (
          <label
            key={opt.value}
            htmlFor={optId}
            className={`
              inline-flex items-center gap-2 cursor-pointer select-none
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="relative flex-shrink-0">
              <input
                id={optId}
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                onChange={onChange}
                disabled={disabled}
                className="sr-only peer"
                aria-invalid={error ? 'true' : undefined}
              />
              <div
                className={`
                  h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center
                  transition-all duration-150
                  peer-focus-visible:ring-2 peer-focus-visible:ring-[#3B82F6]/30
                  ${isSelected
                    ? 'border-[#3B82F6]'
                    : error
                      ? 'border-[#DC5252] bg-white'
                      : 'border-[#E5EAF0] bg-white hover:border-gray-300'
                  }
                `}
              >
                {isSelected && (
                  <div className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
                )}
              </div>
            </div>

            <span className="text-sm text-[#172B4D]">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
});

export default RadioGroup;
