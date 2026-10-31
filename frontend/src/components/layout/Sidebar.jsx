// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  Zap,
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
  Bell,
  User,
} from 'lucide-react';
import Tooltip from '../common/Tooltip';
import { useApp } from '../../contexts/AppContext';

export default function Sidebar({ role = 'admin', collapsed = false, onToggle }) {
  const { notifications, subscriptions, invoices } = useApp();

  const overdueInvoicesCount = invoices.filter((i) => i.status === 'overdue').length;
  const activeSubsCount = subscriptions.filter((s) => s.status === 'active').length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const adminNavGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Executive Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { label: 'Customers', path: '/admin/customers', icon: Users },
        { label: 'Staff Management', path: '/admin/staff', icon: UserCog },
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
      title: 'BILLING & FINANCE',
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
      title: 'INSIGHTS & REPORTS',
      items: [
        { label: 'Financial Reports', path: '/admin/reports', icon: BarChart3 },
        { label: 'Revenue Risk', path: '/admin/revenue-risk', icon: AlertTriangle },
        { label: 'Subscription Analytics', path: '/admin/analytics', icon: TrendingUp },
      ],
    },
    {
      title: 'SYSTEM',
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
      title: 'WORKSPACE',
      items: [
        { label: 'Assigned Customers', path: '/staff/customers', icon: Users },
        { label: 'Quotations', path: '/staff/quotations', icon: FileText },
        { label: 'Subscriptions', path: '/staff/subscriptions', icon: RefreshCw },
      ],
    },
    {
      title: 'BILLING & ACTIVITY',
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
        { label: 'My Subscriptions', path: '/portal/subscriptions', icon: RefreshCw },
        { label: 'My Invoices', path: '/portal/invoices', icon: FileStack },
        { label: 'My Payments', path: '/portal/payments', icon: CreditCard },
        { label: 'Renewal Requests', path: '/portal/renewals', icon: RefreshCw },
        { label: 'My Profile', path: '/portal/profile', icon: User },
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
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-navy text-white flex flex-col border-r border-navy-light ${collapsed ? 'w-18' : 'w-64'
        }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-navy-light flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-action flex items-center justify-center flex-shrink-0 shadow-md">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <span className="font-bold text-base tracking-tight text-white">
                AxoimIQQI
              </span>
              <span className="block text-[10px] text-gray-300 tracking-wider uppercase font-semibold">
                {role === 'customer' ? 'Customer Portal' : 'Subscription OS'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 no-scrollbar">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
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
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${isActive
                      ? 'bg-action text-white shadow-sm font-semibold'
                      : 'text-gray-300 hover:bg-navy-light hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge != null && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeVariant === 'danger'
                              ? 'bg-danger text-white'
                              : 'bg-navy-dark text-white'
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
      <div className="p-3 border-t border-navy-light flex items-center justify-between flex-shrink-0">
        {!collapsed && (
          <div className="text-[11px] text-gray-400">
            <span>v1.0.0</span> • <span className="text-gray-400">AxoimIQQI</span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-navy-light transition-colors ml-auto cursor-pointer"
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
