// src/components/common/Modal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}) {
  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-navy/40 backdrop-blur-xs"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          className={`relative w-full ${sizeClasses[size] || sizeClasses.md} bg-white rounded-xl shadow-2xl border border-border overflow-hidden z-10 flex flex-col my-8 max-h-[90vh]`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gray-50/50">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
              {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-gray-50/50">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
