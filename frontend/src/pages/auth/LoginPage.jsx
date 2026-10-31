// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Briefcase,
  Users,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import AxiomLogo from '../../components/common/AxiomLogo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginAsRole } = useAuth();

  const [email, setEmail] = useState('admin@axiomiq.io');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Signed in as ${res.user.name}`);
        if (res.user.role === 'admin') navigate('/admin/dashboard');
        else if (res.user.role === 'staff') navigate('/staff/dashboard');
        else if (res.user.role === 'customer') navigate('/portal/dashboard');
      } else {
        toast.error(res.error || 'Authentication failed');
      }
    } catch {
      toast.error('Authentication request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (role) => {
    try {
      const res = await loginAsRole(role);
      if (res.success) {
        toast.success(`Instant demo access granted: ${role.toUpperCase()}`);
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'staff') navigate('/staff/dashboard');
        else if (role === 'customer') navigate('/portal/dashboard');
      }
    } catch {
      toast.error('Could not authenticate demo role');
    }
  };

  const handleForgotPassword = () => {
    toast.info('Password reset dispatch simulated.');
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Top Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-3">
          <AxiomLogo variant="full" size="xl" theme="light" />
        </div>
        <p className="text-xs text-text-secondary mt-1 font-medium">
          Subscription Management & Enterprise Recurring Revenue OS
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-7 px-6 sm:px-8 rounded-md border border-border shadow-xs">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label" htmlFor="email">
                Work Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="input-field pl-8 font-mono text-xs"
                />
                <Mail className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-medium text-action hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pl-8 pr-9 font-mono text-xs"
                />
                <Lock className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-text-muted hover:text-text-primary cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-border text-action focus:ring-action cursor-pointer"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn btn-primary flex items-center justify-center gap-2 mt-2"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2.5 text-text-muted font-semibold tracking-wider">
                Instant Role Switcher
              </span>
            </div>
          </div>

          {/* Demo Roles Grid */}
          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-border hover:border-action/60 hover:bg-surface-subtle transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-action-light text-action">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    Administrator Workspace
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    Full billing engine, financial operations & reports
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-action transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('staff')}
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-border hover:border-warning/60 hover:bg-surface-subtle transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-warning-light text-warning">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    Internal Staff Workspace
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    Assigned accounts, quotes & billing operations
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-warning transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              className="w-full flex items-center justify-between p-2.5 rounded-md border border-border hover:border-success/60 hover:bg-surface-subtle transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-success-light text-success">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    Customer Self-Service Portal
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    Active licenses, invoice slips & renewal requests
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-success transition-colors" />
            </button>
          </div>
        </div>

        {/* Demo credentials hint */}
        <p className="text-center text-[11px] text-text-muted mt-5 font-mono">
          Connected to <span className="text-text-primary font-medium">AxiomIQ PostgreSQL Backend</span>
        </p>
      </div>
    </div>
  );
}
