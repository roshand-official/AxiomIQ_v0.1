// src/pages/portal/PortalDashboard.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw,
  FileText,
  CreditCard,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common';

export default function PortalDashboard() {
  const { user } = useAuth();
  const { subscriptions, invoices, payments, customers, plans } = useApp();

  // Active customer ID (default to TechSolutions CUST-001 for demo)
  const customerId = user?.customerId || 'CUST-001';
  const customer = customers.find((c) => c.id === customerId);

  // Filter isolated customer data
  const mySubscriptions = useMemo(
    () => subscriptions.filter((s) => s.customerId === customerId),
    [subscriptions, customerId]
  );

  const myInvoices = useMemo(
    () => invoices.filter((i) => i.customerId === customerId),
    [invoices, customerId]
  );

  const myPayments = useMemo(
    () => payments.filter((p) => p.customerId === customerId),
    [payments, customerId]
  );

  const activeSubs = mySubscriptions.filter((s) => s.status === 'active');
  const outstandingTotal = myInvoices
    .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.outstandingAmount, 0);

  const nextRenewalSub = activeSubs[0];

  return (
    <div className="space-y-5">
      {/* Account Overview Header */}
      <div className="card p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-surface-subtle text-text-secondary border border-border">
              {customer?.id || customerId}
            </span>
            <span className="text-[11px] font-medium text-success bg-success-light border border-success/20 px-1.5 py-0.5 rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Verified Account
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-navy mt-1.5">
            {customer?.company || customer?.name || 'Customer Account'}
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            GSTIN: <span className="font-mono text-text-primary">29AABCU9603R1ZM</span> • Primary Billing Contact:{' '}
            <span className="font-mono text-text-primary">{customer?.email || user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/portal/invoices" className="btn btn-secondary btn-sm">
            <FileText className="w-3.5 h-3.5" />
            <span>Tax Invoices</span>
          </Link>
          <Link to="/portal/renewals" className="btn btn-primary btn-sm">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Request Renewal</span>
          </Link>
        </div>
      </div>

      {/* 3-Column Unified Ribbon */}
      <div className="card grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Active Licenses
            </span>
            <span className="text-[10px] font-medium text-action bg-action-light px-1.5 py-0.2 rounded border border-action/20">
              In Service
            </span>
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-navy font-mono tabular-nums tracking-tight">
              {activeSubs.length}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {mySubscriptions.length} total contracts registered
            </p>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Next Scheduled Renewal
            </span>
            <span className="text-[10px] font-medium text-text-muted bg-surface-subtle px-1.5 py-0.2 rounded border border-border font-mono">
              {nextRenewalSub?.subscriptionNumber || 'Active'}
            </span>
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-navy font-mono tabular-nums tracking-tight">
              {nextRenewalSub?.nextBillingDate ? formatDate(nextRenewalSub.nextBillingDate) : 'Ongoing'}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Automated cycle reconciliation
            </p>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Outstanding Balance
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
              outstandingTotal > 0
                ? 'bg-danger-light text-danger border-danger/20 font-semibold'
                : 'bg-success-light text-success border-success/20'
            }`}>
              {outstandingTotal > 0 ? 'Due Now' : 'Settled'}
            </span>
          </div>
          <div className="mt-2.5">
            <p className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
              outstandingTotal > 0 ? 'text-danger' : 'text-success'
            }`}>
              {formatCurrency(outstandingTotal)}
            </p>
            <div className="flex items-center justify-between text-[11px] text-text-secondary mt-0.5">
              <span>{myInvoices.filter(i => i.status !== 'paid').length} open invoices</span>
              {outstandingTotal > 0 && (
                <Link to="/portal/invoices" className="text-action hover:underline font-medium">
                  Pay online
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: My Subscriptions & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Subscriptions Card */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-subtle flex items-center justify-between">
            <h3 className="font-semibold text-xs text-navy uppercase tracking-wider">
              Active Software Contracts ({mySubscriptions.length})
            </h3>
            <Link
              to="/portal/subscriptions"
              className="text-xs text-action hover:underline font-medium flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {mySubscriptions.map((sub) => {
              const plan = plans.find((p) => p.id === sub.planId);
              return (
                <div key={sub.id} className="p-3.5 flex items-center justify-between hover:bg-surface-subtle transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/portal/subscriptions/${sub.id}`}
                        className="font-mono text-xs font-semibold text-navy hover:text-action hover:underline"
                      >
                        {sub.subscriptionNumber}
                      </Link>
                      <StatusBadge status={sub.status} />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Plan: <span className="font-medium text-text-primary">{plan?.name || sub.planId}</span>
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5 font-mono">
                      Started: {formatDate(sub.startDate)} • Next billing: {formatDate(sub.nextBillingDate || sub.expiryDate)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-navy font-mono tabular-nums">
                      {formatCurrency(sub.recurringAmount)}
                    </p>
                    <span className="text-[10px] uppercase font-semibold text-text-muted block">
                      {sub.billingFrequency || 'Monthly'}
                    </span>
                    <Link
                      to={`/portal/subscriptions/${sub.id}`}
                      className="text-xs text-action hover:underline mt-1 inline-block font-medium"
                    >
                      Details & Renewal
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Invoices Card */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface-subtle flex items-center justify-between">
            <h3 className="font-semibold text-xs text-navy uppercase tracking-wider">
              Billing History & Tax Invoices ({myInvoices.length})
            </h3>
            <Link
              to="/portal/invoices"
              className="text-xs text-action hover:underline font-medium flex items-center gap-1"
            >
              <span>All invoices</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {myInvoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="p-3.5 flex items-center justify-between hover:bg-surface-subtle transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/portal/invoices/${inv.id}`}
                      className="font-mono text-xs font-semibold text-navy hover:text-action hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1 font-mono">
                    Date: {formatDate(inv.invoiceDate)} • Due: {formatDate(inv.dueDate)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-navy font-mono tabular-nums">
                    {formatCurrency(inv.totalAmount)}
                  </p>
                  {inv.outstandingAmount > 0 ? (
                    <span className="text-[11px] text-danger font-semibold font-mono tabular-nums block">
                      {formatCurrency(inv.outstandingAmount)} due
                    </span>
                  ) : (
                    <span className="text-[10px] text-success font-semibold uppercase block">
                      Fully Paid
                    </span>
                  )}
                  <Link
                    to={`/portal/invoices/${inv.id}`}
                    className="text-xs text-action hover:underline mt-0.5 inline-block font-medium"
                  >
                    View Tax Invoice
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
