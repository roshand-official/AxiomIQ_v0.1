// src/pages/portal/PortalRenewalsPage.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common';

export default function PortalRenewalsPage() {
  const { user } = useAuth();
  const { renewals, subscriptions, requestRenewal } = useApp();

  const customerId = user?.customerId || 'CUST-001';

  const myRenewals = useMemo(
    () => renewals.filter((r) => r.customerId === customerId),
    [renewals, customerId]
  );

  const mySubs = useMemo(
    () => subscriptions.filter((s) => s.customerId === customerId && s.status === 'active'),
    [subscriptions, customerId]
  );

  const handleQuickRenew = (subId) => {
    requestRenewal(subId, customerId, user?.id);
    toast.success('Renewal request submitted for subscription');
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="pb-1 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-navy">
          Renewal Requests & Status
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Track upcoming contract expiration schedules and submit renewal authorizations.
        </p>
      </div>

      {/* Active Subscriptions eligible for renewal */}
      <div className="card p-4">
        <h3 className="font-semibold text-xs text-navy uppercase tracking-wider mb-2.5">
          Subscriptions Eligible for Forward Renewal
        </h3>

        <div className="space-y-2.5">
          {mySubs.map((sub) => {
            const hasPendingRenewal = myRenewals.some(
              (r) => r.subscriptionId === sub.id && r.status === 'requested'
            );

            return (
              <div
                key={sub.id}
                className="p-3 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-subtle/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-navy text-xs">
                      {sub.subscriptionNumber}
                    </span>
                    <StatusBadge status={sub.status} />
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Renewal Target Date: <span className="font-mono font-semibold text-navy">{formatDate(sub.expiryDate || sub.nextBillingDate)}</span> • Value:{' '}
                    <span className="font-mono tabular-nums font-bold text-navy">{formatCurrency(sub.recurringAmount)}</span>
                  </p>
                </div>

                {hasPendingRenewal ? (
                  <span className="badge badge-warning text-xs py-1 px-2.5">
                    Renewal Requested • Pending Approval
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleQuickRenew(sub.id)}
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Authorize Early Renewal</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Renewal History Log */}
      <div className="card overflow-hidden">
        <div className="p-3 border-b border-border bg-surface-subtle">
          <h3 className="font-semibold text-xs text-navy uppercase tracking-wider">
            Renewal Log & History ({myRenewals.length})
          </h3>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-subtle border-b border-border text-text-secondary uppercase font-semibold text-[11px]">
              <th className="px-3 py-2.5">Request Ref #</th>
              <th className="px-3 py-2.5">Target Date</th>
              <th className="px-3 py-2.5 text-right">Estimated Amount</th>
              <th className="px-3 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {myRenewals.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-text-secondary">
                  No renewal requests logged yet.
                </td>
              </tr>
            ) : (
              myRenewals.map((r) => (
                <tr key={r.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="px-3 py-2.5 font-mono font-medium text-navy">{r.id}</td>
                  <td className="px-3 py-2.5 text-text-secondary font-mono">{formatDate(r.renewalDate)}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-navy font-mono tabular-nums">{formatCurrency(r.amount)}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
