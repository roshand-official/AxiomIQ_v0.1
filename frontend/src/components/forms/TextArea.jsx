// src/components/forms/TextArea.jsx
// ============================================================================
// Multi-line textarea — resizable, consistent styling
// ============================================================================
import React, { forwardRef } from 'react';

const TextArea = forwardRef(function TextArea(
  { error, rows = 4, className = '', ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`
        w-full rounded-lg border px-3 py-2 text-sm text-[#172B4D]
        placeholder:text-gray-400
        bg-white
        resize-y min-h-[80px]
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
  );
});

export default TextArea;
