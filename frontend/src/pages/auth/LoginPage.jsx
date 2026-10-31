// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Shield, Briefcase, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@axiomiq.io');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { login, loginAsRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      toast.success(`Welcome back, ${res.user.name}!`);
      if (res.user.role === 'admin') navigate('/admin/dashboard');
      else if (res.user.role === 'staff') navigate('/staff/dashboard');
      else if (res.user.role === 'customer') navigate('/portal/dashboard');
    } else {
      toast.error(res.error || 'Authentication failed');
    }
  };

  const handleDemoLogin = async (role) => {
    setSubmitting(true);
    const res = await loginAsRole(role);
    setSubmitting(false);

    if (res.success) {
      toast.success(`Signed in as ${res.user.name} (${role})`);
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'staff') navigate('/staff/dashboard');
      else if (role === 'customer') navigate('/portal/dashboard');
    } else {
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
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-action shadow-lg mb-4">
          <Zap className="w-7 h-7 text-white fill-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-navy">
          AxiomIQ
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Subscription Management & Recurring Revenue OS
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-sm border border-border">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label" htmlFor="email">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-action hover:underline cursor-pointer"
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
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-action focus:ring-action cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-text-secondary cursor-pointer">
                Remember this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn btn-primary flex items-center justify-center gap-2 mt-2"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-text-muted font-semibold tracking-wider">
                Or Instant Demo Access
              </span>
            </div>
          </div>

          {/* Demo Roles Grid */}
          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-action/50 hover:bg-blue-50/30 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-navy/5 text-action group-hover:bg-action group-hover:text-white transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    Administrator Workspace
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    Full billing, financial analytics & management
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-action transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('staff')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-warning/50 hover:bg-amber-50/30 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10 text-warning group-hover:bg-warning group-hover:text-white transition-colors">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    Internal Staff Workspace
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    Assigned accounts, quotations & daily operations
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-warning transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-success/50 hover:bg-emerald-50/30 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10 text-success group-hover:bg-success group-hover:text-white transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    Customer Self-Service Portal
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    Invoices, subscription renewal & payments
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-success transition-colors" />
            </button>
          </div>
        </div>

        {/* Demo credentials hint */}
        <p className="text-center text-[11px] text-text-secondary mt-6">
          Connected to <span className="font-mono text-navy font-medium">AxiomIQ PostgreSQL & Prisma Engine</span>.
        </p>
      </div>
    </div>
  );
}
