// src/components/feedback/Toast.jsx
import { Toaster as SonnerToaster } from 'sonner';

export default function Toast() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className: 'rounded-xl border border-border shadow-lg font-sans text-sm',
        style: {
          background: '#FFFFFF',
          color: '#172B4D',
        },
      }}
    />
  );
}
