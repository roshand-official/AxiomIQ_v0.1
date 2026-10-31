// src/pages/admin/AdminDashboard.jsx
import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RefreshCw,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  ExternalLink,
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
  KPICard,
  StatusBadge,
  ActivityTimeline,
  Tabs,
} from '../../components/common';
import {
  RevenueChart,
  SubscriptionChart,
  PaymentChart,
  PieChart,
} from '../../components/charts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { subscriptions, invoices, payments, customers, activities, renewals, billingEvents, products } = useApp();

  const [timeRange, setTimeRange] = useState('30d');
  const [activeChartTab, setActiveChartTab] = useState('revenue');

  // Derive dynamic chart data from live state
  const { revenueChartData, subscriptionChartData, paymentChartData } = useMemo(() => {
    return deriveChartMetrics({ invoices, payments, subscriptions, products });
  }, [invoices, payments, subscriptions, products]);

  // ─── Calculate Live KPIs from Application State ─────────────────────────────
  const metrics = useMemo(() => {
    // 1. Active Subscriptions
    const activeSubs = subscriptions.filter((s) => s.status === 'active');

    // 2. MRR (Monthly Recurring Revenue)
    // Monthly subscriptions = recurringAmount; Yearly subscriptions = recurringAmount / 12
    const mrr = activeSubs.reduce((acc, sub) => {
      // If plan is yearly or amount > 20000, normalize if needed or use recurringAmount based on plan
      // For AxiomIQ: Monthly plans recurringAmount is monthly; Annual plans are annualized / 12
      const isAnnual = sub.planId === 'PLAN-002' || sub.planId === 'PLAN-005';
      const monthlyVal = isAnnual ? sub.recurringAmount / 12 : sub.recurringAmount;
      return acc + monthlyVal;
    }, 0);

    // 3. ARR
    const arr = mrr * 12;

    // 4. Revenue Collected (Total completed payments)
    const revenueCollected = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    // 5. Overdue Invoices
    const overdueInvoices = invoices.filter((i) => i.status === 'overdue' || (i.outstandingAmount > 0 && new Date(i.dueDate) < new Date()));

    // 6. Outstanding Payments
    const outstandingPayments = invoices
      .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.outstandingAmount, 0);

    // 7. Upcoming Renewals (next 90 days)
    const upcomingRenewals = renewals.filter((r) => r.status === 'pending');

    // 8. Billing Failures
    const billingFailures = billingEvents.filter((e) => e.type === 'billing_failed');

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
    };
  }, [subscriptions, invoices, payments, renewals, billingEvents]);

  // Subscription Status breakdown for Donut Chart
  const subscriptionStatusData = useMemo(() => {
    const counts = subscriptions.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {});

    const colorMap = {
      active: '#16A36A',
      confirmed: '#3B82F6',
      draft: '#9CA3AF',
      paused: '#F59E0B',
      expired: '#DC5252',
      closed: '#6B7280',
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
          title: 'Billing Execution Failed',
          desc: e.message,
          actionLabel: 'Resolve in Billing',
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
          desc: `${cust?.company || cust?.name} has ₹${i.outstandingAmount.toLocaleString('en-IN')} overdue (${getDaysOverdue(i.dueDate)} days).`,
          actionLabel: 'View Invoice',
          link: `/admin/invoices/${i.id}`,
        });
      });

    return items.slice(0, 4);
  }, [billingEvents, invoices, customers]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Executive Dashboard
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Real-time subscription performance, revenue operations, and cash collection.
          </p>
        </div>

        {/* Date Filter & Quick Actions */}
        <div className="flex items-center gap-2.5">
          <div className="bg-white border border-border rounded-lg p-1 flex items-center text-xs">
            {['7d', '30d', '90d', '1y'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setTimeRange(period)}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${timeRange === period
                    ? 'bg-action text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>

          <Link to="/admin/billing" className="btn btn-primary btn-sm">
            <CreditCard className="w-4 h-4" />
            <span>Run Billing</span>
          </Link>
        </div>
      </div>

      {/* Attention Required Banner (if any) */}
      {attentionItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-danger font-semibold text-sm mb-2.5">
            <AlertCircle className="w-4 h-4" />
            <span>Immediate Attention Required ({attentionItems.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-lg border border-rose-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-text-primary">{item.title}</p>
                  <p className="text-text-secondary text-[11px] mt-0.5">{item.desc}</p>
                </div>
                <Link
                  to={item.link}
                  className="btn btn-secondary btn-sm flex-shrink-0 text-[11px] py-1"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Subscriptions"
          value={formatNumber(metrics.activeSubsCount)}
          change={`+${metrics.totalSubsCount - metrics.activeSubsCount} total in system`}
          trend="up"
          color="success"
          icon={RefreshCw}
        />
        <KPICard
          title="Monthly Recurring Revenue"
          value={formatCurrency(metrics.mrr)}
          change="Normalized monthly run-rate"
          trend="up"
          color="action"
          icon={TrendingUp}
        />
        <KPICard
          title="Revenue Collected"
          value={formatCurrency(metrics.revenueCollected)}
          change="Total paid receipts"
          trend="up"
          color="success"
          icon={CreditCard}
        />
        <KPICard
          title="Overdue Invoices"
          value={formatNumber(metrics.overdueInvoicesCount)}
          change={`${formatCurrency(metrics.outstandingPayments)} unpaid total`}
          trend="down"
          color="danger"
          icon={AlertTriangle}
        />
      </div>

      {/* Secondary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-text-secondary font-medium">ARR Estimate</p>
          <p className="text-lg font-bold text-navy mt-1">{formatCurrency(metrics.arr)}</p>
          <p className="text-[11px] text-text-muted mt-0.5">MRR × 12 annualized</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-text-secondary font-medium">Outstanding Balances</p>
          <p className="text-lg font-bold text-warning mt-1">{formatCurrency(metrics.outstandingPayments)}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Pending collection</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-text-secondary font-medium">Upcoming Renewals</p>
          <p className="text-lg font-bold text-navy mt-1">{metrics.upcomingRenewalsCount}</p>
          <p className="text-[11px] text-text-muted mt-0.5">In renewal queue</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-text-secondary font-medium">Billing Failures</p>
          <p className="text-lg font-bold text-danger mt-1">{metrics.billingFailuresCount}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Requires retry</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (2 cols) */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-semibold text-navy text-sm">
                Financial Operations & Growth
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Multi-metric historical trend for fiscal year 2026
              </p>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveChartTab('revenue')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${activeChartTab === 'revenue'
                    ? 'bg-white text-navy shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                Revenue
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('subscriptions')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${activeChartTab === 'subscriptions'
                    ? 'bg-white text-navy shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                Subscriptions
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('payments')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${activeChartTab === 'payments'
                    ? 'bg-white text-navy shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                Collections
              </button>
            </div>
          </div>

          {activeChartTab === 'revenue' && (
            <RevenueChart data={revenueChartData} height={320} />
          )}
          {activeChartTab === 'subscriptions' && (
            <SubscriptionChart data={subscriptionChartData} height={320} />
          )}
          {activeChartTab === 'payments' && (
            <PaymentChart data={paymentChartData} height={320} />
          )}
        </div>

        {/* Subscription Distribution Donut (1 col) */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-navy text-sm">
              Subscription Status Split
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Portfolio distribution by lifecycle phase
            </p>
            <div className="mt-2">
              <PieChart data={subscriptionStatusData} height={240} />
            </div>
          </div>

          <div className="pt-4 border-t border-border grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-gray-50">
              <span className="text-text-secondary">Active Ratio</span>
              <span className="font-bold text-success">
                {Math.round((metrics.activeSubsCount / metrics.totalSubsCount) * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-gray-50">
              <span className="text-text-secondary">Total Managed</span>
              <span className="font-bold text-navy">{metrics.totalSubsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tables & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Overdue Invoices & Upcoming Renewals Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Invoices Card */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-navy text-sm">
                  Overdue Invoices
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Receivables past payment terms requiring immediate dunning
                </p>
              </div>
              <Link
                to="/admin/invoices"
                className="text-xs text-action hover:underline font-medium flex items-center gap-1"
              >
                <span>View all invoices</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-border text-text-secondary uppercase font-semibold">
                    <th className="px-4 py-2.5">Invoice #</th>
                    <th className="px-4 py-2.5">Customer</th>
                    <th className="px-4 py-2.5">Due Date</th>
                    <th className="px-4 py-2.5 text-right">Outstanding</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices
                    .filter((i) => i.status === 'overdue' || (i.outstandingAmount > 0 && new Date(i.dueDate) < new Date()))
                    .slice(0, 4)
                    .map((inv) => {
                      const cust = customers.find((c) => c.id === inv.customerId);
                      return (
                        <tr key={inv.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-mono font-medium text-navy">
                            <Link to={`/admin/invoices/${inv.id}`} className="hover:underline">
                              {inv.invoiceNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <Link to={`/admin/customers/${cust?.id}`} className="font-medium hover:text-action">
                              {cust?.company || cust?.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-text-secondary">
                            {formatDate(inv.dueDate)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-danger">
                            {formatCurrency(inv.outstandingAmount)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={inv.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
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
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Renewals Card */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-navy text-sm">
                  Upcoming Renewals
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Subscriptions requiring renewal processing or follow-up
                </p>
              </div>
              <Link
                to="/admin/subscriptions"
                className="text-xs text-action hover:underline font-medium flex items-center gap-1"
              >
                <span>View all subscriptions</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-border text-text-secondary uppercase font-semibold">
                    <th className="px-4 py-2.5">Subscription #</th>
                    <th className="px-4 py-2.5">Customer</th>
                    <th className="px-4 py-2.5">Renewal Date</th>
                    <th className="px-4 py-2.5 text-right">Value</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {renewals.slice(0, 4).map((ren) => {
                    const cust = customers.find((c) => c.id === ren.customerId);
                    const sub = subscriptions.find((s) => s.id === ren.subscriptionId);
                    return (
                      <tr key={ren.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono font-medium text-navy">
                          <Link to={`/admin/subscriptions/${ren.subscriptionId}`} className="hover:underline">
                            {sub?.subscriptionNumber || ren.subscriptionId}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/admin/customers/${cust?.id}`} className="font-medium hover:text-action">
                            {cust?.company || cust?.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {formatDate(ren.renewalDate)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-navy">
                          {formatCurrency(ren.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={ren.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
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
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 col: Live Activity Feed */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div>
              <h3 className="font-semibold text-navy text-sm">
                Operational Audit Log
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Real-time subscription & billing events
              </p>
            </div>
          </div>

          <ActivityTimeline activities={activities} maxItems={8} />
        </div>
      </div>
    </div>
  );
}
