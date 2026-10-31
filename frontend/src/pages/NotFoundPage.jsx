// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { AxiomLogo } from '../components/common';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-4">
        <AxiomLogo size="xl" theme="light" />
      </div>
      <h1 className="text-4xl font-extrabold text-navy tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-navy mt-1">Page Not Found</h2>
      <p className="text-xs text-text-secondary mt-2 max-w-sm leading-relaxed">
        The requested URL path does not exist in the AxiomIQ Subscription Management routing registry.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/admin/dashboard" className="btn btn-primary btn-sm flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5" />
          <span>Admin Workspace</span>
        </Link>
        <Link to="/login" className="btn btn-secondary btn-sm flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Login Screen</span>
        </Link>
      </div>
    </div>
  );
}
