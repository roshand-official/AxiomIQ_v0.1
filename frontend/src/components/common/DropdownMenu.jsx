// src/components/common/DropdownMenu.jsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DropdownMenu({
  trigger,
  items = [],
  align = 'right',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer inline-flex">
        {trigger}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${alignClasses[align] || alignClasses.right} mt-2 w-48 rounded-xl bg-white shadow-lg border border-border py-1.5 z-40 focus:outline-none`}
          >
            {items.map((item, idx) => {
              if (item.divider) {
                return <div key={`div-${idx}`} className="my-1 border-t border-border" />;
              }
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.onClick) item.onClick();
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    item.variant === 'danger'
                      ? 'text-danger hover:bg-danger/10'
                      : 'text-text-primary hover:bg-gray-50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-text-secondary" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
