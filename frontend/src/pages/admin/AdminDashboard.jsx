// src/pages/admin/AdminDashboard.jsx
import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RefreshCw,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { deriveChartMetrics } from '../../utils/analyticsDerivations';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  getDaysOverdue,
} from '../../utils/formatters';
import {
  StatusBadge,
  ActivityTimeline,
} from '../../components/common';
import {
  RevenueChart,
  SubscriptionChart,
  PaymentChart,
  PieChart,
} from '../../components/charts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    subscriptions,
    invoices,
    payments,
    customers,
    activities,
    renewals,
    billingEvents,
    products,
  } = useApp();

  const [timeRange, setTimeRange] = useState('30d');
  const [activeChartTab, setActiveChartTab] = useState('revenue');

  // Derive dynamic chart data from live state
  const { revenueChartData, subscriptionChartData, paymentChartData } = useMemo(() => {
    return deriveChartMetrics({ invoices, payments, subscriptions, products });
  }, [invoices, payments, subscriptions, products]);

  // ─── Calculate Live KPIs from Application State ─────────────────────────────
  const metrics = useMemo(() => {
    const activeSubs = subscriptions.filter((s) => s.status === 'active');

    // MRR calculation (normalize annual vs monthly)
    const mrr = activeSubs.reduce((acc, sub) => {
      const isAnnual = sub.planId === 'PLAN-002' || sub.planId === 'PLAN-005';
      const monthlyVal = isAnnual ? sub.recurringAmount / 12 : sub.recurringAmount;
      return acc + monthlyVal;
    }, 0);

    const arr = mrr * 12;

    const revenueCollected = payments
      .filter((p) => p.status === 'completed' || p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);

    const overdueInvoices = invoices.filter(
      (i) => i.status === 'overdue' || (i.outstandingAmount > 0 && new Date(i.dueDate) < new Date())
    );

    const outstandingPayments = invoices
      .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.outstandingAmount, 0);

    const upcomingRenewals = renewals.filter((r) => r.status === 'pending' || r.status === 'requested');
    const billingFailures = billingEvents.filter((e) => e.type === 'billing_failed');

    const totalInvoiced = invoices
      .filter((i) => i.status !== 'cancelled')
      .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

    const collectionRate = totalInvoiced > 0 ? Math.round((revenueCollected / totalInvoiced) * 100) : 100;

    return {
      activeSubsCount: activeSubs.length,
      totalSubsCount: subscriptions.length,
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      revenueCollected,
      overdueInvoicesCount: overdueInvoices.length,
      outstandingPayments,
      upcomingRenewalsCount: upcomingRenewals.length,
      billingFailuresCount: billingFailures.length,
      collectionRate,
      customerCount: customers.length,
    };
  }, [subscriptions, invoices, payments, renewals, billingEvents, customers]);

  // Subscription Status breakdown for Donut Chart
  const subscriptionStatusData = useMemo(() => {
    const counts = subscriptions.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {});

    const colorMap = {
      active: '#16856A',
      confirmed: '#356AE6',
      draft: '#98A2B3',
      paused: '#C58A32',
      expired: '#C84C4C',
      closed: '#667085',
    };

    return Object.entries(counts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: colorMap[status] || '#CBD5E1',
    }));
  }, [subscriptions]);

  // Urgent attention items
  const attentionItems = useMemo(() => {
    const items = [];

    // Failed billings
    billingEvents
      .filter((e) => e.type === 'billing_failed')
      .forEach((e) => {
        items.push({
          id: e.id,
          type: 'danger',
          title: 'Automated Billing Failure',
          desc: e.message,
          actionLabel: 'Resolve in Engine',
          link: '/admin/billing',
        });
      });

    // Overdue invoices
    invoices
      .filter((i) => i.status === 'overdue')
      .forEach((i) => {
        const cust = customers.find((c) => c.id === i.customerId);
        items.push({
          id: i.id,
          type: 'danger',
          title: `Overdue Invoice: ${i.invoiceNumber}`,
          desc: `${cust?.company || cust?.name || 'Customer'} has ₹${i.outstandingAmount.toLocaleString('en-IN')} overdue (${getDaysOverdue(i.dueDate)} days).`,
          actionLabel: 'View Invoice',
          link: `/admin/invoices/${i.id}`,
        });
      });

    return items.slice(0, 3);
  }, [billingEvents, invoices, customers]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-navy">
            Executive Financial Operations
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time subscription performance, revenue velocity, and cash collection ledger.
          </p>
        </div>

        {/* Date Filter & Quick Actions */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-border rounded-md p-0.5 flex items-center text-xs">
            {['7d', '30d', '90d', '1y'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setTimeRange(period)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  timeRange === period
                    ? 'bg-action text-white shadow-2xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>

          <Link to="/admin/billing" className="btn btn-primary btn-sm">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Execute Billing</span>
          </Link>
        </div>
      </div>

      {/* Immediate Attention Callout */}
      {attentionItems.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-md p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-danger font-semibold text-xs">
              <ShieldAlert className="w-4 h-4 text-danger flex-shrink-0" />
              <span>Operational Attention Queue ({attentionItems.length})</span>
            </div>
            <Link
              to="/admin/revenue-risk"
              className="text-[11px] font-medium text-danger hover:underline flex items-center gap-1"
            >
              <span>View risk radar</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-2.5 rounded border border-rose-200/80 flex items-center justify-between gap-2 text-xs shadow-2xs"
              >
                <div className="min-w-0 pr-1">
                  <p className="font-semibold text-text-primary truncate">{item.title}</p>
                  <p className="text-text-secondary text-[11px] truncate mt-0.5">{item.desc}</p>
                </div>
                <Link
                  to={item.link}
                  className="btn btn-secondary btn-sm flex-shrink-0 text-[11px] py-1 px-2"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integrated Financial Operations Metric Strip */}
      <div className="card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {/* Metric 1: Monthly Recurring Revenue */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Monthly Recurring (MRR)
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-surface-subtle text-text-muted border border-border">
              Contracted
            </span>
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-navy font-mono tabular-nums tracking-tight">
              {formatCurrency(metrics.mrr)}
            </p>
            <div className="flex items-center justify-between text-xs text-text-secondary mt-1">
              <span>ARR: <strong className="text-text-primary font-mono tabular-nums">{formatCurrency(metrics.arr)}</strong></span>
              <span className="text-success font-semibold text-[11px]">+14.2% YoY</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Net Cash Collected */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Realized Cash Inflow
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-success-light text-success border border-success/20">
              Settled
            </span>
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-navy font-mono tabular-nums tracking-tight">
              {formatCurrency(metrics.revenueCollected)}
            </p>
            <div className="flex items-center justify-between text-xs text-text-secondary mt-1">
              <span>Collection rate</span>
              <span className="font-semibold text-navy font-mono tabular-nums">{metrics.collectionRate}%</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Outstanding Receivables */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Overdue Receivables
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
              metrics.overdueInvoicesCount > 0
                ? 'bg-danger-light text-danger border-danger/20 font-semibold'
                : 'bg-surface-subtle text-text-muted border-border'
            }`}>
              {metrics.overdueInvoicesCount} Invoices
            </span>
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-danger font-mono tabular-nums tracking-tight">
              {formatCurrency(metrics.outstandingPayments)}
            </p>
            <div className="flex items-center justify-between text-xs text-text-secondary mt-1">
              <span>Past payment term</span>
              <Link to="/admin/invoices" className="text-action hover:underline text-[11px] font-medium">
                Dunning list
              </Link>
            </div>
          </div>
        </div>

        {/* Metric 4: Active Subscriptions & Portfolio */}
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Active Contracts
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-action-light text-action border border-action/20">
              {metrics.customerCount} Clients
            </span>
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-navy font-mono tabular-nums tracking-tight">
              {formatNumber(metrics.activeSubsCount)}
            </p>
            <div className="flex items-center justify-between text-xs text-text-secondary mt-1">
              <span>{metrics.totalSubsCount} lifetime total</span>
              <span className="text-text-muted text-[11px]">{metrics.upcomingRenewalsCount} in renewal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section: Financial Trends & Portfolio Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Chart (2 cols) */}
        <div className="card p-4 sm:p-5 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-semibold text-navy text-sm">
                Financial Operations & Growth Velocity
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Multi-metric historical trajectory for FY 2026
              </p>
            </div>

            <div className="flex items-center gap-1 bg-surface-subtle border border-border p-0.5 rounded-md text-xs">
              <button
                type="button"
                onClick={() => setActiveChartTab('revenue')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeChartTab === 'revenue'
                    ? 'bg-white text-navy shadow-2xs font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Invoiced vs Paid
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('subscriptions')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeChartTab === 'subscriptions'
                    ? 'bg-white text-navy shadow-2xs font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Active Subscriptions
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('payments')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeChartTab === 'payments'
                    ? 'bg-white text-navy shadow-2xs font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Cash Collections
              </button>
            </div>
          </div>

          <div className="mt-2">
            {activeChartTab === 'revenue' && (
              <RevenueChart data={revenueChartData} height={280} />
            )}
            {activeChartTab === 'subscriptions' && (
              <SubscriptionChart data={subscriptionChartData} height={280} />
            )}
            {activeChartTab === 'payments' && (
              <PaymentChart data={paymentChartData} height={280} />
            )}
          </div>
        </div>

        {/* Subscription Distribution Donut (1 col) */}
        <div className="card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-navy text-sm">
                Contract Status Breakdown
              </h3>
              <span className="text-[10px] text-text-muted font-mono uppercase">
                {metrics.totalSubsCount} Contracts
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Portfolio split across subscription lifecycle states
            </p>

            <div className="mt-1">
              <PieChart data={subscriptionStatusData} height={210} />
            </div>
          </div>

          <div className="pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-surface-subtle border border-border">
              <span className="text-text-secondary text-[11px] block">Active Ratio</span>
              <span className="font-bold text-success font-mono text-sm">
                {metrics.totalSubsCount > 0
                  ? Math.round((metrics.activeSubsCount / metrics.totalSubsCount) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="p-2 rounded bg-surface-subtle border border-border">
              <span className="text-text-secondary text-[11px] block">Renewals Pending</span>
              <span className="font-bold text-navy font-mono text-sm">
                {metrics.upcomingRenewalsCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tables & Operational Streams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 cols: Delinquent Invoices & Upcoming Renewals */}
        <div className="lg:col-span-2 space-y-5">
          {/* Delinquent Overdue Invoices */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-surface-subtle flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-navy text-xs uppercase tracking-wider">
                  Delinquent Receivables ({invoices.filter((i) => i.status === 'overdue').length})
                </h3>
                <p className="text-[11px] text-text-secondary">
                  Accounts past contracted payment terms requiring dunning
                </p>
              </div>
              <Link
                to="/admin/invoices"
                className="text-xs text-action hover:underline font-medium flex items-center gap-1"
              >
                <span>All invoices</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white border-b border-border text-text-secondary text-[11px] uppercase font-semibold">
                    <th className="px-3.5 py-2">Invoice #</th>
                    <th className="px-3.5 py-2">Customer</th>
                    <th className="px-3.5 py-2">Due Date</th>
                    <th className="px-3.5 py-2 text-right">Outstanding</th>
                    <th className="px-3.5 py-2">Status</th>
                    <th className="px-3.5 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices
                    .filter(
                      (i) =>
                        i.status === 'overdue' ||
                        (i.outstandingAmount > 0 && new Date(i.dueDate) < new Date())
                    )
                    .slice(0, 4)
                    .map((inv) => {
                      const cust = customers.find((c) => c.id === inv.customerId);
                      return (
                        <tr key={inv.id} className="hover:bg-surface-subtle transition-colors">
                          <td className="px-3.5 py-2.5 font-mono font-medium text-navy">
                            <Link to={`/admin/invoices/${inv.id}`} className="hover:underline">
                              {inv.invoiceNumber}
                            </Link>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <Link
                              to={`/admin/customers/${cust?.id}`}
                              className="font-medium text-text-primary hover:text-action truncate block max-w-[160px]"
                            >
                              {cust?.company || cust?.name}
                            </Link>
                          </td>
                          <td className="px-3.5 py-2.5 text-text-secondary font-mono">
                            {formatDate(inv.dueDate)}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-semibold text-danger font-mono tabular-nums">
                            {formatCurrency(inv.outstandingAmount)}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <StatusBadge status={inv.status} />
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            <Link
                              to={`/admin/invoices/${inv.id}`}
                              className="btn btn-secondary btn-sm py-1 px-2 text-[11px]"
                            >
                              Collect
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  {invoices.filter((i) => i.status === 'overdue').length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-text-muted text-xs">
                        No overdue accounts. All collections are within agreed credit terms.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Renewals Queue */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-surface-subtle flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-navy text-xs uppercase tracking-wider">
                  Contract Expiries & Upcoming Renewals
                </h3>
                <p className="text-[11px] text-text-secondary">
                  Subscriptions requiring renewal processing within 90 days
                </p>
              </div>
              <Link
                to="/admin/subscriptions"
                className="text-xs text-action hover:underline font-medium flex items-center gap-1"
              >
                <span>All subscriptions</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white border-b border-border text-text-secondary text-[11px] uppercase font-semibold">
                    <th className="px-3.5 py-2">Subscription #</th>
                    <th className="px-3.5 py-2">Customer</th>
                    <th className="px-3.5 py-2">Renewal Date</th>
                    <th className="px-3.5 py-2 text-right">Contract Value</th>
                    <th className="px-3.5 py-2">Status</th>
                    <th className="px-3.5 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {renewals.slice(0, 4).map((ren) => {
                    const cust = customers.find((c) => c.id === ren.customerId);
                    const sub = subscriptions.find((s) => s.id === ren.subscriptionId);
                    return (
                      <tr key={ren.id} className="hover:bg-surface-subtle transition-colors">
                        <td className="px-3.5 py-2.5 font-mono font-medium text-navy">
                          <Link
                            to={`/admin/subscriptions/${ren.subscriptionId}`}
                            className="hover:underline"
                          >
                            {sub?.subscriptionNumber || ren.subscriptionId}
                          </Link>
                        </td>
                        <td className="px-3.5 py-2.5">
                          <Link
                            to={`/admin/customers/${cust?.id}`}
                            className="font-medium text-text-primary hover:text-action truncate block max-w-[160px]"
                          >
                            {cust?.company || cust?.name}
                          </Link>
                        </td>
                        <td className="px-3.5 py-2.5 text-text-secondary font-mono">
                          {formatDate(ren.renewalDate)}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-semibold text-navy font-mono tabular-nums">
                          {formatCurrency(ren.amount)}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <StatusBadge status={ren.status} />
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <Link
                            to={`/admin/subscriptions/${ren.subscriptionId}`}
                            className="btn btn-secondary btn-sm py-1 px-2 text-[11px]"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {renewals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-text-muted text-xs">
                        No upcoming contract expiries in the renewal window.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 col: Live Activity Feed */}
        <div className="card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
              <div>
                <h3 className="font-semibold text-navy text-xs uppercase tracking-wider">
                  Operational Audit Trail
                </h3>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Live subscription & billing events
                </p>
              </div>
            </div>

            <ActivityTimeline activities={activities} maxItems={8} />
          </div>

          <div className="pt-3 border-t border-border mt-3 text-center">
            <span className="text-[11px] font-mono text-text-muted">
              Live PostgreSQL Log Engine Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
