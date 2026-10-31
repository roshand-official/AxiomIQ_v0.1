// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-action flex items-center justify-center text-white mb-4 shadow-lg">
        <Zap className="w-8 h-8 fill-white" />
      </div>
      <h1 className="text-4xl font-extrabold text-navy tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-navy mt-1">Page Not Found</h2>
      <p className="text-xs text-text-secondary mt-2 max-w-sm leading-relaxed">
        The requested URL path does not exist in the Brightloop Subscription Management routing registry.
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
