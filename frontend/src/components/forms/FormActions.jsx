// src/components/forms/FormActions.jsx
// ============================================================================
// Form action bar — primary submit + secondary cancel buttons
// ============================================================================
import React from 'react';
import { Loader2 } from 'lucide-react';

export default function FormActions({
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  disabled = false,
  className = '',
}) {
  return (
    <div
      className={`flex items-center justify-end gap-3 pt-4 border-t border-[#E5EAF0] ${className}`}
    >
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="
            px-4 py-2 rounded-lg text-sm font-medium
            text-[#172B4D] bg-white border border-[#E5EAF0]
            hover:bg-gray-50 hover:border-gray-300
            transition-colors duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {cancelLabel}
        </button>
      )}

      <button
        type={onSubmit ? 'button' : 'submit'}
        onClick={onSubmit}
        disabled={loading || disabled}
        className="
          px-5 py-2 rounded-lg text-sm font-medium
          text-white bg-[#3B82F6]
          hover:bg-[#2563EB]
          transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2
        "
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {submitLabel}
      </button>
    </div>
  );
}
