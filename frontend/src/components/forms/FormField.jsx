// src/components/forms/FormField.jsx
// ============================================================================
// Form field wrapper — label, error, required indicator, help text
// ============================================================================
import React from 'react';

export default function FormField({
  label,
  error,
  required = false,
  helpText,
  htmlFor,
  className = '',
  children,
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-[#172B4D] select-none"
        >
          {label}
          {required && (
            <span className="ml-0.5 text-[#DC5252]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}

      {error && (
        <p className="text-xs text-[#DC5252] flex items-center gap-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
