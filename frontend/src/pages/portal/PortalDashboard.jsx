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
  Bell,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { mockCustomerPortalData } from '../../data/mockData';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge, KPICard } from '../../components/common';

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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card p-6 bg-linear-to-r from-navy to-navy-light text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-action/30 text-white border border-action/40 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-action-light" />
            <span>Subscriber Self-Service Portal</span>
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {customer?.company || customer?.name}
          </h1>
          <p className="mt-1 text-xs text-gray-300 leading-relaxed">
            Manage active cloud software licenses, review GST compliant invoices, pay balances, and track automated renewals.
          </p>
        </div>
      </div>

      {/* Announcements */}
      {mockCustomerPortalData.announcements?.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs">
          <div className="flex items-center gap-2 text-action font-bold mb-1">
            <Bell className="w-4 h-4" />
            <span>Latest Service Announcements</span>
          </div>
          <div className="space-y-1.5 text-text-primary">
            {mockCustomerPortalData.announcements.map((ann) => (
              <p key={ann.id}>
                <span className="font-semibold text-navy">{ann.title}:</span> {ann.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase">
              Active Subscriptions
            </span>
            <RefreshCw className="w-4 h-4 text-action" />
          </div>
          <p className="text-2xl font-bold text-navy mt-2">{activeSubs.length}</p>
          <p className="text-[11px] text-text-muted mt-1">
            {mySubscriptions.length} total contracts
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase">
              Upcoming Renewal Date
            </span>
            <Calendar className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold text-navy mt-2">
            {nextRenewalSub?.nextBillingDate ? formatDate(nextRenewalSub.nextBillingDate) : 'Ongoing'}
          </p>
          <p className="text-[11px] text-text-muted mt-1">
            {nextRenewalSub?.subscriptionNumber || 'None due'}
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase">
              Outstanding Balance
            </span>
            <CreditCard className="w-4 h-4 text-danger" />
          </div>
          <p className={`text-2xl font-bold mt-2 ${outstandingTotal > 0 ? 'text-danger' : 'text-success'}`}>
            {formatCurrency(outstandingTotal)}
          </p>
          <p className="text-[11px] text-text-muted mt-1">
            {outstandingTotal > 0 ? 'Payment required' : 'All accounts settled'}
          </p>
        </div>
      </div>

      {/* Grid: My Subscriptions & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Subscriptions Card */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-navy">
              My Subscriptions ({mySubscriptions.length})
            </h3>
            <Link
              to="/portal/subscriptions"
              className="text-xs text-action hover:underline font-medium flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {mySubscriptions.map((sub) => {
              const plan = plans.find((p) => p.id === sub.planId);
              return (
                <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
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
                      Plan: <span className="text-text-primary font-medium">{plan?.name}</span> • Next Billing:{' '}
                      {sub.nextBillingDate ? formatDate(sub.nextBillingDate) : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-navy text-xs block">
                      {formatCurrency(sub.recurringAmount)}
                    </span>
                    <Link
                      to={`/portal/subscriptions/${sub.id}`}
                      className="text-[11px] text-action hover:underline font-medium inline-block mt-0.5"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Invoices Card */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-navy">
              Recent Invoices & Receipts
            </h3>
            <Link
              to="/portal/invoices"
              className="text-xs text-action hover:underline font-medium flex items-center gap-1"
            >
              <span>View invoices</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-text-secondary uppercase font-semibold">
                <th className="px-4 py-2.5">Invoice #</th>
                <th className="px-4 py-2.5">Due Date</th>
                <th className="px-4 py-2.5 text-right">Amount</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {myInvoices.slice(0, 4).map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono font-medium text-navy">
                    <Link to={`/portal/invoices/${inv.id}`} className="hover:underline">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3 text-right font-bold text-navy">
                    {formatCurrency(inv.totalAmount)}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
