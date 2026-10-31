// src/components/common/SearchInput.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({
  value: controlledValue,
  onChange,
  placeholder = 'Search…',
  debounceMs = 300,
  className = '',
}) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? '');
  const timerRef = useRef(null);
  const isControlled = controlledValue !== undefined;

  // Sync with controlled value
  useEffect(() => {
    if (isControlled) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue, isControlled]);

  const debouncedOnChange = useCallback(
    (val) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onChange?.(val);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setInternalValue(val);
    debouncedOnChange(val);
  };

  const handleClear = () => {
    setInternalValue('');
    if (timerRef.current) clearTimeout(timerRef.current);
    onChange?.('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="input-field pl-9 pr-9"
      />
      {internalValue && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
