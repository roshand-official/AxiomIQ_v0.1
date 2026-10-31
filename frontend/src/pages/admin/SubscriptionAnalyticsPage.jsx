// src/pages/admin/SubscriptionAnalyticsPage.jsx
import { useState, useMemo } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Users,
  Layers,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { deriveChartMetrics } from '../../utils/analyticsDerivations';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { KPICard } from '../../components/common';
import {
  SubscriptionChart,
  RevenueChart,
  PieChart,
} from '../../components/charts';

export default function SubscriptionAnalyticsPage() {
  const { subscriptions, customers, plans, invoices, payments, products } = useApp();

  const [datePeriod, setDatePeriod] = useState('2026');

  const { subscriptionChartData, revenueChartData } = useMemo(() => {
    return deriveChartMetrics({ invoices, payments, subscriptions, products });
  }, [invoices, payments, subscriptions, products]);

  // Metrics
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const churnedSubs = subscriptions.filter((s) => s.status === 'closed' || s.status === 'expired');

  // Plan distribution pie data
  const planDistribution = useMemo(() => {
    const counts = subscriptions.reduce((acc, s) => {
      acc[s.planId] = (acc[s.planId] || 0) + 1;
      return acc;
    }, {});

    const colorPalette = ['#3B82F6', '#16A36A', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

    return Object.entries(counts).map(([planId, count], idx) => {
      const plan = plans.find((p) => p.id === planId);
      return {
        name: plan?.name || planId,
        value: count,
        color: colorPalette[idx % colorPalette.length],
      };
    });
  }, [subscriptions, plans]);

  // Status breakdown
  const statusDistribution = useMemo(() => {
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

  const retentionRate = Math.round(
    (activeSubs.length / (subscriptions.length || 1)) * 100
  );

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-navy">
            Subscription Lifecycle Analytics
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Cohort retention, plan distribution ratios, recurring revenue velocity, and net seat expansion.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded-lg border border-border text-xs">
          <Calendar className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-text-muted">Scope:</span>
          <select
            value={datePeriod}
            onChange={(e) => setDatePeriod(e.target.value)}
            className="font-semibold text-navy bg-transparent outline-none cursor-pointer"
          >
            <option value="2026">Fiscal Year 2026</option>
            <option value="2025">Fiscal Year 2025</option>
          </select>
        </div>
      </div>

      {/* Integrated Analytics Ribbon */}
      <div className="card overflow-hidden grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
        <div className="p-4 bg-surface">
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
            Retention Ratio
          </span>
          <p className="text-xl font-bold text-success mt-1 font-mono tabular-nums">{retentionRate}%</p>
          <p className="text-[11px] text-text-muted mt-0.5">Healthy Enterprise benchmark</p>
        </div>

        <div className="p-4 bg-surface">
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
            Net Active Subscriptions
          </span>
          <p className="text-xl font-bold text-navy mt-1 font-mono tabular-nums">{formatNumber(activeSubs.length)}</p>
          <p className="text-[11px] text-text-muted mt-0.5">{churnedSubs.length} churned / closed</p>
        </div>

        <div className="p-4 bg-surface">
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
            Active Accounts
          </span>
          <p className="text-xl font-bold text-navy mt-1 font-mono tabular-nums">{formatNumber(customers.length)}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Commercial subscriber orgs</p>
        </div>

        <div className="p-4 bg-surface">
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
            Avg Contract Value (ACV)
          </span>
          <p className="text-xl font-bold text-navy mt-1 font-mono tabular-nums">
            {formatCurrency(
              activeSubs.length > 0
                ? activeSubs.reduce((s, a) => s + a.recurringAmount, 0) / activeSubs.length
                : 0
            )}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">Per active subscription</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subscription Growth Trajectory */}
        <div className="card p-4">
          <h3 className="font-semibold text-xs text-navy uppercase tracking-wider mb-0.5">
            Subscription Lifecycle Growth by Month
          </h3>
          <p className="text-xs text-text-muted mb-3">
            Active, new activations, pauses, and expiration distribution
          </p>
          <SubscriptionChart data={subscriptionChartData} height={280} />
        </div>

        {/* Revenue Expansion Trend */}
        <div className="card p-4">
          <h3 className="font-semibold text-xs text-navy uppercase tracking-wider mb-0.5">
            Recurring Revenue Velocity
          </h3>
          <p className="text-xs text-text-muted mb-3">
            Monthly invoiced vs collected revenue expansion
          </p>
          <RevenueChart data={revenueChartData} height={280} />
        </div>
      </div>

      {/* Donut Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Plan Distribution */}
        <div className="card p-4">
          <h3 className="font-semibold text-xs text-navy uppercase tracking-wider mb-0.5">
            Contract Volume by Subscription Plan
          </h3>
          <p className="text-xs text-text-muted mb-3">
            Distribution of clients across monthly, annual, and quarterly tiers
          </p>
          <PieChart data={planDistribution} height={240} />
        </div>

        {/* Status Distribution */}
        <div className="card p-4">
          <h3 className="font-semibold text-xs text-navy uppercase tracking-wider mb-0.5">
            Portfolio Health & Status Breakdown
          </h3>
          <p className="text-xs text-text-muted mb-3">
            Percentage split of active, confirmed, paused, and expired contracts
          </p>
          <PieChart data={statusDistribution} height={240} />
        </div>
      </div>
    </div>
  );
}
