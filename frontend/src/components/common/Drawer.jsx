// src/components/common/Drawer.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Drawer({
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
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-navy/40 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`w-screen ${sizeClasses[size] || sizeClasses.md} bg-white shadow-2xl border-l border-border flex flex-col`}
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

            {/* Content */}
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
      </div>
    </AnimatePresence>
  );
}
