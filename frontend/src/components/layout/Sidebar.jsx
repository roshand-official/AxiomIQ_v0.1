// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  Layers,
  FileText,
  RefreshCw,
  Tag,
  Receipt,
  FileStack,
  CreditCard,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  User,
} from 'lucide-react';
import Tooltip from '../common/Tooltip';
import AxiomLogo from '../common/AxiomLogo';
import { useApp } from '../../contexts/AppContext';

export default function Sidebar({ role = 'admin', collapsed = false, onToggle }) {
  const { notifications, subscriptions, invoices } = useApp();

  const overdueInvoicesCount = invoices.filter((i) => i.status === 'overdue').length;
  const activeSubsCount = subscriptions.filter((s) => s.status === 'active').length;

  const adminNavGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Executive Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Customers', path: '/admin/customers', icon: Users },
        { label: 'Staff Directory', path: '/admin/staff', icon: UserCog },
        { label: 'Products', path: '/admin/products', icon: Package },
        { label: 'Subscription Plans', path: '/admin/plans', icon: Layers },
        { label: 'Quotations', path: '/admin/quotations', icon: FileText },
        {
          label: 'Subscriptions',
          path: '/admin/subscriptions',
          icon: RefreshCw,
          badge: activeSubsCount,
        },
        { label: 'Discounts', path: '/admin/discounts', icon: Tag },
      ],
    },
    {
      title: 'FINANCE & BILLING',
      items: [
        { label: 'Billing Center', path: '/admin/billing', icon: Receipt },
        {
          label: 'Invoices',
          path: '/admin/invoices',
          icon: FileStack,
          badge: overdueInvoicesCount > 0 ? overdueInvoicesCount : null,
          badgeVariant: 'danger',
        },
        { label: 'Payments', path: '/admin/payments', icon: CreditCard },
      ],
    },
    {
      title: 'INSIGHTS & AUDIT',
      items: [
        { label: 'Financial Reports', path: '/admin/reports', icon: BarChart3 },
        { label: 'Revenue Risk', path: '/admin/revenue-risk', icon: AlertTriangle },
        { label: 'Subscription Analytics', path: '/admin/analytics', icon: TrendingUp },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const staffNavGroups = [
    {
      title: 'MAIN',
      items: [
        { label: 'My Overview', path: '/staff/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'PORTFOLIO',
      items: [
        { label: 'Assigned Customers', path: '/staff/customers', icon: Users },
        { label: 'Quotations', path: '/staff/quotations', icon: FileText },
        { label: 'Subscriptions', path: '/staff/subscriptions', icon: RefreshCw },
      ],
    },
    {
      title: 'BILLING OPERATIONS',
      items: [
        { label: 'Invoices', path: '/staff/invoices', icon: FileStack },
        { label: 'Payments', path: '/staff/payments', icon: CreditCard },
        { label: 'Billing Activity', path: '/staff/billing-activity', icon: Activity },
      ],
    },
  ];

  const portalNavGroups = [
    {
      title: 'PORTAL',
      items: [
        { label: 'My Dashboard', path: '/portal/dashboard', icon: LayoutDashboard },
        { label: 'Active Subscriptions', path: '/portal/subscriptions', icon: RefreshCw },
        { label: 'Invoices & Tax Slips', path: '/portal/invoices', icon: FileStack },
        { label: 'Payment Receipts', path: '/portal/payments', icon: CreditCard },
        { label: 'Renewal Requests', path: '/portal/renewals', icon: RefreshCw },
        { label: 'Account Profile', path: '/portal/profile', icon: User },
      ],
    },
  ];

  const groups =
    role === 'staff'
      ? staffNavGroups
      : role === 'customer'
      ? portalNavGroups
      : adminNavGroups;

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-200 bg-[#121E33] text-white flex flex-col border-r border-[#1E2E4A] select-none ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E2E4A] flex-shrink-0 bg-[#0F1A2D]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {collapsed ? (
            <AxiomLogo variant="mark" size="sm" theme="dark" />
          ) : (
            <AxiomLogo
              variant="full"
              size="sm"
              theme="dark"
              subtitle={
                role === 'customer'
                  ? 'Subscriber Portal'
                  : role === 'staff'
                  ? 'Staff Operations'
                  : 'Subscription OS'
              }
            />
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3.5 px-2.5 space-y-5 no-scrollbar">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-0.5">
            {!collapsed && (
              <p className="px-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                {group.title}
              </p>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;

              const content = (
                <NavLink
                  to={item.path}
                  end={item.path.endsWith('/dashboard')}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-action text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-[#1B2942] hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-white" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge != null && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums font-semibold ${
                            item.badgeVariant === 'danger'
                              ? 'bg-rose-500/25 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-700/60 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );

              return collapsed ? (
                <Tooltip key={item.path} content={item.label} position="right">
                  {content}
                </Tooltip>
              ) : (
                <div key={item.path}>{content}</div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2.5 border-t border-[#1E2E4A] bg-[#0F1A2D] flex items-center justify-between flex-shrink-0">
        {!collapsed && (
          <div className="text-[10px] font-mono text-slate-400 px-1.5">
            <span>v1.0.0</span> • <span>PROD</span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#1B2942] transition-colors ml-auto cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
