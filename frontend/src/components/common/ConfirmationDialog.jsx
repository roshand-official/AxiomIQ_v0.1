// src/components/common/ConfirmationDialog.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-navy/40 backdrop-blur-xs"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-border p-6 z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${confirmVariant === 'danger' ? 'bg-danger/10 text-danger' : 'bg-action/10 text-action'}`}>
              {confirmVariant === 'danger' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary btn-sm"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`btn btn-sm ${confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
