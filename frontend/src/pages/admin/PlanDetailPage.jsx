// src/pages/admin/PlanDetailPage.jsx
import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common';

export default function PlanDetailPage() {
  const { id } = useParams();
  const { plans, subscriptions, customers } = useApp();

  const plan = plans.find((p) => p.id === id);

  const associatedSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => s.planId === id);
  }, [subscriptions, id]);

  if (!plan) {
    return (
      <div className="py-16 text-center card">
        <h2 className="text-lg font-bold text-navy">Plan Not Found</h2>
        <Link to="/admin/plans" className="btn btn-primary btn-sm mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Plans</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/plans"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-action font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Subscription Plans</span>
        </Link>
      </div>

      {/* Plan Header Card */}
      <div className="card p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-action-subtle text-action border border-action/20 flex items-center justify-center font-bold text-base flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-navy">{plan.name}</h1>
                <StatusBadge status={plan.status} />
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Recurrence Cadence: <span className="font-semibold capitalize text-action font-mono">{plan.billingFrequency}</span> (Interval: Every {plan.billingInterval} units)
              </p>
              <p className="text-xs text-text-secondary mt-1 max-w-xl leading-relaxed">
                {plan.description || 'No marketing description provided.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-surface-subtle p-3 rounded-lg border border-border">
            <div>
              <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">
                Min Quantity
              </p>
              <p className="text-base font-bold text-navy mt-0.5 font-mono tabular-nums">
                {plan.minimumQuantity} units
              </p>
            </div>
            <div className="w-px h-7 bg-border" />
            <div>
              <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">
                Active Contracts
              </p>
              <p className="text-base font-bold text-success mt-0.5 font-mono tabular-nums">
                {associatedSubscriptions.filter((s) => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Governance & Associated Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Governance card */}
        <div className="card p-4 space-y-3">
          <h3 className="font-semibold text-xs text-navy uppercase tracking-wider pb-2 border-b border-border">
            Lifecycle Governance Policy
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Allow Early Cancellation</span>
              {plan.allowEarlyClose ? (
                <span className="flex items-center gap-1 font-semibold text-success">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Permitted
                </span>
              ) : (
                <span className="flex items-center gap-1 font-semibold text-danger">
                  <XCircle className="w-3.5 h-3.5" /> Locked
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Customer Pause Permitted</span>
              {plan.allowPause ? (
                <span className="flex items-center gap-1 font-semibold text-success">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Permitted
                </span>
              ) : (
                <span className="flex items-center gap-1 font-semibold text-text-muted">
                  <XCircle className="w-3.5 h-3.5" /> Disabled
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Auto-Renewal Eligible</span>
              {plan.allowRenewal ? (
                <span className="flex items-center gap-1 font-semibold text-success">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1 font-semibold text-text-muted">
                  <XCircle className="w-3.5 h-3.5" /> Disabled
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-text-secondary">Available Since</span>
              <span className="font-mono text-xs font-medium text-navy">{formatDate(plan.availableFrom)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Expires On</span>
              <span className="font-mono text-xs font-medium text-navy">
                {plan.availableUntil ? formatDate(plan.availableUntil) : 'Ongoing indefinitely'}
              </span>
            </div>
          </div>
        </div>

        {/* Subscriptions list */}
        <div className="card p-4 lg:col-span-2 overflow-hidden">
          <h3 className="font-semibold text-xs text-navy uppercase tracking-wider mb-0.5">
            Active Contracts on this Plan ({associatedSubscriptions.length})
          </h3>
          <p className="text-xs text-text-muted mb-3">
            Customers currently subscribed under this recurrence arrangement
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-text-secondary font-semibold uppercase text-[11px]">
                  <th className="px-3 py-2.5">Subscription #</th>
                  <th className="px-3 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Start Date</th>
                  <th className="px-3 py-2.5 text-right">Recurring Amount</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {associatedSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-secondary">
                      No subscriptions currently assigned to this plan.
                    </td>
                  </tr>
                ) : (
                  associatedSubscriptions.map((sub) => {
                    const cust = customers.find((c) => c.id === sub.customerId);
                    return (
                      <tr key={sub.id} className="hover:bg-surface-subtle/50 transition-colors">
                        <td className="px-3 py-2.5 font-mono font-medium text-navy">
                          <Link to={`/admin/subscriptions/${sub.id}`} className="hover:underline">
                            {sub.subscriptionNumber}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-text-primary">
                          <Link to={`/admin/customers/${cust?.id}`} className="hover:text-action">
                            {cust?.company || cust?.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-text-secondary font-mono">
                          {formatDate(sub.startDate)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-navy font-mono tabular-nums">
                          {formatCurrency(sub.recurringAmount)}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={sub.status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
